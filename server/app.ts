import { Hono, type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import type { ZodSchema } from 'zod';
import type { GymProgress, PokemonLink, Profile, Run, RunWithPlayers, Slot } from '../src/lib/types';
import { MAX_TEAM_SIZE } from '../src/lib/types';
import { checkLoginRate, createSession, destroySession, loadUser, requireUser, sameOrigin } from './auth';
import { hashPassword, inviteCode, verifyPassword } from './crypto';
import { applyStatusChange } from './lives';
import {
  changePasswordSchema,
  colorSchema,
  createRunSchema,
  credentialsSchema,
  gymSchema,
  joinSchema,
  linkStatusSchema,
  loginSchema,
  saveLinkSchema,
  teamSchema,
} from './schemas';
import type { Env } from './types';

const COLORS = ['#E63946', '#FFD60A', '#4F9DDE', '#2DC653', '#FF6B35', '#9B5DE5', '#F15BB5'];
const PROFILE_COLS = 'id, username, avatar_color, created_at';

const app = new Hono<Env>().basePath('/api');

app.use('*', secureHeaders());
app.use('*', sameOrigin);
app.use('*', loadUser);
app.use('*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
});

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'Error interno. Intenta de nuevo.' }, 500);
});

async function body<T>(c: Context<Env>, schema: ZodSchema<T>): Promise<T> {
  const raw = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new HTTPException(400, { message: parsed.error.issues[0]?.message ?? 'Datos no válidos.' });
  return parsed.data;
}

const user = (c: Context<Env>) => c.get('user')!;
const now = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

app.post('/auth/register', async (c) => {
  const { username, password } = await body(c, credentialsSchema);
  const exists = await c.env.DB.prepare('SELECT 1 FROM users WHERE username = ?').bind(username).first();
  if (exists) throw new HTTPException(409, { message: 'Ese nombre de entrenador ya está en uso.' });

  const id = crypto.randomUUID();
  const { hash, salt } = await hashPassword(password);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  await c.env.DB.prepare('INSERT INTO users (id, username, password_hash, password_salt, avatar_color) VALUES (?, ?, ?, ?, ?)')
    .bind(id, username, hash, salt, color)
    .run();
  await createSession(c, id);
  const profile = await c.env.DB.prepare(`SELECT ${PROFILE_COLS} FROM users WHERE id = ?`).bind(id).first<Profile>();
  return c.json(profile, 201);
});

app.post('/auth/login', async (c) => {
  const { username, password } = await body(c, loginSchema);
  const limiter = await checkLoginRate(c, username);
  const row = await c.env.DB.prepare(`SELECT ${PROFILE_COLS}, password_hash, password_salt FROM users WHERE username = ?`)
    .bind(username)
    .first<Profile & { password_hash: string; password_salt: string }>();

  if (!row || !(await verifyPassword(password, row.password_hash, row.password_salt))) {
    await limiter.fail();
    throw new HTTPException(401, { message: 'Usuario o contraseña incorrectos.' });
  }
  await limiter.clear();
  await createSession(c, row.id);
  const { password_hash, password_salt, ...profile } = row;
  return c.json(profile);
});

app.post('/auth/logout', async (c) => {
  await destroySession(c);
  return c.body(null, 204);
});

app.get('/auth/me', (c) => c.json(c.get('user')));

app.post('/auth/password', requireUser, async (c) => {
  const { current, next } = await body(c, changePasswordSchema);
  const row = await c.env.DB.prepare('SELECT password_hash, password_salt FROM users WHERE id = ?')
    .bind(user(c).id)
    .first<{ password_hash: string; password_salt: string }>();
  if (!row || !(await verifyPassword(current, row.password_hash, row.password_salt))) {
    throw new HTTPException(400, { message: 'La contraseña actual no es correcta.' });
  }
  const { hash, salt } = await hashPassword(next);
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').bind(hash, salt, user(c).id),
    c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user(c).id),
  ]);
  await createSession(c, user(c).id);
  return c.body(null, 204);
});

app.patch('/me', requireUser, async (c) => {
  const { avatar_color } = await body(c, colorSchema);
  await c.env.DB.prepare('UPDATE users SET avatar_color = ? WHERE id = ?').bind(avatar_color, user(c).id).run();
  return c.json({ ...user(c), avatar_color });
});

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

const runs = new Hono<Env>();
runs.use('*', requireUser);

/** Loads a run the current user belongs to, or fails with 404 (no information leak about other runs). */
async function memberRun(c: Context<Env>, runId: string): Promise<Run & { slot: Slot }> {
  const run = await c.env.DB.prepare('SELECT * FROM runs WHERE id = ? AND (player1_id = ?2 OR player2_id = ?2)')
    .bind(runId, user(c).id)
    .first<Run>();
  if (!run) throw new HTTPException(404, { message: 'Run no encontrada.' });
  return { ...run, slot: run.player1_id === user(c).id ? 'player1' : 'player2' };
}

