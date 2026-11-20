import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-poke-red text-white hover:bg-[#cf2f3c]',
  secondary: 'border border-line text-fg hover:border-poke-yellow hover:text-poke-yellow',
  ghost: 'text-dim hover:text-fg',
  danger: 'border border-poke-red/40 text-poke-red hover:bg-poke-red/10',
};

export function Button({
  variant = 'primary',
  className = '',
  loading = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded px-4 py-3 font-pixel text-[10px] leading-none tracking-wider transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {loading ? <Spinner small /> : null}
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-md border border-line bg-panel ${className}`}>{children}</div>;
}

export function Field({
  label,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; id: string }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-pixel text-[9px] tracking-wider text-dim">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full rounded border border-line bg-ink px-3 py-3 text-[15px] text-fg outline-none transition placeholder:text-faint focus:border-poke-yellow ${props.className ?? ''}`}
      />
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-poke-red/40 bg-poke-red/10 text-[#ff8a93]',
    info: 'border-poke-yellow/30 bg-poke-yellow/5 text-dim',
    success: 'border-poke-green/40 bg-poke-green/10 text-[#7be39a]',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function Spinner({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-line border-t-poke-red ${small ? 'size-3' : 'size-8'}`}
    />
  );
}

export function Loading({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4" role="status">
      <Spinner />
      <span className="font-pixel text-[10px] text-dim">{label}...</span>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-3 rounded-md border border-dashed border-line px-6 py-12 text-center">
      <p className="font-pixel text-[11px] text-fg">{title}</p>
      {children ? <p className="max-w-md text-sm text-dim">{children}</p> : null}
      {action}
    </div>
  );
}

export function Hearts({ value, max, color }: { value: number; max: number; color: string }) {
  if (max >= 99) return <span className="font-pixel text-[11px] text-dim">Infinitas</span>;
  return (
    <span className="inline-flex gap-1" aria-label={`${value} de ${max} vidas`}>
      {Array.from({ length: max }, (_, i) => (
        // Keying on the alive/lost state replays the animation when a heart changes.
        <span
          key={`${i}-${i < value}`}
          aria-hidden="true"
          className={`text-lg leading-none ${i >= value ? 'anim-heart' : ''}`}
          style={{ color: i < value ? color : '#333' }}
        >
          ♥
        </span>
      ))}
    </span>
  );
}
