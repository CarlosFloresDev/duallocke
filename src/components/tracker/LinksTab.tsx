import { useMemo, useState, type FormEvent } from 'react';
import { ENCOUNTERS } from '../../data/encounters';
import type { Game } from '../../data/games';
import { api } from '../../lib/api';
import { displayName, toSlug } from '../../lib/pokeapi';
import type { LinkStatus, PokemonLink, Profile, Run, Slot } from '../../lib/types';
import EvolutionTree from './EvolutionTree';
import PokeImage from './PokeImage';
import { Alert, Button, Card, EmptyState } from './ui';

const STATUS: Record<LinkStatus, { label: string; className: string }> = {
  alive: { label: 'Vivo', className: 'border-poke-green/50 text-poke-green bg-poke-green/10' },
  box: { label: 'En el PC', className: 'border-dim/40 text-dim bg-white/5' },
  dead: { label: 'Muerto', className: 'border-poke-red/50 text-poke-red bg-poke-red/10' },
};

interface Props {
  run: Run;
  game: Game;
  links: PokemonLink[];
  slot: Slot;
  me: Profile;
  partner: Profile | null;
  onChange: () => void;
}

export default function LinksTab({ run, game, links, slot, me, partner, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [route, setRoute] = useState('');
  const [customRoute, setCustomRoute] = useState('');
  const [pokemon, setPokemon] = useState('');
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const partnerSlot: Slot = slot === 'player1' ? 'player2' : 'player1';
  const mineFilled = (l: PokemonLink) => Boolean(l[`${slot}_pokemon`]);

  const sorted = useMemo(() => {
    const order = new Map(game.routes.map((r) => [r.name, r.order]));
    return [...links].sort((a, b) => (order.get(a.route_name) ?? 999) - (order.get(b.route_name) ?? 999));
  }, [links, game.routes]);

  const used = new Set(links.filter(mineFilled).map((l) => l.route_name));
  const pendingForMe = links.filter((l) => !mineFilled(l)).map((l) => l.route_name);
  const routeOptions = game.routes.filter((r) => !used.has(r.name));
  const routeId = game.routes.find((r) => r.name === route)?.id;
  const encounters = routeId ? ENCOUNTERS[run.game]?.[routeId] ?? [] : [];

  function reset() {
    setRoute('');
    setCustomRoute('');
    setPokemon('');
    setNickname('');
    setError('');
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const routeName = (route === '__custom' ? customRoute : route).trim();
    const slug = toSlug(pokemon);
    if (!routeName || !slug) return;
    setSaving(true);
    setError('');
    try {
      await api.saveMyPokemon(run.id, routeName, slug, nickname.trim() || null);
      reset();
      setShowForm(false);
      onChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-dim">
          {links.length} {links.length === 1 ? 'ruta registrada' : 'rutas registradas'}
          {pendingForMe.length ? <span className="text-poke-yellow"> · te faltan {pendingForMe.length}</span> : null}
        </p>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          onClick={() => {
            setShowForm(!showForm);
            reset();
          }}
        >
          {showForm ? 'Cancelar' : 'Registrar captura'}
        </Button>
      </div>

      {showForm ? (
        <Card className="anim-pop p-6">
          <form onSubmit={submit} className="grid gap-6">
            <div className="grid gap-2">
              <label htmlFor="route" className="font-pixel text-[9px] text-dim">
                RUTA
              </label>
              <select
                id="route"
                required
                value={route}
                onChange={(e) => {
                  setRoute(e.target.value);
                  setPokemon('');
                }}
                className="rounded border border-line bg-ink px-3 py-3 text-fg focus:border-poke-yellow focus:outline-none"
              >
                <option value="">Selecciona una ruta</option>
                {pendingForMe.length ? (
                  <optgroup label="Tu compañero ya capturó aquí">
                    {pendingForMe.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label={game.name}>
                  {routeOptions
                    .filter((r) => !pendingForMe.includes(r.name))
                    .map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                </optgroup>
                <option value="__custom">Otra ubicación</option>
              </select>
              {route === '__custom' ? (
                <input
                  required
                  maxLength={60}
                  placeholder="Nombre de la ubicación"
                  value={customRoute}
                  onChange={(e) => setCustomRoute(e.target.value)}
                  className="rounded border border-line bg-ink px-3 py-3 text-fg focus:border-poke-yellow focus:outline-none"
                />
              ) : null}
            </div>

            {encounters.length ? (
              <div className="grid gap-3">
                <p className="font-pixel text-[9px] text-dim">ENCUENTROS EN ESTA RUTA</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                  {encounters.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setPokemon(name)}
                      className={`grid justify-items-center gap-1 rounded border p-2 transition hover:-translate-y-1 ${toSlug(pokemon) === name ? 'border-poke-yellow bg-poke-yellow/10' : 'border-line hover:border-[#444]'}`}
                    >
                      <PokeImage name={name} size={48} />
                      <span className="text-center text-xs text-fg">{displayName(name)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="pokemon" className="font-pixel text-[9px] text-dim">
                  POKÉMON
                </label>
                <input
                  id="pokemon"
                  required
                  maxLength={40}
                  value={pokemon}
                  onChange={(e) => setPokemon(e.target.value)}
                  placeholder="Nombre en inglés: pikachu, nidoran-m"
                  className="rounded border border-line bg-ink px-3 py-3 text-fg focus:border-poke-yellow focus:outline-none"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="nick" className="font-pixel text-[9px] text-dim">
                  APODO (OPCIONAL)
                </label>
                <input
                  id="nick"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="rounded border border-line bg-ink px-3 py-3 text-fg focus:border-poke-yellow focus:outline-none"
                />
              </div>
            </div>

            {pokemon.trim().length > 2 ? <EvolutionTree name={pokemon} onSelect={setPokemon} /> : null}

            {error ? <Alert>{error}</Alert> : null}
            <Button type="submit" loading={saving} className="justify-self-start">
              Guardar captura
            </Button>
          </form>
        </Card>
      ) : null}

      {sorted.length === 0 && !showForm ? (
        <EmptyState title="Sin capturas todavía" action={<Button onClick={() => setShowForm(true)}>Registrar captura</Button>}>
          Registra el primer Pokémon de cada ruta. Tu compañero registra el suyo y quedan vinculados.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {sorted.map((l, idx) => {
            const complete = Boolean(l.player1_pokemon && l.player2_pokemon);
            return (
              <li key={l.id} style={{ ['--d' as string]: `${Math.min(idx, 10) * 50}ms` }} className={`anim-pop lift grid gap-4 rounded-md border bg-panel p-5 ${l.status === 'dead' ? 'border-poke-red/30 opacity-70' : 'border-line'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-pixel text-[10px] text-fg">{l.route_name}</p>
                  {complete ? (
                    <span className={`rounded border px-2 py-1 font-pixel text-[8px] ${STATUS[l.status].className}`}>{STATUS[l.status].label}</span>
                  ) : (
                    <span className="rounded border border-poke-yellow/30 px-2 py-1 font-pixel text-[8px] text-poke-yellow">Falta un jugador</span>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Side pokemon={l[`${slot}_pokemon`]} nickname={l[`${slot}_nickname`]} owner={me} dead={l.status === 'dead'} />
                  <span className="font-pixel text-xs text-faint" aria-hidden="true">{complete ? '⇄' : '…'}</span>
                  <Side pokemon={l[`${partnerSlot}_pokemon`]} nickname={l[`${partnerSlot}_nickname`]} owner={partner} dead={l.status === 'dead'} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(Object.keys(STATUS) as LinkStatus[]).map((s) => (
                    <button
                      key={s}
                      disabled={!complete || l.status === s}
                      onClick={async () => {
                        if (s === 'dead' && !confirm('¿Marcar este vínculo como muerto? Ambos jugadores pierden una vida.')) return;
                        await api.setLinkStatus(run.id, l.id, s);
                        onChange();
                      }}
                      className={`rounded border px-3 py-2 font-pixel text-[8px] transition disabled:cursor-default ${l.status === s && complete ? STATUS[s].className : 'border-line text-dim hover:text-fg disabled:opacity-40'}`}
                    >
                      {STATUS[s].label}
                    </button>
                  ))}
                  {!complete ? (
                    <button
                      className="ml-auto text-xs text-faint hover:text-poke-red"
                      onClick={async () => {
                        if (!confirm('¿Borrar este registro?')) return;
                        await api.deleteLink(run.id, l.id);
                        onChange();
                      }}
                    >
                      Borrar
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Side({ pokemon, nickname, owner, dead }: { pokemon: string | null; nickname: string | null; owner: Profile | null; dead: boolean }) {
  return (
    <div className="grid justify-items-center gap-1 text-center">
      <PokeImage name={pokemon} size={72} className={dead ? 'grayscale' : ''} />
      <p className="text-sm font-bold text-fg">{pokemon ? displayName(pokemon) : 'Sin registrar'}</p>
      {nickname ? <p className="text-xs text-dim">"{nickname}"</p> : null}
      <p className="text-xs" style={{ color: owner?.avatar_color ?? '#767676' }}>
        {owner?.username ?? 'Compañero'}
      </p>
    </div>
  );
}