const bump = (c: Context<Env>, runId: string) =>
  c.env.DB.prepare('UPDATE runs SET version = version + 1, updated_at = ? WHERE id = ?').bind(now(), runId);

function toLink(row: Record<string, unknown>): PokemonLink {
  return { ...(row as unknown as PokemonLink), player1_in_team: Boolean(row.player1_in_team), player2_in_team: Boolean(row.player2_in_team) };
}

runs.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT r.*,
            p1.username AS p1_username, p1.avatar_color AS p1_color,
            p2.username AS p2_username, p2.avatar_color AS p2_color
       FROM runs r
       JOIN users p1 ON p1.id = r.player1_id
       LEFT JOIN users p2 ON p2.id = r.player2_id
      WHERE r.player1_id = ?1 OR r.player2_id = ?1
      ORDER BY r.updated_at DESC`,
  )
    .bind(user(c).id)
    .all<Run & { p1_username: string; p1_color: string; p2_username: string | null; p2_color: string | null }>();

  const list: RunWithPlayers[] = results.map(({ p1_username, p1_color, p2_username, p2_color, ...run }) => ({
    ...run,
    player1: { id: run.player1_id, username: p1_username, avatar_color: p1_color },
    player2: run.player2_id && p2_username ? { id: run.player2_id, username: p2_username, avatar_color: p2_color! } : null,
  }));
  return c.json(list);
});

runs.post('/', async (c) => {
  const { game, lives } = await body(c, createRunSchema);
  const id = crypto.randomUUID();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = inviteCode();
    const res = await c.env.DB.prepare(
      `INSERT INTO runs (id, player1_id, game, invite_code, lives_per_player, player1_lives, player2_lives)
       VALUES (?1, ?2, ?3, ?4, ?5, ?5, ?5)
       ON CONFLICT(invite_code) DO NOTHING`,
    )
      .bind(id, user(c).id, game, code, lives)
      .run();
    if (res.meta.changes) {
      return c.json(await c.env.DB.prepare('SELECT * FROM runs WHERE id = ?').bind(id).first<Run>(), 201);
    }
  }
  throw new HTTPException(500, { message: 'No se pudo generar un código. Intenta de nuevo.' });
});

runs.post('/join', async (c) => {
  const { code } = await body(c, joinSchema);
  const run = await c.env.DB.prepare('SELECT * FROM runs WHERE invite_code = ?').bind(code).first<Run>();
  if (!run) throw new HTTPException(404, { message: 'No existe una run con ese código.' });
  if (run.player1_id === user(c).id) throw new HTTPException(400, { message: 'No puedes unirte a tu propia run.' });
  if (run.player2_id === user(c).id) return c.json(run);
  if (run.player2_id) throw new HTTPException(409, { message: 'Esa run ya tiene dos jugadores.' });

  // The WHERE clause makes the join atomic: if two people race for the slot, only one wins.
  const res = await c.env.DB.prepare(
    `UPDATE runs SET player2_id = ?, status = 'active', version = version + 1, updated_at = ?
      WHERE id = ? AND player2_id IS NULL`,
  )
    .bind(user(c).id, now(), run.id)
    .run();
  if (!res.meta.changes) throw new HTTPException(409, { message: 'Esa run ya tiene dos jugadores.' });
  return c.json(await c.env.DB.prepare('SELECT * FROM runs WHERE id = ?').bind(run.id).first<Run>());
});

runs.get('/:id', async (c) => {
  const { slot, ...run } = await memberRun(c, c.req.param('id'));
  const [gyms, links, players] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT run_id, player_id, gym_number, defeated_at FROM gym_progress WHERE run_id = ?').bind(run.id),
    c.env.DB.prepare('SELECT * FROM pokemon_links WHERE run_id = ? ORDER BY created_at').bind(run.id),
    c.env.DB.prepare(`SELECT ${PROFILE_COLS} FROM users WHERE id IN (?, ?)`).bind(run.player1_id, run.player2_id ?? ''),
  ]);
  return c.json({
    run,
    gyms: (gyms.results as unknown as GymProgress[]).map((g) => ({ ...g, defeated: true })),
    links: (links.results as Record<string, unknown>[]).map(toLink),
    players: players.results as unknown as Profile[],
  });
});

runs.get('/:id/version', async (c) => {
  const row = await c.env.DB.prepare('SELECT version FROM runs WHERE id = ? AND (player1_id = ?2 OR player2_id = ?2)')
    .bind(c.req.param('id'), user(c).id)
    .first<{ version: number }>();
  if (!row) throw new HTTPException(404, { message: 'Run no encontrada.' });
  return c.json(row);
});

runs.delete('/:id', async (c) => {
  const run = await memberRun(c, c.req.param('id'));
  if (run.slot !== 'player1') throw new HTTPException(403, { message: 'Solo quien creó la run puede eliminarla.' });
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM pokemon_links WHERE run_id = ?').bind(run.id),
    c.env.DB.prepare('DELETE FROM gym_progress WHERE run_id = ?').bind(run.id),
    c.env.DB.prepare('DELETE FROM runs WHERE id = ?').bind(run.id),
  ]);
  return c.body(null, 204);
});

runs.put('/:id/gyms/:number', async (c) => {
  const run = await memberRun(c, c.req.param('id'));
  const number = Number(c.req.param('number'));
  if (!Number.isInteger(number) || number < 1 || number > 16) throw new HTTPException(400, { message: 'Gimnasio no válido.' });
  const { defeated } = await body(c, gymSchema);
  const write = defeated
    ? c.env.DB.prepare('INSERT OR IGNORE INTO gym_progress (run_id, player_id, gym_number) VALUES (?, ?, ?)')
    : c.env.DB.prepare('DELETE FROM gym_progress WHERE run_id = ? AND player_id = ? AND gym_number = ?');
  await c.env.DB.batch([write.bind(run.id, user(c).id, number), bump(c, run.id)]);
  return c.body(null, 204);
});

runs.put('/:id/links', async (c) => {
  const run = await memberRun(c, c.req.param('id'));
  const { route, pokemon, nickname } = await body(c, saveLinkSchema);
  const s = run.slot;
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO pokemon_links (id, run_id, route_name, ${s}_pokemon, ${s}_nickname)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(run_id, route_name) DO UPDATE SET ${s}_pokemon = excluded.${s}_pokemon, ${s}_nickname = excluded.${s}_nickname`,
    ).bind(crypto.randomUUID(), run.id, route, pokemon, nickname || null),
    bump(c, run.id),
  ]);
  return c.body(null, 204);
});

