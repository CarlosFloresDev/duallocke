export type RunStatus = 'waiting' | 'active' | 'finished';
export type LinkStatus = 'alive' | 'dead' | 'box';

export interface Profile {
  id: string;
  username: string;
  avatar_color: string;
  created_at: string;
}

export interface Run {
  id: string;
  player1_id: string;
  player2_id: string | null;
  game: string;
  invite_code: string;
  status: RunStatus;
  lives_per_player: number;
  player1_lives: number;
  player2_lives: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface RunWithPlayers extends Run {
  player1: Pick<Profile, 'id' | 'username' | 'avatar_color'> | null;
  player2: Pick<Profile, 'id' | 'username' | 'avatar_color'> | null;
}

export interface GymProgress {
  run_id: string;
  player_id: string;
  gym_number: number;
  defeated: boolean;
  defeated_at: string;
}

export interface PokemonLink {
  id: string;
  run_id: string;
  route_name: string;
  player1_pokemon: string | null;
  player1_nickname: string | null;
  player1_in_team: boolean;
  player2_pokemon: string | null;
  player2_nickname: string | null;
  player2_in_team: boolean;
  status: LinkStatus;
  created_at: string;
}

/** Which side of a run the current user plays. */
export type Slot = 'player1' | 'player2';

export const INFINITE_LIVES = 99;
export const MAX_TEAM_SIZE = 6;
