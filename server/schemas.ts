import { z } from 'zod';
import { GAMES } from '../src/data/games';

const gameIds = GAMES.map((g) => g.id) as [string, ...string[]];

export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_]{3,20}$/, 'El nombre debe tener de 3 a 20 letras, números o guion bajo.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(128),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(20),
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1).max(128),
  next: credentialsSchema.shape.password,
});

export const colorSchema = z.object({ avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/) });

export const createRunSchema = z.object({
  game: z.enum(gameIds),
  lives: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5), z.literal(99)]),
});

export const joinSchema = z.object({ code: z.string().trim().toUpperCase().length(6) });

export const gymSchema = z.object({ defeated: z.boolean() });

export const saveLinkSchema = z.object({
  route: z.string().trim().min(1).max(60),
  pokemon: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,40}$/, 'Nombre de Pokémon no válido.'),
  nickname: z.string().trim().max(20).nullable().optional(),
});

export const linkStatusSchema = z.object({ status: z.enum(['alive', 'dead', 'box']) });

export const teamSchema = z.object({ linkIds: z.array(z.string().uuid()).max(6) });
