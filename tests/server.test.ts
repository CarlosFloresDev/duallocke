import { describe, expect, it } from 'vitest';
import { hashPassword, inviteCode, safeEqual, verifyPassword } from '../server/crypto';
import { applyStatusChange, type LivesState } from '../server/lives';
import { createRunSchema, credentialsSchema, saveLinkSchema } from '../server/schemas';

const run = (over: Partial<LivesState> = {}): LivesState => ({
  lives_per_player: 3,
  player1_lives: 3,
  player2_lives: 3,
  status: 'active',
  ...over,
});

describe('passwords', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const { hash, salt } = await hashPassword('pikachu123');
    expect(await verifyPassword('pikachu123', hash, salt)).toBe(true);
    expect(await verifyPassword('raichu123', hash, salt)).toBe(false);
  });

  it('uses a different salt every time', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });

  it('compares strings safely', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});

describe('invite codes', () => {
  it('are 6 characters without ambiguous letters', () => {
    for (let i = 0; i < 200; i++) expect(inviteCode()).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });
});

describe('soul link lives', () => {
  it('removes a life from both players when a link dies', () => {
    expect(applyStatusChange(run(), 'alive', 'dead')).toMatchObject({ player1_lives: 2, player2_lives: 2, status: 'active' });
  });

  it('gives the life back when a death is undone', () => {
    expect(applyStatusChange(run({ player1_lives: 2, player2_lives: 2 }), 'dead', 'box')).toMatchObject({ player1_lives: 3, player2_lives: 3 });
  });

  it('does not change lives when moving between alive and box', () => {
    expect(applyStatusChange(run(), 'alive', 'box')).toEqual(run());
  });

  it('finishes the run at zero lives and resumes on correction', () => {
    const finished = applyStatusChange(run({ player1_lives: 1, player2_lives: 1 }), 'alive', 'dead');
    expect(finished).toMatchObject({ player1_lives: 0, status: 'finished' });
    expect(applyStatusChange(finished, 'dead', 'alive')).toMatchObject({ player1_lives: 1, status: 'active' });
  });

  it('ignores lives in infinite mode', () => {
    const infinite = run({ lives_per_player: 99, player1_lives: 99, player2_lives: 99 });
    expect(applyStatusChange(infinite, 'alive', 'dead')).toEqual(infinite);
  });

  it('never goes above the maximum', () => {
    expect(applyStatusChange(run(), 'dead', 'alive')).toMatchObject({ player1_lives: 3 });
  });
});

describe('validation', () => {
  it('accepts valid usernames and rejects bad ones', () => {
    expect(credentialsSchema.safeParse({ username: 'Ash_99', password: '12345678' }).success).toBe(true);
    expect(credentialsSchema.safeParse({ username: 'a b', password: '12345678' }).success).toBe(false);
    expect(credentialsSchema.safeParse({ username: 'Ash', password: 'short' }).success).toBe(false);
  });

  it('only allows known games and lives', () => {
    expect(createRunSchema.safeParse({ game: 'emerald', lives: 3 }).success).toBe(true);
    expect(createRunSchema.safeParse({ game: 'pokemon-z', lives: 3 }).success).toBe(false);
    expect(createRunSchema.safeParse({ game: 'emerald', lives: 4 }).success).toBe(false);
  });

  it('normalizes Pokémon names', () => {
    expect(saveLinkSchema.parse({ route: 'Ruta 1', pokemon: ' Pikachu ' }).pokemon).toBe('pikachu');
    expect(saveLinkSchema.safeParse({ route: 'Ruta 1', pokemon: '<script>' }).success).toBe(false);
  });
});
