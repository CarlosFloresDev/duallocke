import type { GymProgress, PokemonLink, Profile, Run, RunWithPlayers } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    ...rest,
    credentials: 'same-origin',
    headers: json !== undefined ? { 'Content-Type': 'application/json', ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? `Error ${res.status}`, res.status);
  return data as T;
}

export interface RunDetail {
  run: Run;
  gyms: GymProgress[];
  links: PokemonLink[];
  players: Profile[];
}

export const api = {
  me: () => request<Profile | null>('/auth/me'),
  register: (username: string, password: string) => request<Profile>('/auth/register', { method: 'POST', json: { username, password } }),
  login: (username: string, password: string) => request<Profile>('/auth/login', { method: 'POST', json: { username, password } }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  changePassword: (current: string, next: string) => request<void>('/auth/password', { method: 'POST', json: { current, next } }),
  setColor: (avatar_color: string) => request<Profile>('/me', { method: 'PATCH', json: { avatar_color } }),

  listRuns: () => request<RunWithPlayers[]>('/runs'),
  createRun: (game: string, lives: number) => request<Run>('/runs', { method: 'POST', json: { game, lives } }),
  joinRun: (code: string) => request<Run>('/runs/join', { method: 'POST', json: { code } }),
  getRun: (id: string) => request<RunDetail>(`/runs/${id}`),
  runVersion: (id: string) => request<{ version: number }>(`/runs/${id}/version`),
  deleteRun: (id: string) => request<void>(`/runs/${id}`, { method: 'DELETE' }),

  setGym: (runId: string, gym: number, defeated: boolean) => request<void>(`/runs/${runId}/gyms/${gym}`, { method: 'PUT', json: { defeated } }),
  saveMyPokemon: (runId: string, route: string, pokemon: string, nickname: string | null) =>
    request<void>(`/runs/${runId}/links`, { method: 'PUT', json: { route, pokemon, nickname } }),
  setLinkStatus: (runId: string, linkId: string, status: PokemonLink['status']) =>
    request<void>(`/runs/${runId}/links/${linkId}`, { method: 'PATCH', json: { status } }),
  deleteLink: (runId: string, linkId: string) => request<void>(`/runs/${runId}/links/${linkId}`, { method: 'DELETE' }),
  saveTeam: (runId: string, linkIds: string[]) => request<void>(`/runs/${runId}/team`, { method: 'PUT', json: { linkIds } }),
};
