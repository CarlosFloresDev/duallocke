import type { Context, MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { randomHex, sha256 } from './crypto';
import type { Env, SessionUser } from './types';

export const SESSION_COOKIE = 'dl_session';
const SESSION_DAYS = 30;
const DAY = 86_400_000;

export async function createSession(c: Context<Env>, userId: string) {
  const token = randomHex(32);
  const expires = Date.now() + SESSION_DAYS * DAY;
  await c.env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(token), userId, expires)
    .run();
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession(c: Context<Env>) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

/** Resolves the current user from the session cookie, extending sessions that are close to expiring. */
export const loadUser: MiddlewareHandler<Env> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  c.set('user', null);
  if (token) {
    const hash = await sha256(token);
    const row = await c.env.DB.prepare(
      `SELECT s.expires_at, u.id, u.username, u.avatar_color, u.created_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?`,
    )
      .bind(hash)
      .first<SessionUser & { expires_at: number }>();

    if (row && row.expires_at > Date.now()) {
      const { expires_at, ...user } = row;
      c.set('user', user);
      if (expires_at - Date.now() < (SESSION_DAYS / 2) * DAY) {
        await c.env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?')
          .bind(Date.now() + SESSION_DAYS * DAY, hash)
          .run();
      }
    } else if (row) {
      await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
    }
  }
  await next();
};

export const requireUser: MiddlewareHandler<Env> = async (c, next) => {
  if (!c.get('user')) throw new HTTPException(401, { message: 'Inicia sesión para continuar.' });
  await next();
};

/** Blocks cross-site writes: mutations must come from this same origin. */
export const sameOrigin: MiddlewareHandler<Env> = async (c, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    const origin = c.req.header('Origin');
    if (origin && origin !== new URL(c.req.url).origin) {
      throw new HTTPException(403, { message: 'Origen no permitido.' });
    }
  }
  await next();
};

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60_000;

/** Simple fixed-window limiter for login attempts, keyed by IP and username. */
export async function checkLoginRate(c: Context<Env>, username: string) {
  const ip = c.req.header('CF-Connecting-IP') ?? 'local';
  const key = `${ip}:${username.toLowerCase()}`;
  const now = Date.now();
  const row = await c.env.DB.prepare('SELECT count, window_end FROM login_attempts WHERE key = ?')
    .bind(key)
    .first<{ count: number; window_end: number }>();
  if (row && row.window_end > now && row.count >= MAX_ATTEMPTS) {
    throw new HTTPException(429, { message: 'Demasiados intentos. Espera unos minutos.' });
  }
  return {
    fail: () =>
      c.env.DB.prepare(
        `INSERT INTO login_attempts (key, count, window_end) VALUES (?1, 1, ?2)
         ON CONFLICT(key) DO UPDATE SET
           count = CASE WHEN window_end > ?3 THEN count + 1 ELSE 1 END,
           window_end = CASE WHEN window_end > ?3 THEN window_end ELSE ?2 END`,
      )
        .bind(key, now + WINDOW_MS, now)
        .run(),
    clear: () => c.env.DB.prepare('DELETE FROM login_attempts WHERE key = ?').bind(key).run(),
  };
}
