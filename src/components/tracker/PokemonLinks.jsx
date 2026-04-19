import { useState, useEffect } from 'react';
import PokeImage from './PokeImage';
import EvolutionTree from './EvolutionTree';
import { ENCOUNTERS } from '../../data/encounters.ts';

const STATUS_STYLES = {
  alive: { color: '#2DC653', bg: 'rgba(45,198,83,0.1)',  border: 'rgba(45,198,83,0.3)',  label: '♥ Vivo'   },
  dead:  { color: '#E63946', bg: 'rgba(230,57,70,0.1)',  border: 'rgba(230,57,70,0.3)',  label: '☠ Muerto' },
  box:   { color: '#888',    bg: 'rgba(136,136,136,0.1)',border: '#2a2a2a',               label: '📦 PC'    },
};

export default function PokemonLinks({
  links, routes, gameId, myId, isPlayer1,
  myProfile, partnerProfile, onAdd, onUpdateStatus
}) {
  const [showAdd, setShowAdd]         = useState(false);
  const [form, setForm]               = useState({ route_name: '', my_pokemon: '', my_nickname: '' });
  const [customRoute, setCustomRoute] = useState('');
  const [loading, setLoading]         = useState(false);
  const [showEvoFor, setShowEvoFor]   = useState(''); // nombre del poke cuya evo mostrar

  // Rutas en las que YO ya registré
  const myRegisteredRoutes = new Set(
    links
      .filter(l => isPlayer1 ? (l.player1_pokemon && l.player1_pokemon !== '') : (l.player2_pokemon && l.player2_pokemon !== ''))
      .map(l => l.route_name)
  );
  const availableRoutes = routes.filter(r => !myRegisteredRoutes.has(r.name));

  // Encuentros de la ruta seleccionada
  const selectedRouteId = routes.find(r => r.name === form.route_name)?.id || '';
  const routeEncounters = selectedRouteId && gameId
    ? ENCOUNTERS[gameId]?.[selectedRouteId] ?? []
    : [];

  async function handleAdd(e) {
    e.preventDefault();
    const routeName = form.route_name === '__custom' ? customRoute : form.route_name;
    if (!routeName || !form.my_pokemon.trim()) return;
    setLoading(true);
    try {
      const existingLink = links.find(l => l.route_name === routeName);
      await onAdd({
        route_name: routeName,
        my_pokemon: form.my_pokemon.trim(),
        my_nickname: form.my_nickname.trim(),
        existing_link_id: existingLink?.id || null,
      });
      setForm({ route_name: '', my_pokemon: '', my_nickname: '' });
      setCustomRoute('');
      setShowAdd(false);
      setShowEvoFor('');
    } finally {
      setLoading(false);
    }
  }

  // Agrupar links por ruta
  const routeMap = {};
  links.forEach(l => {
    if (!routeMap[l.route_name]) routeMap[l.route_name] = [];
    routeMap[l.route_name].push(l);
  });
  const routeEntries = Object.entries(routeMap).sort((a, b) => {
    const oa = routes.findIndex(r => r.name === a[0]);
    const ob = routes.findIndex(r => r.name === b[0]);
    return (oa === -1 ? 999 : oa) - (ob === -1 ? 999 : ob);
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>Pokémon capturados ({routeEntries.length} rutas)</span>
        <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Cancelar' : '+ Registrar Pokémon'}
        </button>
      </div>

      {/* ──── Formulario de registro ──── */}
      {showAdd && (
        <form onSubmit={handleAdd} style={styles.addForm}>
          <div style={styles.formTitle}>
            Registrar <span style={{ color: myProfile.avatar_color }}>tu</span> Pokémon
          </div>

          {/* Selección de ruta */}
          <div style={styles.formField}>
            <label style={styles.label}>RUTA</label>
            <select
              style={styles.select}
              value={form.route_name}
              onChange={e => {
                setForm(f => ({ ...f, route_name: e.target.value, my_pokemon: '' }));
                setShowEvoFor('');
              }}
              required
            >
              <option value="">Selecciona una ruta...</option>
              {availableRoutes.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
              <option value="__custom">Otra ruta (escribir)</option>
            </select>
            {form.route_name === '__custom' && (
              <input
                type="text"
                placeholder="Nombre de la ruta"
                style={{ ...styles.input, marginTop: '6px' }}
                value={customRoute}
                onChange={e => setCustomRoute(e.target.value)}
                required
              />
            )}
          </div>

          {/* Encuentros de la ruta */}
          {routeEncounters.length > 0 && (
            <div style={styles.encountersSection}>
              <div style={styles.encountersLabel}>ENCUENTROS EN ESTA RUTA</div>
              <div style={styles.encountersGrid}>
                {routeEncounters.map(pokeName => (
                  <div
                    key={pokeName}
                    style={{
                      ...styles.encounterCard,
                      ...(form.my_pokemon === pokeName ? styles.encounterCardSelected : {}),
                    }}
                    onClick={() => {
                      setForm(f => ({ ...f, my_pokemon: pokeName }));
                      setShowEvoFor(pokeName);
                    }}
                  >
                    <PokeImage name={pokeName} size={44} />
                    <div style={styles.encounterName}>{pokeName}</div>
                    {form.my_pokemon === pokeName && <div style={styles.encounterCheck}>✓</div>}
                  </div>
                ))}
                {/* Opción manual siempre disponible */}
                <div
                  style={{
                    ...styles.encounterCard,
                    ...(styles.encounterCardOther),
                  }}
                  onClick={() => setForm(f => ({ ...f, my_pokemon: '' }))}
                >
                  <div style={styles.encounterOtherIcon}>+</div>
                  <div style={styles.encounterName}>Otro</div>
                </div>
              </div>
            </div>
          )}

          {/* Campo manual de Pokémon */}
          <div style={styles.formField}>
            <label style={styles.label}>
              {routeEncounters.length > 0 ? 'O ESCRIBE EL NOMBRE' : 'TU POKÉMON'}
            </label>
            <input
              type="text"
              placeholder="Nombre en inglés: Pikachu, Charmander..."
              style={styles.input}
              value={form.my_pokemon}
              onChange={e => {
                setForm(f => ({ ...f, my_pokemon: e.target.value }));
                if (e.target.value.length > 2) setShowEvoFor(e.target.value);
              }}
              required
            />

            {/* Preview del sprite */}
            {form.my_pokemon.length > 2 && (
              <div style={styles.previewRow}>
                <PokeImage name={form.my_pokemon} size={52} />
                <span style={styles.previewHint}>
                  {routeEncounters.length === 0 && 'El nombre debe estar en inglés para mostrar la imagen'}
                </span>
              </div>
            )}
          </div>

          {/* Árbol de evoluciones */}
          {showEvoFor && showEvoFor.length > 2 && (
            <EvolutionTree
              pokemonName={showEvoFor}
              onSelectEvolution={name => setForm(f => ({ ...f, my_pokemon: name }))}
            />
          )}

          {/* Apodo */}
          <div style={styles.formField}>
            <label style={styles.label}>APODO (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Chispa, Llama..."
              style={styles.input}
              value={form.my_nickname}
              onChange={e => setForm(f => ({ ...f, my_nickname: e.target.value }))}
            />
          </div>

          <div style={styles.formInfo}>
            Tu compañero verá tu Pokémon y podrá registrar el suyo desde su cuenta.
          </div>

          <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Guardando...' : '▶ Registrar'}
          </button>
        </form>
      )}

      {/* ──── Lista de rutas ──── */}
      {routeEntries.length === 0 && !showAdd ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>🔗</span>
          <p style={styles.emptyText}>Sin Pokémon registrados aún.</p>
          <p style={styles.emptyDesc}>Registra el primero que captures en cada ruta.</p>
        </div>
      ) : (
        <div style={styles.linkList}>
          {routeEntries.map(([routeName, routeLinks]) => {
            const myEntry      = routeLinks.find(l => isPlayer1 ? (l.player1_pokemon && l.player1_pokemon !== '') : (l.player2_pokemon && l.player2_pokemon !== ''));
            const partnerEntry = routeLinks.find(l => isPlayer1 ? (l.player2_pokemon && l.player2_pokemon !== '') : (l.player1_pokemon && l.player1_pokemon !== ''));

            const myPokemon   = myEntry      ? (isPlayer1 ? myEntry.player1_pokemon      : myEntry.player2_pokemon)      : null;
            const myNick      = myEntry      ? (isPlayer1 ? myEntry.player1_nickname     : myEntry.player2_nickname)     : null;
            const partnerPok  = partnerEntry ? (isPlayer1 ? partnerEntry.player2_pokemon : partnerEntry.player1_pokemon) : null;
            const partnerNick = partnerEntry ? (isPlayer1 ? partnerEntry.player2_nickname: partnerEntry.player1_nickname): null;

            const latestLink = routeLinks[routeLinks.length - 1];
            const status = latestLink?.status || 'alive';
            const st = STATUS_STYLES[status] || STATUS_STYLES.alive;
            const bothLinked = myPokemon && partnerPok;

            return (
              <div key={routeName} style={{
                ...styles.linkCard,
                ...(status === 'dead' ? styles.linkDead : {}),
              }}>
                {/* Header */}
                <div style={styles.linkHeader}>
                  <span style={styles.linkRoute}>{routeName}</span>
                  {bothLinked
                    ? <span style={{ ...styles.statusTag, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                    : <span style={styles.pendingTag}>⏳ Falta registro</span>
                  }
                </div>

                {/* Par de Pokémon */}
                <div style={styles.pokePair}>
                  <PokeSlot name={myPokemon}   nick={myNick}      profile={myProfile}      />
                  <div style={{ ...styles.linkIcon, color: bothLinked ? '#444' : '#222' }}>
                    {bothLinked ? '🔗' : '···'}
                  </div>
                  <PokeSlot name={partnerPok}  nick={partnerNick} profile={partnerProfile} />
                </div>

                {/* Controles */}
                {(myPokemon || partnerPok) && latestLink && (
                  <div style={styles.statusRow}>
                    <span style={styles.statusHint}>Estado:</span>
                    <div style={styles.statusBtns}>
                      {Object.entries(STATUS_STYLES).map(([s, sv]) => (
                        <button
                          key={s}
                          style={{ ...styles.sBtn, ...(status === s ? { ...styles.sBtnActive, borderColor: sv.color, color: sv.color } : {}) }}
                          onClick={() => onUpdateStatus(latestLink.id, s)}
                        >
                          {s === 'alive' ? '♥ Vivo' : s === 'dead' ? '☠ Muerto' : '📦 PC'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PokeSlot({ name, nick, profile }) {
  if (!profile) return <div style={{ flex: 1 }} />;
  return (
    <div style={pokeStyles.slot}>
      {name ? (
        <>
          <PokeImage name={name} size={72} />
          <div style={{ ...pokeStyles.name, color: profile.avatar_color }}>{name}</div>
          {nick && <div style={pokeStyles.nick}>"{nick}"</div>}
          <div style={pokeStyles.owner}>{profile.username}</div>
        </>
      ) : (
        <>
          <div style={pokeStyles.emptyBox}>?</div>
          <div style={pokeStyles.owner}>{profile.username}</div>
          <div style={pokeStyles.emptyHint}>Sin registrar</div>
        </>
      )}
    </div>
  );
}

const pokeStyles = {
  slot: { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', textAlign:'center', flex:1 },
  name: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', textTransform:'capitalize' },
  nick: { fontSize:'11px', color:'#888', fontStyle:'italic' },
  owner: { fontSize:'10px', color:'#555' },
  emptyBox: { width:'72px', height:'72px', border:'2px dashed #2a2a2a', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Press Start 2P',monospace", fontSize:'20px', color:'#333' },
  emptyHint: { fontSize:'10px', color:'#333', fontStyle:'italic' },
};

const styles = {
  wrapper: {},
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  title: { fontFamily:"'Press Start 2P',monospace", fontSize:'10px', color:'#888' },
  addBtn: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', background:'rgba(45,198,83,0.1)', border:'1px solid rgba(45,198,83,0.3)', color:'#2DC653', padding:'8px 14px', borderRadius:'3px', cursor:'pointer' },

  addForm: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:'4px', padding:'20px', marginBottom:'20px' },
  formTitle: { fontFamily:"'Press Start 2P',monospace", fontSize:'9px', color:'#f0f0f0', marginBottom:'16px' },
  formField: { marginBottom:'12px' },
  label: { display:'block', fontFamily:"'Press Start 2P',monospace", fontSize:'7px', color:'#555', letterSpacing:'1px', marginBottom:'6px' },
  input: { width:'100%', background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:'3px', padding:'10px 12px', color:'#f0f0f0', fontFamily:"'Space Mono',monospace", fontSize:'13px', outline:'none', boxSizing:'border-box' },
  select: { width:'100%', background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:'3px', padding:'10px 12px', color:'#f0f0f0', fontFamily:"'Space Mono',monospace", fontSize:'13px', outline:'none', boxSizing:'border-box', cursor:'pointer' },

  encountersSection: { background:'rgba(255,255,255,0.02)', border:'1px solid #1e1e1e', borderRadius:'4px', padding:'14px', marginBottom:'12px' },
  encountersLabel: { fontFamily:"'Press Start 2P',monospace", fontSize:'7px', color:'#555', letterSpacing:'1px', marginBottom:'10px' },
  encountersGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(80px, 1fr))', gap:'8px' },
  encounterCard: { background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:'4px', padding:'8px 6px', textAlign:'center', cursor:'pointer', transition:'all 0.15s', position:'relative' },
  encounterCardSelected: { border:'1px solid #2DC653', background:'rgba(45,198,83,0.08)' },
  encounterCardOther: { border:'1px dashed #2a2a2a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80px' },
  encounterName: { fontFamily:"'Press Start 2P',monospace", fontSize:'6px', color:'#888', marginTop:'4px', textTransform:'capitalize', lineHeight:1.5 },
  encounterCheck: { position:'absolute', top:'4px', right:'4px', background:'#2DC653', color:'#000', borderRadius:'50%', width:'14px', height:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'bold' },
  encounterOtherIcon: { fontSize:'22px', color:'#444' },

  previewRow: { display:'flex', alignItems:'center', gap:'12px', marginTop:'8px' },
  previewHint: { fontSize:'11px', color:'#555', flex:1 },
  formInfo: { fontSize:'12px', color:'#555', background:'rgba(255,255,255,0.02)', border:'1px solid #1e1e1e', borderRadius:'3px', padding:'10px 14px', marginBottom:'14px' },
  submitBtn: { fontFamily:"'Press Start 2P',monospace", fontSize:'9px', background:'#2DC653', color:'#000', border:'none', padding:'12px 24px', borderRadius:'3px', cursor:'pointer', letterSpacing:'1px' },

  empty: { textAlign:'center', padding:'60px 20px' },
  emptyIcon: { fontSize:'36px', display:'block', marginBottom:'16px' },
  emptyText: { fontFamily:"'Press Start 2P',monospace", fontSize:'10px', color:'#555', marginBottom:'8px' },
  emptyDesc: { fontSize:'12px', color:'#444' },

  linkList: { display:'flex', flexDirection:'column', gap:'12px' },
  linkCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:'4px', padding:'16px 20px', transition:'all 0.15s' },
  linkDead: { opacity:0.55 },
  linkHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' },
  linkRoute: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', color:'#888' },
  statusTag: { fontFamily:"'Press Start 2P',monospace", fontSize:'7px', padding:'3px 8px', borderRadius:'2px' },
  pendingTag: { fontFamily:"'Press Start 2P',monospace", fontSize:'7px', padding:'3px 8px', borderRadius:'2px', color:'#555', border:'1px solid #222' },
  pokePair: { display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'12px', alignItems:'center', marginBottom:'16px' },
  linkIcon: { textAlign:'center', fontSize:'20px' },
  statusRow: { display:'flex', alignItems:'center', gap:'12px', borderTop:'1px solid #1e1e1e', paddingTop:'12px', flexWrap:'wrap' },
  statusHint: { fontSize:'11px', color:'#444' },
  statusBtns: { display:'flex', gap:'6px' },
  sBtn: { fontFamily:"'Press Start 2P',monospace", fontSize:'7px', background:'#0d0d0d', border:'1px solid #2a2a2a', color:'#555', padding:'5px 10px', borderRadius:'3px', cursor:'pointer', transition:'all 0.1s' },
  sBtnActive: { background:'rgba(255,255,255,0.04)' },
};
