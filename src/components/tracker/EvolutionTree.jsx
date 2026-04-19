import { useState, useEffect } from 'react';
import PokeImage from './PokeImage';

// Extrae recursivamente la cadena de evolución
function extractChain(chainNode) {
  const result = [];
  function walk(node, stage) {
    if (!node) return;
    const name = node.species?.name;
    const details = node.evolution_details?.[0];
    result.push({
      name,
      stage,
      method: details ? formatMethod(details) : null,
    });
    (node.evolves_to || []).forEach(next => walk(next, stage + 1));
  }
  walk(chainNode, 0);
  return result;
}

function formatMethod(d) {
  if (!d) return null;
  if (d.min_level)           return `Lv. ${d.min_level}`;
  if (d.item?.name)          return `Usar ${d.item.name.replace(/-/g,' ')}`;
  if (d.held_item?.name)     return `Llevar ${d.held_item.name.replace(/-/g,' ')}`;
  if (d.trigger?.name === 'trade') return 'Intercambio';
  if (d.known_move?.name)    return `Aprender ${d.known_move.name.replace(/-/g,' ')}`;
  if (d.min_happiness)       return `Felicidad ${d.min_happiness}`;
  if (d.min_beauty)          return `Belleza ${d.min_beauty}`;
  if (d.time_of_day)         return `${d.time_of_day === 'day' ? 'Día' : 'Noche'}`;
  if (d.location?.name)      return `En ${d.location.name.replace(/-/g,' ')}`;
  return 'Evolución';
}

const cache = {};

export default function EvolutionTree({ pokemonName, onSelectEvolution }) {
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pokemonName || pokemonName.length < 2) { setChain(null); return; }
    loadChain(pokemonName);
  }, [pokemonName]);

  async function loadChain(name) {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\-]/g,'-').replace(/--+/g,'-').replace(/^-|-$/g,'');
    if (cache[slug] !== undefined) { setChain(cache[slug]); return; }
    setLoading(true);
    try {
      // 1. Get pokemon -> species url
      const pr = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
      if (!pr.ok) { cache[slug] = null; setChain(null); return; }
      const pd = await pr.json();

      // 2. Get species -> evolution chain url
      const sr = await fetch(pd.species.url);
      if (!sr.ok) { cache[slug] = null; setChain(null); return; }
      const sd = await sr.json();

      // 3. Get evolution chain
      const er = await fetch(sd.evolution_chain.url);
      if (!er.ok) { cache[slug] = null; setChain(null); return; }
      const ed = await er.json();

      const extracted = extractChain(ed.chain);
      cache[slug] = extracted;
      setChain(extracted);
    } catch {
      cache[slug] = null;
      setChain(null);
    } finally {
      setLoading(false);
    }
  }

  if (!pokemonName || pokemonName.length < 2) return null;
  if (loading) return <div style={styles.loading}>Cargando árbol de evoluciones...</div>;
  if (!chain || chain.length <= 1) return null; // No evoluciona o no se encontró

  return (
    <div style={styles.wrapper}>
      <div style={styles.title}>🌿 Línea evolutiva</div>
      <div style={styles.chain}>
        {chain.map((evo, i) => (
          <div key={evo.name} style={styles.evoGroup}>
            {/* Flecha con método */}
            {i > 0 && (
              <div style={styles.arrow}>
                <div style={styles.arrowLine}>→</div>
                {chain[i].method && (
                  <div style={styles.arrowMethod}>{chain[i].method}</div>
                )}
              </div>
            )}
            {/* Pokemon */}
            <div
              style={{
                ...styles.evoCard,
                ...(evo.name === pokemonName.toLowerCase() ? styles.evoCardCurrent : {}),
              }}
              onClick={() => onSelectEvolution && onSelectEvolution(evo.name)}
              title={`Seleccionar ${evo.name}`}
            >
              <PokeImage name={evo.name} size={52} />
              <div style={styles.evoName}>{evo.name}</div>
              {evo.name === pokemonName.toLowerCase() && (
                <div style={styles.currentTag}>actual</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {onSelectEvolution && (
        <div style={styles.hint}>Haz click en una evolución para seleccionarla</div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'rgba(45,198,83,0.04)', border: '1px solid rgba(45,198,83,0.15)',
    borderRadius: '4px', padding: '14px 16px', marginTop: '10px',
  },
  title: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#2DC653', marginBottom: '12px' },
  loading: { fontSize: '11px', color: '#555', padding: '8px 0' },
  chain: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' },
  evoGroup: { display: 'flex', alignItems: 'center', gap: '4px' },
  arrow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 4px' },
  arrowLine: { fontSize: '18px', color: '#444' },
  arrowMethod: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#FFD60A',
    background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)',
    padding: '2px 5px', borderRadius: '2px', whiteSpace: 'nowrap', textAlign: 'center',
  },
  evoCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    padding: '8px', borderRadius: '4px', cursor: 'pointer',
    border: '1px solid transparent', transition: 'all 0.15s',
    background: 'rgba(255,255,255,0.02)',
  },
  evoCardCurrent: {
    border: '1px solid rgba(45,198,83,0.4)',
    background: 'rgba(45,198,83,0.08)',
  },
  evoName: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '6px',
    color: '#888', textTransform: 'capitalize', textAlign: 'center',
  },
  currentTag: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '5px',
    color: '#2DC653', background: 'rgba(45,198,83,0.15)',
    padding: '2px 5px', borderRadius: '2px',
  },
  hint: { fontSize: '10px', color: '#444', marginTop: '8px' },
};
