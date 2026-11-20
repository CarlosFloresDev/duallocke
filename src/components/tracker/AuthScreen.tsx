import { useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import type { Profile } from '../../lib/types';
import { Alert, Button, Card, Field } from './ui';

type Mode = 'signin' | 'signup';

export default function AuthScreen({ onAuthed }: { onAuthed: (p: Profile) => void }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      onAuthed(mode === 'signin' ? await api.login(username, password) : await api.register(username, password));
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-poke-red via-poke-yellow to-poke-blue" />
        <div className="grid gap-2 px-8 pt-8 pb-6 text-center">
          <h1 className="font-pixel text-base leading-relaxed text-poke-yellow">Duallocke Tracker</h1>
          <p className="text-sm text-dim">Sigue tu Soul Link con tu compañero, sincronizado en vivo.</p>
        </div>

        <div className="grid grid-cols-2 border-y border-line" role="tablist">
          {(
            [
              ['signin', 'Iniciar sesión'],
              ['signup', 'Crear cuenta'],
            ] as [Mode, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              onClick={() => {
                setMode(id);
                setError('');
              }}
              className={`border-b-2 py-4 font-pixel text-[9px] transition ${mode === id ? 'border-poke-yellow bg-poke-yellow/5 text-poke-yellow' : 'border-transparent text-dim hover:text-fg'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="grid gap-5 p-8">
          <Field
            id="username"
            label="NOMBRE DE ENTRENADOR"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            placeholder="Ash_Ketchum"
            autoComplete="username"
            required
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_]{3,20}"
            hint={mode === 'signup' ? 'De 3 a 20 letras, números o guion bajo. Es lo que verá tu compañero.' : undefined}
          />
          <Field
            id="password"
            label="CONTRASEÑA"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={mode === 'signup' ? 8 : 1}
            required
            hint={mode === 'signup' ? 'Mínimo 8 caracteres. Guárdala bien: no hay recuperación por correo.' : undefined}
          />
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" loading={loading} className="w-full">
            {mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
