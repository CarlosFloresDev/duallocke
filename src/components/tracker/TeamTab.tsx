import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { displayName } from '../../lib/pokeapi';
import { MAX_TEAM_SIZE, type PokemonLink, type Profile, type Run, type Slot } from '../../lib/types';
import PokeImage from './PokeImage';
import { Alert, Button, EmptyState } from './ui';

interface Props {
  run: Run;
  links: PokemonLink[];
  slot: Slot;
  me: Profile;
  partner: Profile | null;
  onChange: () => void;
}

/**
 * Active teams. In a Soul Link both members of a link should be in the team together,
 * so the app warns when a linked partner Pokémon is missing from the other player's team.
 */
export default function TeamTab({ run, links, slot, me, partner, onChange }: Props) {
  const partnerSlot: Slot = slot === 'player1' ? 'player2' : 'player1';
  const available = links.filter((l) => l.status !== 'dead' && l[`${slot}_pokemon`]);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) setSelected(links.filter((l) => l[`${slot}_in_team`]).map((l) => l.id));
  }, [links, slot, editing]);

  const myTeam = links.filter((l) => l[`${slot}_in_team`] && l[`${slot}_pokemon`]);
  const partnerTeam = links.filter((l) => l[`${partnerSlot}_in_team`] && l[`${partnerSlot}_pokemon`]);
  const unpaired = myTeam.filter((l) => l[`${partnerSlot}_pokemon`] && !l[`${partnerSlot}_in_team`]);

  if (available.length === 0 && myTeam.length === 0) {
    return <EmptyState title="Sin Pokémon disponibles">Registra capturas en la pestaña Vínculos para armar tu equipo.</EmptyState>;
  }

  return (
    <div className="grid gap-8">
      {unpaired.length && partner ? (
        <Alert tone="info">
          Regla Soul Link: {unpaired.map((l) => displayName(l[`${slot}_pokemon`]!)).join(', ')} {unpaired.length === 1 ? 'está' : 'están'} en tu equipo pero su pareja no está en el equipo de {partner.username}.
        </Alert>
      ) : null}

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-pixel text-[11px]" style={{ color: me.avatar_color }}>
            Tu equipo ({editing ? selected.length : myTeam.length}/{MAX_TEAM_SIZE})
          </h2>
          {editing ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button
                loading={saving}
                onClick={async () => {
                  setSaving(true);
                  setError('');
                  try {
                    await api.saveTeam(run.id, selected);
                    setEditing(false);
                    onChange();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Guardar equipo
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Editar equipo
            </Button>
          )}
        </div>
        {error ? <Alert>{error}</Alert> : null}

        {editing ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {available.map((l) => {
              const on = selected.includes(l.id);
              const full = !on && selected.length >= MAX_TEAM_SIZE;
              return (
                <li key={l.id}>
                  <button
                    disabled={full}
                    onClick={() => setSelected(on ? selected.filter((id) => id !== l.id) : [...selected, l.id])}
                    aria-pressed={on}
                    className={`grid w-full justify-items-center gap-1 rounded border p-3 transition disabled:opacity-40 ${on ? 'border-poke-yellow bg-poke-yellow/10' : 'border-line bg-panel hover:border-[#444]'}`}
                  >
                    <PokeImage name={l[`${slot}_pokemon`]} size={56} />
                    <span className="text-xs text-fg">{displayName(l[`${slot}_pokemon`]!)}</span>
                    <span className="text-[11px] text-faint">{l.route_name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <TeamGrid links={myTeam} slot={slot} />
        )}
      </section>

      {partner ? (
        <section className="grid gap-4">
          <h2 className="font-pixel text-[11px]" style={{ color: partner.avatar_color }}>
            Equipo de {partner.username} ({partnerTeam.length}/{MAX_TEAM_SIZE})
          </h2>
          <TeamGrid links={partnerTeam} slot={partnerSlot} />
        </section>
      ) : null}
    </div>
  );
}

function TeamGrid({ links, slot }: { links: PokemonLink[]; slot: Slot }) {
  return (
    <ul className="grid grid-cols-3 gap-3 md:grid-cols-6">
      {Array.from({ length: MAX_TEAM_SIZE }, (_, i) => {
        const l = links[i];
        return (
          <li key={i} className="grid min-h-32 justify-items-center content-center gap-1 rounded border border-line bg-panel p-3 text-center">
            {l ? (
              <>
                <PokeImage name={l[`${slot}_pokemon`]} size={56} />
                <span className="text-xs text-fg">{l[`${slot}_nickname`] ?? displayName(l[`${slot}_pokemon`]!)}</span>
                <span className="text-[11px] text-faint">{l.route_name}</span>
              </>
            ) : (
              <span className="font-pixel text-[9px] text-faint">Vacío</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
