import { useState, useEffect } from 'react';

// Cache en memoria para no re-fetchear el mismo pokemon
const cache = {};

// Convierte nombre a slug compatible con PokeAPI
function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

// URLs directas sin pasar por la API (más rápido)
// Formato: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png
// Pero necesitamos el id, así que usamos la API para resolver nombre -> id

export async function fetchPokemonSprite(name) {
  if (!name || name.trim() === '' || name === '?') return null;
  const slug = toSlug(name);
  if (cache[slug] !== undefined) return cache[slug];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
    if (!res.ok) { cache[slug] = null; return null; }
    const data = await res.json();
    const url = data.sprites?.other?.['official-artwork']?.front_default
      || data.sprites?.front_default
      || null;
    cache[slug] = { url, id: data.id, name: data.name };
    return cache[slug];
  } catch {
    cache[slug] = null;
    return null;
  }
}

export default function PokeImage({ name, size = 64, showName = false, style = {} }) {
  const [data, setData] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    if (!name || name === '?') { setData(null); return; }
    setData(undefined);
    fetchPokemonSprite(name).then(setData);
  }, [name]);

  if (!name || name === '?') return null;

  if (data === undefined) {
    // Loading skeleton
    return (
      <div style={{
        width: size, height: size, borderRadius: '4px',
        background: 'rgba(255,255,255,0.04)',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
      </div>
    );
  }

  if (!data || !data.url) {
    // Pokemon no encontrado — mostrar placeholder con inicial
    return (
      <div style={{
        width: size, height: size, borderRadius: '4px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid #2a2a2a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: size * 0.25,
        color: '#444',
        ...style,
      }}>
        ?
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', ...style }}>
      <img
        src={data.url}
        alt={name}
        width={size}
        height={size}
        style={{ imageRendering: 'auto', display: 'block', margin: '0 auto' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
      {showName && (
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: '#888',
          marginTop: '4px',
          textTransform: 'capitalize',
        }}>
          {data.name}
        </div>
      )}
    </div>
  );
}
