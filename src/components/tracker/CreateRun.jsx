import { useState } from 'react';

const GAMES_BY_PLATFORM = [
  {
    platform: 'GBA',
    label: 'Game Boy Advance',
    games: [
      { id: 'firered',  name: 'Rojo Fuego',  color: '#E63946', gen: 'Gen I'   },
      { id: 'leafgreen',name: 'Verde Hoja',  color: '#2DC653', gen: 'Gen I'   },
      { id: 'ruby',     name: 'Rubi',        color: '#cc0000', gen: 'Gen III' },
      { id: 'sapphire', name: 'Zafiro',      color: '#457B9D', gen: 'Gen III' },
      { id: 'emerald',  name: 'Esmeralda',   color: '#00a36c', gen: 'Gen III' },
    ],
  },
  {
    platform: 'NDS',
    label: 'Nintendo DS',
    games: [
      { id: 'diamond',    name: 'Diamante',   color: '#5b8dee', gen: 'Gen IV' },
      { id: 'pearl',      name: 'Perla',      color: '#e8a0c8', gen: 'Gen IV' },
      { id: 'platinum',   name: 'Platino',    color: '#c8c8f0', gen: 'Gen IV' },
      { id: 'heartgold',  name: 'HeartGold',  color: '#FFD60A', gen: 'Gen IV' },
      { id: 'soulsilver', name: 'SoulSilver', color: '#a8c8e8', gen: 'Gen IV' },
      { id: 'black',      name: 'Negro',      color: '#555',    gen: 'Gen V'  },
      { id: 'white',      name: 'Blanco',     color: '#ddd',    gen: 'Gen V'  },
      { id: 'black2',     name: 'Negro 2',    color: '#1a1a3a', gen: 'Gen V'  },
      { id: 'white2',     name: 'Blanco 2',   color: '#f0f0ff', gen: 'Gen V'  },
    ],
  },
];

const LIVES_OPTIONS = [
  { value: 1, label: '1 vida',   desc: 'Modo hardcore — una muerte y se acabó' },
  { value: 2, label: '2 vidas',  desc: 'Para los que quieren algo de margen' },
  { value: 3, label: '3 vidas',  desc: 'Clásico — equilibrado y justo',       recommended: true },
  { value: 5, label: '5 vidas',  desc: 'Para aprender o runs relajadas' },
  { value: 99, label: 'Infinitas', desc: 'Sin restricciones, solo por diversión' },
];

