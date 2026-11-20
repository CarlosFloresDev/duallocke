import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Profile, Run, RunWithPlayers } from '../../lib/types';
import { GAMES } from '../../data/games';
import RunView from './RunView';
import { Alert, Button, Card, EmptyState, Field, Hearts, Loading } from './ui';

type View = { name: 'list' } | { name: 'create' } | { name: 'join' } | { name: 'account' } | { name: 'run'; run: Run };

const LIVES_OPTIONS = [
  { value: 1, label: '1 vida', desc: 'Hardcore: una muerte y se acaba.' },
  { value: 2, label: '2 vidas', desc: 'Un poco de margen.' },
  { value: 3, label: '3 vidas', desc: 'Equilibrado. Recomendado.' },
  { value: 5, label: '5 vidas', desc: 'Para aprender o runs relajadas.' },
  { value: 99, label: 'Infinitas', desc: 'Sin límite, solo por diversión.' },
];

const STATUS_LABEL: Record<Run['status'], string> = {
  waiting: 'Esperando compañero',
  active: 'En curso',
  finished: 'Terminada',
};

export const gameById = (id: string) => GAMES.find((g) => g.id === id);

export default function Dashboard({ profile, onLogout, onProfile }: { profile: Profile; onLogout: () => void; onProfile: (p: Profile) => void }) {
  const [view, setView] = useState<View>({ name: 'list' });
  const [runs, setRuns] = useState<RunWithPlayers[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setRuns(await api.listRuns());
    } catch (e) {
      setError((e as Error).message);
    }
  }, [profile.id]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (run: Run) => setView({ name: 'run', run });

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded font-pixel text-xs text-ink" style={{ background: profile.avatar_color }} aria-hidden="true">
            {profile.username.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="text-xs text-faint">Entrenador</p>
            <p className="font-pixel text-[11px] text-fg">{profile.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setView({ name: 'account' })}>
            Cuenta
          </Button>
          <Button variant="ghost" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {error ? <Alert>{error}</Alert> : null}

      {view.name === 'list' ? (
        <section className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-pixel text-sm text-poke-yellow">Mis runs</h1>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setView({ name: 'join' })}>
                Unirme con código
              </Button>
              <Button onClick={() => setView({ name: 'create' })}>Nueva run</Button>
            </div>
          </div>

          {runs === null ? (
            <Loading label="Cargando runs" />
          ) : runs.length === 0 ? (
            <EmptyState
              title="Aún no tienes runs"
              action={<Button onClick={() => setView({ name: 'create' })}>Crear mi primera run</Button>}
            >
              Crea una run y comparte el código con tu compañero, o únete a la suya.
            </EmptyState>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {runs.map((r) => {
                const game = gameById(r.game);
                const partner = r.player1_id === profile.id ? r.player2 : r.player1;
                const myLives = r.player1_id === profile.id ? r.player1_lives : r.player2_lives;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => open(r)}
                      className="group grid w-full gap-4 rounded-md border border-line bg-panel p-5 text-left transition hover:-translate-y-0.5 hover:border-[#444]"
                      style={{ borderLeft: `3px solid ${game?.color ?? '#888'}` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-pixel text-[11px] leading-relaxed" style={{ color: game?.color }}>
                            {game?.name ?? r.game}
                          </p>
                          <p className="mt-1 text-sm text-dim">
                            con {partner ? <span className="text-fg">{partner.username}</span> : <span className="italic">nadie aún</span>}
                          </p>
                        </div>
                        <span className={`rounded px-2 py-1 font-pixel text-[8px] ${r.status === 'active' ? 'bg-poke-green/15 text-poke-green' : r.status === 'waiting' ? 'bg-poke-yellow/10 text-poke-yellow' : 'bg-white/5 text-dim'}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-dim">
                        <Hearts value={myLives} max={r.lives_per_player} color="#E63946" />
                        <span className="font-pixel text-[9px] text-faint group-hover:text-poke-yellow">Abrir</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {view.name === 'create' ? (
        <CreateRunForm
          onCancel={() => setView({ name: 'list' })}
          onCreate={async (game, lives) => {
            const run = await api.createRun(game, lives);
            await load();
            open(run);
          }}
        />
      ) : null}

      {view.name === 'join' ? (
        <JoinRunForm
          onCancel={() => setView({ name: 'list' })}
          onJoin={async (code) => {
            const run = await api.joinRun(code);
            await load();
            open(run);
          }}
        />
      ) : null}

      {view.name === 'account' ? <AccountPanel profile={profile} onProfile={onProfile} onBack={() => setView({ name: 'list' })} /> : null}

      {view.name === 'run' ? (
        <RunView
          initial={view.run}
          profile={profile}
          onBack={() => {
            setView({ name: 'list' });
            load();
          }}
        />
      ) : null}
    </div>
  );
}

function CreateRunForm({ onCreate, onCancel }: { onCreate: (game: string, lives: number) => Promise<void>; onCancel: () => void }) {
  const [game, setGame] = useState('');
  const [lives, setLives] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const platforms = [...new Set(GAMES.map((g) => g.platform))];

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel}>
          ← Volver
        </Button>
        <h1 className="font-pixel text-sm text-poke-yellow">Nueva run</h1>
      </div>

      <fieldset className="grid gap-4">
        <legend className="mb-3 font-pixel text-[10px] text-dim">1. Elige el juego</legend>
        {platforms.map((platform) => (
          <div key={platform} className="grid gap-3">
            <p className="text-xs text-faint">{platform}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {GAMES.filter((g) => g.platform === platform).map((g) => (
                <label
                  key={g.id}
                  className={`cursor-pointer rounded-md border p-4 transition ${game === g.id ? 'bg-white/5' : 'border-line bg-panel hover:border-[#444]'}`}
                  style={game === g.id ? { borderColor: g.color } : undefined}
                >
                  <input type="radio" name="game" value={g.id} className="sr-only" checked={game === g.id} onChange={() => setGame(g.id)} />
                  <span className="block font-pixel text-[9px] leading-relaxed" style={{ color: g.color }}>
                    {g.name.replace(/^Pokemon /, '')}
                  </span>
                  <span className="mt-1 block text-xs text-faint">Gen {g.generation} · {g.gyms.length} gimnasios</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 font-pixel text-[10px] text-dim">2. Vidas por jugador</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {LIVES_OPTIONS.map((o) => (
            <label key={o.value} className={`cursor-pointer rounded-md border p-4 transition ${lives === o.value ? 'border-poke-red bg-poke-red/10' : 'border-line bg-panel hover:border-[#444]'}`}>
              <input type="radio" name="lives" className="sr-only" checked={lives === o.value} onChange={() => setLives(o.value)} />
              <span className="block font-pixel text-[9px] text-fg">{o.label}</span>
              <span className="mt-2 block text-xs leading-snug text-dim">{o.desc}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-faint">Cada vínculo que muere resta una vida a los dos jugadores.</p>
      </fieldset>

      {error ? <Alert>{error}</Alert> : null}

      <div className="flex gap-3">
        <Button
          disabled={!game}
          loading={saving}
          onClick={async () => {
            setSaving(true);
            setError('');
            try {
              await onCreate(game, lives);
            } catch (e) {
              setError((e as Error).message);
              setSaving(false);
            }
          }}
        >
          Crear run
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </section>
  );
}

function JoinRunForm({ onJoin, onCancel }: { onJoin: (code: string) => Promise<void>; onCancel: () => void }) {
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  return (
    <section className="mx-auto grid w-full max-w-md gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel}>
          ← Volver
        </Button>
        <h1 className="font-pixel text-sm text-poke-yellow">Unirme a una run</h1>
      </div>
      <Card className="p-6">
        <form
          className="grid gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setError('');
            try {
              await onJoin(code);
            } catch (err) {
              setError((err as Error).message);
              setSaving(false);
            }
          }}
        >
          <p className="text-sm text-dim">Pide a tu compañero el código de 6 caracteres que aparece en su run.</p>
          <Field
            id="invite"
            label="CÓDIGO"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={6}
            minLength={6}
            required
            autoComplete="off"
            className="text-center font-pixel !text-xl tracking-[0.4em] text-poke-yellow"
            placeholder="XXXXXX"
          />
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" loading={saving} disabled={code.length !== 6}>
            Unirme
          </Button>
        </form>
      </Card>
    </section>
  );
}

const AVATAR_COLORS = ['#E63946', '#FFD60A', '#4F9DDE', '#2DC653', '#FF6B35', '#9B5DE5', '#F15BB5'];

function AccountPanel({ profile, onProfile, onBack }: { profile: Profile; onProfile: (p: Profile) => void; onBack: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  return (
    <section className="mx-auto grid w-full max-w-md gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          ← Volver
        </Button>
        <h1 className="font-pixel text-sm text-poke-yellow">Mi cuenta</h1>
      </div>

      <Card className="grid gap-4 p-6">
        <p className="font-pixel text-[9px] text-dim">COLOR DE ENTRENADOR</p>
        <div className="flex flex-wrap gap-3">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              aria-label={`Usar color ${c}`}
              aria-pressed={profile.avatar_color === c}
              onClick={async () => onProfile(await api.setColor(c))}
              className={`size-9 rounded transition ${profile.avatar_color === c ? 'ring-2 ring-fg ring-offset-2 ring-offset-panel' : 'hover:scale-110'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <form
          className="grid gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setMessage(null);
            try {
              await api.changePassword(current, next);
              setCurrent('');
              setNext('');
              setMessage({ tone: 'success', text: 'Contraseña actualizada. Se cerraron las demás sesiones.' });
            } catch (err) {
              setMessage({ tone: 'error', text: (err as Error).message });
            } finally {
              setSaving(false);
            }
          }}
        >
          <p className="font-pixel text-[9px] text-dim">CAMBIAR CONTRASEÑA</p>
          <Field id="current" label="ACTUAL" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          <Field id="next" label="NUEVA" type="password" autoComplete="new-password" minLength={8} required value={next} onChange={(e) => setNext(e.target.value)} hint="Mínimo 8 caracteres." />
          {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}
          <Button type="submit" loading={saving}>
            Guardar
          </Button>
        </form>
      </Card>
    </section>
  );
}
