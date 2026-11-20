import type { D1Database } from '@cloudflare/workers-types';
import type { Profile } from '../src/lib/types';

export type SessionUser = Profile;

export interface Env {
  Bindings: { DB: D1Database };
  Variables: { user: SessionUser | null };
}
