/** Password hashing and token helpers built on WebCrypto (available in Workers and Node 20+). */

const ITERATIONS = 100_000; // Cloudflare Workers caps PBKDF2 at 100k iterations.
const enc = new TextEncoder();

export function toHex(buf: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function hashPassword(password: string, saltHex = randomHex(16)): Promise<{ hash: string; salt: string }> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: ITERATIONS },
    key,
    256,
  );
  return { hash: toHex(bits), salt: saltHex };
}

/** Constant-time comparison to avoid leaking information through timing. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const candidate = await hashPassword(password, salt);
  return safeEqual(candidate.hash, hash);
}

export async function sha256(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(value)));
}

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I

export function inviteCode(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => INVITE_ALPHABET[b % INVITE_ALPHABET.length]).join('');
}