runs.patch('/:id/links/:linkId', async (c) => {
  const run = await memberRun(c, c.req.param('id'));
  const { status } = await body(c, linkStatusSchema);
  const link = await c.env.DB.prepare('SELECT * FROM pokemon_links WHERE id = ? AND run_id = ?')
    .bind(c.req.param('linkId'), run.id)
    .first<PokemonLink>();
  if (!link) throw new HTTPException(404, { message: 'Vínculo no encontrado.' });
  if (!link.player1_pokemon || !link.player2_pokemon) {
    throw new HTTPException(400, { message: 'Ambos jugadores deben registrar su Pokémon antes de cambiar el estado.' });
  }

  const lives = applyStatusChange(run, link.status, status);
  const clearTeam = status === 'dead' ? ', player1_in_team = 0, player2_in_team = 0' : '';
  await c.env.DB.batch([
    c.env.DB.prepare(`UPDATE pokemon_links SET status = ?${clearTeam} WHERE id = ?`).bind(status, link.id),
    c.env.DB.prepare(
      'UPDATE runs SET player1_lives = ?, player2_lives = ?, status = ?, version = version + 1, updated_at = ? WHERE id = ?',
    ).bind(lives.player1_lives, lives.player2_lives, lives.status, now(), run.id),
  ]);
  return c.body(null, 204);
});

runs.delete('/:id/links/:linkId', async (c) => {
  const run = await memberRun(c, c.req.param('id'));
  const link = await c.env.DB.prepare('SELECT * FROM pokemon_links WHERE id = ? AND run_id = ?')
    .bind(c.req.param('linkId'), run.id)
    .first<PokemonLink>();
  if (!link) throw new HTTPException(404, { message: 'Vínculo no encontrado.' });
  if (link.player1_pokemon && link.player2_pokemon) {
    throw new HTTPException(400, { message: 'No se puede borrar un vínculo completo; márcalo como muerto o en el PC.' });
  }
  await c.env.DB.batch([c.env.DB.prepare('DELETE FROM pokemon_links WHERE id = ?').bind(link.id), bump(c, run.id)]);
  return c.body(null, 204);
});

runs.put('/:id/team', async (c) => {
  const run = await memberRun(c, c.req.param('id'));
  const { linkIds } = await body(c, teamSchema);
  if (linkIds.length > MAX_TEAM_SIZE) throw new HTTPException(400, { message: 'Máximo 6 Pokémon en el equipo.' });
  const s = run.slot;
  const ids = [...new Set(linkIds)];
  const placeholders = ids.map(() => '?').join(',');
  const statements = [c.env.DB.prepare(`UPDATE pokemon_links SET ${s}_in_team = 0 WHERE run_id = ?`).bind(run.id)];
  if (ids.length) {
    statements.push(
      c.env.DB.prepare(
        `UPDATE pokemon_links SET ${s}_in_team = 1
          WHERE run_id = ? AND status <> 'dead' AND ${s}_pokemon IS NOT NULL AND id IN (${placeholders})`,
      ).bind(run.id, ...ids),
    );
  }
  statements.push(bump(c, run.id));
  await c.env.DB.batch(statements);
  return c.body(null, 204);
});

app.route('/runs', runs);

app.notFound((c) => c.json({ error: 'Ruta no encontrada.' }, 404));

export default app;
