import { useEffect, useState } from 'react';
import { displayName, getEvolutionChain, toSlug, type EvolutionStep } from '../../lib/pokeapi';
import PokeImage from './PokeImage';

/** Shows the evolution line of a Pokémon so the player can register the evolved form directly. */
export default function EvolutionTree({ name, onSelect }: { name: string; onSelect: (name: string) => void }) {
  const [steps, setSteps] = useState<EvolutionStep[] | null>(null);

  useEffect(() => {
    let active = true;
    setSteps(null);
    getEvolutionChain(name).then((s) => active && setSteps(s));
    return () => {
      active = false;
    };
  }, [name]);

  if (!steps || steps.length <= 1) return null;
  const current = toSlug(name);

  return (
    <div className="grid gap-3">
      <p className="font-pixel text-[9px] text-dim">LÍNEA EVOLUTIVA</p>
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2">
            {i > 0 ? (
              <span className="text-center text-[11px] leading-tight text-faint">
                →<br />
                {s.method}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(s.name)}
              className={`grid justify-items-center gap-1 rounded border px-2 py-2 transition ${s.name === current ? 'border-poke-yellow bg-poke-yellow/10' : 'border-line hover:border-[#444]'}`}
            >
              <PokeImage name={s.name} size={48} />
              <span className="text-xs text-fg">{displayName(s.name)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
