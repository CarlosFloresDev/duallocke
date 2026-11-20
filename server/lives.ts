import type { LinkStatus, RunStatus } from '../src/lib/types';
import { INFINITE_LIVES } from '../src/lib/types';

export interface LivesState {
  lives_per_player: number;
  player1_lives: number;
  player2_lives: number;
  status: RunStatus;
}

/**
 * Soul Link rule: when a link dies both players lose one life; reviving it (a correction) gives it back.
 * A run finishes when any player reaches zero lives and resumes if a correction brings them back.
 */
export function applyStatusChange(run: LivesState, from: LinkStatus, to: LinkStatus): LivesState {
  if (run.lives_per_player >= INFINITE_LIVES || from === to) return run;
  const delta = to === 'dead' ? -1 : from === 'dead' ? 1 : 0;
  if (delta === 0) return run;

  const clamp = (n: number) => Math.min(Math.max(n + delta, 0), run.lives_per_player);
  const player1_lives = clamp(run.player1_lives);
  const player2_lives = clamp(run.player2_lives);
  let status = run.status;
  if (Math.min(player1_lives, player2_lives) === 0) status = 'finished';
  else if (run.status === 'finished') status = 'active';

  return { ...run, player1_lives, player2_lives, status };
}
