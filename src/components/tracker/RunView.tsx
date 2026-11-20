import { useMemo, useState } from 'react';
import { useRunData } from '../../hooks/useRunData';
import { api } from '../../lib/api';
import type { Profile, Run, Slot } from '../../lib/types';
import { INFINITE_LIVES } from '../../lib/types';
import { gameById } from './Dashboard';
import LinksTab from './LinksTab';
import TeamTab from './TeamTab';
import { Alert, Button, Hearts, Loading } from './ui';

type Tab = 'links' | 'gyms' | 'team';

/** Two players can pick the same profile color; keep them distinguishable on screen. */
function playerColors(mine: string, partner?: string) {
  if (!partner || partner.toLowerCase() !== mine.toLowerCase()) return { me: mine, partner: partner ?? '#4F9DDE' };
  return { me: mine, partner: mine.toLowerCase() === '#4f9dde' ? '#FFD60A' : '#4F9DDE' };
}

export default function RunView({ initial, profile, onBack }: { initial: Run; profile: Profile; onBack: () => void }) {
  const { run, gyms, links, players, loading, error, refresh } = useRunData(initial);
  const [tab, setTab] = useState<Tab>('links');
  const [copied, setCopied] = useState(false);

  const slot: Slot = run.player1_id === profile.id ? 'player1' : 'player2';
  const partnerSlot: Slot = slot === 'player1' ? 'player2' : 'player1';
  const partnerId = slot === 'player1' ? run.player2_id : run.player1_id;
  const partner = partnerId ? players[partnerId] ?? null : null;
  const colors = playerColors(profile.avatar_color, partner?.avatar_color);
  const game = gameById(run.game);

  const stats = useMemo(() => {
    const mine = gyms.filter((g) => g.player_id === profile.id).length;
    const theirs = partnerId ? gyms.filter((g) => g.player_id === partnerId).length : 0;
    return {
      myGyms: mine,
      partnerGyms: theirs,
      routes: links.length,
      deaths: links.filter((l) => l.status === 'dead').length,
    };
  }, [gyms, links, profile.id, partnerId]);

  if (loading) return <Loading label="Cargando run" />;

  const myLives = run[`${slot}_lives`];
  const partnerLives = run[`${partnerSlot}_lives`];
  const finished = run.status === 'finished';

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-3">
          <Button variant="ghost" className="justify-self-start !px-0" onClick={onBack}>
            ← Mis runs
          </Button>
          <h1 className="font-pixel text-base leading-relaxed" style={{ color: game?.color }}>
            {game?.name ?? run.game}
          </h1>
          <p className="text-sm text-dim">
            <span style={{ color: colors.me }}>{profile.username}</span>
            <span className="mx-2 text-faint">y</span>
            {partner ? <span style={{ color: colors.partner }}>{partner.username}</span> : <span className="italic">esperando compañero</span>}
          </p>
        </div>
        {run.player1_id === profile.id ? (
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm('¿Eliminar esta run para los dos jugadores? No se puede deshacer.')) return;
              await api.deleteRun(run.id);
              onBack();
            }}
          >
            Eliminar run
          </Button>
        ) : null}
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {finished ? <Alert>La run terminó: un jugador se quedó sin vidas. Puedes revivir un vínculo si fue un error.</Alert> : null}

      {run.status === 'waiting' ? (
        <div className="flex flex-wrap items-center gap-4 rounded-md border border-poke-yellow/30 bg-poke-yellow/5 px-5 py-4">
          <span className="text-sm text-dim">Comparte este código con tu compañero:</span>
          <span className="font-pixel text-xl tracking-[0.3em] text-poke-yellow">{run.invite_code}</span>
          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(run.invite_code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Tus gimnasios" value={`${stats.myGyms}/${game?.gyms.length ?? 8}`} color={colors.me} />
        <Stat label={`Gimnasios ${partner?.username ?? 'P2'}`} value={`${stats.partnerGyms}/${game?.gyms.length ?? 8}`} color={colors.partner} />
        <Stat label="Rutas" value={String(stats.routes)} />
        <Stat label="Muertes" value={String(stats.deaths)} color={stats.deaths ? '#E63946' : undefined} />
        <div className="grid gap-2 bg-panel px-4 py-3">
          <dt className="font-pixel text-[8px] text-faint">Tus vidas</dt>
          <dd><Hearts value={myLives} max={run.lives_per_player} color={colors.me} /></dd>
        </div>
        <div className="grid gap-2 bg-panel px-4 py-3">
          <dt className="font-pixel text-[8px] text-faint">Vidas {partner?.username ?? 'P2'}</dt>
          <dd>{run.lives_per_player >= INFINITE_LIVES || partner ? <Hearts value={partnerLives} max={run.lives_per_player} color={colors.partner} /> : <span className="text-dim">-</span>}</dd>
        </div>
      </dl>

      <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {(
          [
            ['links', 'Vínculos'],
            ['gyms', 'Gimnasios'],
            ['team', 'Equipo'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-5 py-3 font-pixel text-[10px] transition ${tab === id ? 'border-poke-yellow text-poke-yellow' : 'border-transparent text-dim hover:text-fg'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'links' && game ? (
        <LinksTab run={run} game={game} links={links} slot={slot} me={{ ...profile, avatar_color: colors.me }} partner={partner ? { ...partner, avatar_color: colors.partner } : null} onChange={refresh} />
      ) : null}

      {tab === 'gyms' && game ? (
        <ul className="grid gap-3">
          {game.gyms.map((g) => {
            const mine = gyms.some((p) => p.player_id === profile.id && p.gym_number === g.number);
            const theirs = !!partnerId && gyms.some((p) => p.player_id === partnerId && p.gym_number === g.number);
            return (
              <li key={g.number} className={`flex flex-wrap items-center gap-4 rounded-md border bg-panel px-5 py-4 ${mine && theirs ? 'border-poke-green/40' : 'border-line'}`}>
                <span className="grid size-10 place-items-center rounded bg-panel-2 font-pixel text-xs text-poke-yellow">{g.number}</span>
                <div className="min-w-48 flex-1">
                  <p className="font-bold text-fg">{g.leader} <span className="font-normal text-dim">· {g.type}</span></p>
                  <p className="text-sm text-dim">{g.badge} · {g.location} · <span className="text-faint">{g.levels}</span></p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: colors.me }}>
                  <input
                    type="checkbox"
                    className="poke-check"
                    checked={mine}
                    onChange={async (e) => {
                      await api.setGym(run.id, g.number, e.target.checked);
                      refresh();
                    }}
                  />
                  Tú
                </label>
                <span className="flex items-center gap-2 text-sm" style={{ color: colors.partner }}>
                  <input type="checkbox" className="poke-check" checked={theirs} disabled aria-label={`${partner?.username ?? 'Compañero'} venció a ${g.leader}`} />
                  {partner?.username ?? 'P2'}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {tab === 'team' ? (
        <TeamTab run={run} links={links} slot={slot} me={{ ...profile, avatar_color: colors.me }} partner={partner ? { ...partner, avatar_color: colors.partner } : null} onChange={refresh} />
      ) : null}
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="grid gap-2 bg-panel px-4 py-3">
      <dt className="truncate font-pixel text-[8px] text-faint">{label}</dt>
      <dd className="font-pixel text-base" style={{ color: color ?? '#f0f0f0' }}>
        {value}
      </dd>
    </div>
  );
}
