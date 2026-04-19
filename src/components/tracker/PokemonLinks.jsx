import { useState, useEffect } from 'react';
import PokeImage from './PokeImage';

const STATUS_STYLES = {
  alive: { color: '#2DC653', bg: 'rgba(45,198,83,0.1)',  border: 'rgba(45,198,83,0.3)',  label: '♥ Vivo'   },
  dead:  { color: '#E63946', bg: 'rgba(230,57,70,0.1)',  border: 'rgba(230,57,70,0.3)',  label: '☠ Muerto' },
  box:   { color: '#888',    bg: 'rgba(136,136,136,0.1)',border: '#2a2a2a',               label: '📦 PC'    },
};

// ─────────────────────────────────────────────────────────────────────────────
// PokemonLinks: rediseño completo
//
// Filosofia nueva:
//  - Cada jugador registra SU propio Pokemon en su ruta
//  - Los Pokemon del mismo player1 y player2 en la misma ruta se muestran juntos
//  - Un jugador puede registrar su pokemon aunque el otro aun no haya registrado el suyo
//  - El vinculo visual se forma cuando AMBOS tienen registro en la misma ruta
// ─────────────────────────────────────────────────────────────────────────────
export default function PokemonLinks({ links, routes, myId, isPlayer1, myProfile, partnerProfile, onAdd, onUpdateStatus }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ route_name: '', my_pokemon: '', my_nickname: '' });
  const [loading, setLoading] = useState(false);
  const [customRoute, setCustomRoute] = useState('');

  // Agrupar links por ruta
  const routeMap = {};
  links.forEach(link => {
    const key = link.route_name;
    if (!routeMap[key]) routeMap[key] = [];
    routeMap[key].push(link);
  });

  // Rutas disponibles (las que YO todavia no registré)
  const myRegisteredRoutes = new Set(
    links
      .filter(l => isPlayer1 ? l.player1_pokemon : l.player2_pokemon)
      .map(l => l.route_name)
  );
  const availableRoutes = routes.filter(r => !myRegisteredRoutes.has(r.name));

  async function handleAdd(e) {
    e.preventDefault();
    const routeName = form.route_name === '__custom' ? customRoute : form.route_name;
    if (!routeName || !form.my_pokemon.trim()) return;
    setLoading(true);
    try {
      // Buscar si ya existe un link en esa ruta (del compañero)
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
    } finally {
      setLoading(false);
    }
  }

  const routeEntries = Object.entries(routeMap).sort((a, b) => {
    // Ordenar por el orden de routes
    const oa = routes.findIndex(r => r.name === a[0]);
    const ob = routes.findIndex(r => r.name === b[0]);
    return (oa === -1 ? 999 : oa) - (ob === -1 ? 999 : ob);
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>Vinculos ({links.length > 0 ? routeEntries.length : 0} rutas)</span>
        <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Cancelar' : '+ Registrar Pokemon'}
        </button>
      </div>

      {/* Formulario agregar */}
      {showAdd && (
        <form onSubmit={handleAdd} style={styles.addForm}>
          <div style={styles.formTitle}>Registrar <span style={{ color: myProfile.avatar_color }}>tu</span> Pokemon</div>

          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.label}>RUTA</label>
              <select
                style={styles.select}
                value={form.route_name}
                onChange={e => setForm(f => ({ ...f, route_name: e.target.value }))}
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

            <div style={styles.formField}>
              <label style={styles.label}>TU POKEMON</label>
              <input
                type="text"
                placeholder="Ej: Pikachu, Charmander..."
                style={styles.input}
                value={form.my_pokemon}
                onChange={e => setForm(f => ({ ...f, my_pokemon: e.target.value }))}
                required
              />
              {/* Preview del sprite mientras escribe */}
              {form.my_pokemon.length > 2 && (
                <div style={styles.previewRow}>
                  <PokeImage name={form.my_pokemon} size={48} />
                  <span style={styles.previewHint}>Si el sprite no aparece, verifica la ortografía en inglés</span>
                </div>
              )}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>APODO (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Chispa, Fuego..."
                style={styles.input}
                value={form.my_nickname}
                onChange={e => setForm(f => ({ ...f, my_nickname: e.target.value }))}
              />
            </div>
          </div>

          <div style={styles.formInfo}>
            Tu compañero verá tu Pokemon y podrá registrar el suyo en la misma ruta desde su cuenta.
          </div>

          <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Guardando...' : '▶ Registrar'}
          </button>
        </form>
      )}

      {/* Lista de rutas */}
      {routeEntries.length === 0 && !showAdd ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>🔗</span>
          <p style={styles.emptyText}>Sin Pokemon registrados aun.</p>
          <p style={styles.emptyDesc}>Registra el primer Pokemon que captures en cada ruta.</p>
        </div>
      ) : (
        <div style={styles.linkList}>
          {routeEntries.map(([routeName, routeLinks]) => {
            // Buscar el entry de cada jugador
            // Puede haber multiples entries si ambos registraron
            const myEntry      = routeLinks.find(l => isPlayer1 ? l.player1_pokemon : l.player2_pokemon);
            const partnerEntry = routeLinks.find(l => isPlayer1 ? l.player2_pokemon : l.player1_pokemon);

            const myPokemon    = myEntry      ? (isPlayer1 ? myEntry.player1_pokemon      : myEntry.player2_pokemon)      : null;
            const myNick       = myEntry      ? (isPlayer1 ? myEntry.player1_nickname     : myEntry.player2_nickname)     : null;
            const partnerPok   = partnerEntry ? (isPlayer1 ? partnerEntry.player2_pokemon : partnerEntry.player1_pokemon) : null;
            const partnerNick  = partnerEntry ? (isPlayer1 ? partnerEntry.player2_nickname: partnerEntry.player1_nickname): null;

            // Status: usar el link que tenga el status mas reciente
            const latestLink = routeLinks[routeLinks.length - 1];
            const status = latestLink?.status || 'alive';
            const st = STATUS_STYLES[status] || STATUS_STYLES.alive;
            const bothLinked = myPokemon && partnerPok;

            return (
              <div key={routeName} style={{
                ...styles.linkCard,
                ...(status === 'dead' ? styles.linkDead : {}),
                borderTop: `2px solid ${bothLinked ? st.color : '#2a2a2a'}22`,
              }}>
                {/* Header de la ruta */}
                <div style={styles.linkHeader}>
                  <span style={styles.linkRoute}>{routeName}</span>
                  {bothLinked ? (
                    <span style={{ ...styles.statusTag, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                  ) : (
                    <span style={styles.pendingTag}>⏳ Falta registro</span>
                  )}
                </div>

                {/* Par de Pokemon */}
                <div style={styles.pokePair}>
                  {/* Mi pokemon */}
                  <div style={styles.pokeSlot}>
                    {myPokemon ? (
                      <>
                        <PokeImage name={myPokemon} size={72} />
                        <div style={{ ...styles.pokeName, color: myProfile.avatar_color }}>{myPokemon}</div>
                        {myNick && <div style={styles.pokeNick}>"{myNick}"</div>}
                        <div style={styles.pokeOwner}>{myProfile.username}</div>
                      </>
                    ) : (
                      <div style={styles.pokeEmpty}>
                        <div style={styles.pokeEmptyBox}>?</div>
                        <div style={styles.pokeOwner}>{myProfile.username}</div>
                        <div style={styles.pokeEmptyHint}>Sin registrar</div>
                      </div>
                    )}
                  </div>

                  {/* Conector */}
                  <div style={{ ...styles.linkIcon, color: bothLinked ? '#444' : '#222' }}>
                    {bothLinked ? '🔗' : '···'}
                  </div>

                  {/* Pokemon del compañero */}
                  <div style={styles.pokeSlot}>
                    {partnerPok ? (
                      <>
                        <PokeImage name={partnerPok} size={72} />
                        <div style={{ ...styles.pokeName, color: partnerProfile?.avatar_color || '#888' }}>{partnerPok}</div>
                        {partnerNick && <div style={styles.pokeNick}>"{partnerNick}"</div>}
                        <div style={styles.pokeOwner}>{partnerProfile?.username || 'Compañero'}</div>
                      </>
                    ) : (
                      <div style={styles.pokeEmpty}>
                        <div style={styles.pokeEmptyBox}>?</div>
                        <div style={styles.pokeOwner}>{partnerProfile?.username || 'Compañero'}</div>
                        <div style={styles.pokeEmptyHint}>Sin registrar</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controles de status (solo si hay al menos un pokemon) */}
                {(myPokemon || partnerPok) && latestLink && (
                  <div style={styles.statusRow}>
                    <span style={styles.statusHint}>Estado del vinculo:</span>
                    <div style={styles.statusBtns}>
                      {Object.entries(STATUS_STYLES).map(([s, sv]) => (
                        <button
                          key={s}
                          style={{
                            ...styles.sBtn,
                            ...(status === s ? { ...styles.sBtnActive, borderColor: sv.color, color: sv.color } : {}),
                          }}
                          onClick={() => onUpdateStatus(latestLink.id, s)}
                          title={sv.label}
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

const styles = {
  wrapper: {},
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#888' },
  addBtn: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
    background: 'rgba(45,198,83,0.1)', border: '1px solid rgba(45,198,83,0.3)',
    color: '#2DC653', padding: '8px 14px', borderRadius: '3px', cursor: 'pointer',
  },

  addForm: {
    background: '#161616', border: '1px solid #2a2a2a', borderRadius: '4px',
    padding: '20px', marginBottom: '20px',
  },
  formTitle: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '9px',
    color: '#f0f0f0', marginBottom: '16px',
  },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' },
  formField: {},
  label: {
    display: 'block', fontFamily: "'Press Start 2P', monospace",
    fontSize: '7px', color: '#555', letterSpacing: '1px', marginBottom: '6px',
  },
  input: {
    width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
    borderRadius: '3px', padding: '10px 12px', color: '#f0f0f0',
    fontFamily: "'Space Mono', monospace", fontSize: '13px', outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
    borderRadius: '3px', padding: '10px 12px', color: '#f0f0f0',
    fontFamily: "'Space Mono', monospace", fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', cursor: 'pointer',
  },
  previewRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' },
  previewHint: { fontSize: '11px', color: '#555', flex: 1 },
  formInfo: {
    fontSize: '12px', color: '#555', background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1e1e1e', borderRadius: '3px', padding: '10px 14px', marginBottom: '14px',
  },
  submitBtn: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '9px',
    background: '#2DC653', color: '#000', border: 'none',
    padding: '12px 24px', borderRadius: '3px', cursor: 'pointer', letterSpacing: '1px',
  },

  empty: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: '36px', display: 'block', marginBottom: '16px' },
  emptyText: { fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#555', marginBottom: '8px' },
  emptyDesc: { fontSize: '12px', color: '#444' },

  linkList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  linkCard: {
    background: '#161616', border: '1px solid #2a2a2a', borderRadius: '4px',
    padding: '16px 20px', transition: 'all 0.15s',
  },
  linkDead: { opacity: 0.55 },

  linkHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', flexWrap: 'wrap', gap: '8px',
  },
  linkRoute: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#888' },
  statusTag: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', padding: '3px 8px', borderRadius: '2px' },
  pendingTag: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '7px', padding: '3px 8px',
    borderRadius: '2px', color: '#555', border: '1px solid #222',
  },

  pokePair: {
    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
    gap: '12px', alignItems: 'center', marginBottom: '16px',
  },
  pokeSlot: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center' },
  pokeName: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', textTransform: 'capitalize' },
  pokeNick: { fontSize: '11px', color: '#888', fontStyle: 'italic' },
  pokeOwner: { fontSize: '10px', color: '#555' },
  pokeEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  pokeEmptyBox: {
    width: '72px', height: '72px', border: '2px dashed #2a2a2a', borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Press Start 2P', monospace", fontSize: '20px', color: '#333',
  },
  pokeEmptyHint: { fontSize: '10px', color: '#333', fontStyle: 'italic' },
  linkIcon: { textAlign: 'center', fontSize: '20px' },

  statusRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    borderTop: '1px solid #1e1e1e', paddingTop: '12px', flexWrap: 'wrap',
  },
  statusHint: { fontSize: '11px', color: '#444' },
  statusBtns: { display: 'flex', gap: '6px' },
  sBtn: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '7px',
    background: '#0d0d0d', border: '1px solid #2a2a2a', color: '#555',
    padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', transition: 'all 0.1s',
  },
  sBtnActive: { background: 'rgba(255,255,255,0.04)' },
};
