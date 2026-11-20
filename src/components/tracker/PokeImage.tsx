import { useEffect, useState } from 'react';
import { getPokemon, type PokemonInfo } from '../../lib/pokeapi';

export default function PokeImage({ name, size = 64, className = '' }: { name: string | null; size?: number; className?: string }) {
  const [info, setInfo] = useState<PokemonInfo | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    setInfo(undefined);
    if (!name) {
      setInfo(null);
      return;
    }
    getPokemon(name).then((p) => active && setInfo(p));
    return () => {
      active = false;
    };
  }, [name]);

  const box = { width: size, height: size };
  if (info === undefined) {
    return <div style={box} className={`animate-pulse rounded bg-panel-2 ${className}`} aria-hidden="true" />;
  }
  if (!info?.sprite) {
    return (
      <div style={box} className={`grid place-items-center rounded bg-panel-2 font-pixel text-[10px] text-faint ${className}`} aria-hidden="true">
        ?
      </div>
    );
  }
  return (
    <img
      src={info.sprite}
      alt={name ?? ''}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`anim-pop object-contain transition-transform duration-300 hover:scale-110 ${className}`}
      style={box}
    />
  );
}