export default function CreateRun({ onSubmit, onCancel }) {
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedLives, setSelectedLives] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedGame) { setError('Selecciona un juego'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ game: selectedGame, lives: selectedLives });
    } catch (err) {
      setError(err.message || 'Error al crear la run');
    } finally {
      setLoading(false);
    }
  }

  const selectedGameData = GAMES_BY_PLATFORM.flatMap(g => g.games).find(g => g.id === selectedGame);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button onClick={onCancel} style={styles.back}>← Volver</button>
        <h2 style={styles.title}>Nueva Run</h2>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Selección de juego ── */}
        {GAMES_BY_PLATFORM.map(group => (
          <div key={group.platform} style={styles.platformGroup}>
            <div style={styles.platformLabel}>
              <span style={styles.platformTag}>{group.platform}</span>
              <span style={styles.platformName}>{group.label}</span>
              <div style={styles.platformLine}></div>
            </div>
            <div style={styles.gameGrid}>
              {group.games.map(g => {
                const isSelected = selectedGame === g.id;
                return (
                  <div
                    key={g.id}
                    style={{
                      ...styles.gameCard,
                      ...(isSelected ? { borderColor: g.color, background: `${g.color}12` } : {}),
                    }}
                    onClick={() => setSelectedGame(g.id)}
                  >
                    {isSelected && <div style={{ ...styles.gameAccent, background: g.color }}></div>}
                    <div style={{ ...styles.gameColorDot, background: g.color }}></div>
                    <div style={styles.gameName}>{g.name}</div>
                    <div style={styles.gameGen}>{g.gen}</div>
                    {isSelected && <div style={styles.checkMark}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Selección de vidas ── */}
        <div style={styles.livesSection}>
          <div style={styles.platformLabel}>
            <span style={styles.platformTag}>❤</span>
            <span style={styles.platformName}>Sistema de vidas</span>
            <div style={styles.platformLine}></div>
          </div>

          <div style={styles.livesGrid}>
            {LIVES_OPTIONS.map(opt => {
              const isSelected = selectedLives === opt.value;
              return (
                <div
                  key={opt.value}
                  style={{
                    ...styles.livesCard,
                    ...(isSelected ? styles.livesCardSelected : {}),
                  }}
                  onClick={() => setSelectedLives(opt.value)}
                >
                  {/* Corazones */}
                  <div style={styles.heartsRow}>
                    {opt.value === 99 ? (
                      <span style={styles.heartInfinite}>∞</span>
                    ) : (
                      Array.from({ length: Math.min(opt.value, 5) }).map((_, i) => (
                        <span key={i} style={{ ...styles.heart, color: isSelected ? '#E63946' : '#333' }}>♥</span>
                      ))
                    )}
                  </div>
                  <div style={{ ...styles.livesLabel, color: isSelected ? '#f0f0f0' : '#888' }}>{opt.label}</div>
                  <div style={styles.livesDesc}>{opt.desc}</div>
                  {opt.recommended && (
                    <div style={styles.recommendedTag}>recomendado</div>
                  )}
                  {isSelected && <div style={styles.livesCheck}>✓</div>}
                </div>
              );
            })}
          </div>

          {/* Preview de vidas */}
          {selectedLives < 99 && (
            <div style={styles.livesPreview}>
              <span style={styles.livesPreviewLabel}>Cada jugador tendrá:</span>
              <div style={styles.livesPreviewHearts}>
                {Array.from({ length: selectedLives }).map((_, i) => (
                  <span key={i} style={styles.heartPreview}>♥</span>
                ))}
              </div>
              <span style={styles.livesPreviewNote}>— Cada vinculo que muere resta 1 vida a ambos jugadores</span>
            </div>
          )}
        </div>

        {error && <div style={styles.error}>⚠ {error}</div>}

        <div style={styles.info}>
          <p style={styles.infoText}>
            Después de crear la run recibirás un{' '}
            <strong style={{ color: '#FFD60A' }}>código de invitación</strong>{' '}
            para compartirle a tu compañero.
          </p>
        </div>

        <div style={styles.btnRow}>
          <button type="button" onClick={onCancel} style={styles.btnCancel}>Cancelar</button>
          <button type="submit" style={{ ...styles.btnCreate, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Creando...' : '▶ Crear Run'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '720px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' },
  back: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', background:'none', border:'1px solid #2a2a2a', color:'#888', padding:'8px 14px', borderRadius:'3px', cursor:'pointer' },
  title: { fontFamily:"'Press Start 2P',monospace", fontSize:'14px', color:'#FFD60A', margin:0 },

  platformGroup: { marginBottom: '24px' },
  platformLabel: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' },
  platformTag: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', background:'rgba(255,214,10,0.1)', border:'1px solid rgba(255,214,10,0.3)', color:'#FFD60A', padding:'4px 10px', borderRadius:'2px', flexShrink:0 },
  platformName: { fontSize:'12px', color:'#555', flexShrink:0 },
  platformLine: { flex:1, height:'1px', background:'#1e1e1e' },

  gameGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'8px' },
  gameCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:'4px', padding:'14px', cursor:'pointer', transition:'all 0.15s', position:'relative', overflow:'hidden' },
  gameAccent: { position:'absolute', top:0, left:0, right:0, height:'3px' },
  gameColorDot: { width:'20px', height:'20px', borderRadius:'50%', marginBottom:'8px' },
  gameName: { fontFamily:"'Press Start 2P',monospace", fontSize:'7px', color:'#f0f0f0', marginBottom:'5px', lineHeight:1.7 },
  gameGen: { fontSize:'10px', color:'#555' },
  checkMark: { position:'absolute', top:'10px', right:'10px', fontSize:'12px', color:'#2DC653', fontWeight:'bold' },

  livesSection: { marginBottom: '24px' },
  livesGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'8px', marginBottom:'14px' },
  livesCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:'4px', padding:'14px 12px', cursor:'pointer', transition:'all 0.15s', position:'relative', textAlign:'center' },
  livesCardSelected: { background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,0.4)' },
  heartsRow: { display:'flex', gap:'3px', justifyContent:'center', marginBottom:'8px', minHeight:'22px', alignItems:'center' },
  heart: { fontSize:'18px', transition:'color 0.15s' },
  heartInfinite: { fontSize:'22px', color:'#E63946', fontWeight:'bold' },
  livesLabel: { fontFamily:"'Press Start 2P',monospace", fontSize:'7px', marginBottom:'6px', transition:'color 0.15s' },
  livesDesc: { fontSize:'10px', color:'#555', lineHeight:1.5 },
  recommendedTag: { fontFamily:"'Press Start 2P',monospace", fontSize:'6px', color:'#2DC653', background:'rgba(45,198,83,0.1)', border:'1px solid rgba(45,198,83,0.2)', padding:'2px 6px', borderRadius:'2px', marginTop:'6px', display:'inline-block' },
  livesCheck: { position:'absolute', top:'8px', right:'8px', fontSize:'12px', color:'#2DC653', fontWeight:'bold' },
  livesPreview: { background:'rgba(230,57,70,0.06)', border:'1px solid rgba(230,57,70,0.15)', borderRadius:'3px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' },
  livesPreviewLabel: { fontSize:'11px', color:'#888' },
  livesPreviewHearts: { display:'flex', gap:'4px' },
  heartPreview: { fontSize:'20px', color:'#E63946' },
  livesPreviewNote: { fontSize:'11px', color:'#555', flex:1 },

  error: { background:'rgba(230,57,70,0.1)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:'3px', padding:'10px 14px', fontSize:'12px', color:'#E63946', marginBottom:'16px' },
  info: { background:'rgba(255,214,10,0.05)', border:'1px solid rgba(255,214,10,0.15)', borderRadius:'3px', padding:'12px 16px', marginBottom:'24px' },
  infoText: { fontSize:'12px', color:'#bbb', margin:0 },
  btnRow: { display:'flex', gap:'10px' },
  btnCancel: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', background:'transparent', border:'1px solid #2a2a2a', color:'#888', padding:'12px 20px', borderRadius:'3px', cursor:'pointer' },
  btnCreate: { fontFamily:"'Press Start 2P',monospace", fontSize:'9px', background:'#E63946', color:'#fff', border:'none', padding:'12px 24px', borderRadius:'3px', cursor:'pointer', letterSpacing:'1px' },
};
