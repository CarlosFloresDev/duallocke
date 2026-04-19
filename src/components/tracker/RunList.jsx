const GAME_COLORS = {
  firered: '#E63946', leafgreen: '#2DC653', ruby: '#cc0000',
  sapphire: '#457B9D', emerald: '#00a36c',
  diamond: '#5b8dee', pearl: '#e8a0c8', platinum: '#c8c8f0',
  heartgold: '#FFD60A', soulsilver: '#a8c8e8',
  black: '#555', white: '#ddd', black2: '#1a1a3a', white2: '#f0f0ff',
};
const GAME_NAMES = {
  firered: 'Rojo Fuego', leafgreen: 'Verde Hoja', ruby: 'Rubi',
  sapphire: 'Zafiro', emerald: 'Esmeralda',
  diamond: 'Diamante', pearl: 'Perla', platinum: 'Platino',
  heartgold: 'HeartGold', soulsilver: 'SoulSilver',
  black: 'Negro', white: 'Blanco', black2: 'Negro 2', white2: 'Blanco 2',
};
const GAME_PLATFORM = {
  firered: 'GBA', leafgreen: 'GBA', ruby: 'GBA', sapphire: 'GBA', emerald: 'GBA',
  diamond: 'NDS', pearl: 'NDS', platinum: 'NDS', heartgold: 'NDS', soulsilver: 'NDS',
  black: 'NDS', white: 'NDS', black2: 'NDS', white2: 'NDS',
};

export default function RunList({ runs, loading, profile, onOpenRun, onRefresh }) {
  if (loading) return <div style={styles.empty}>Cargando runs...</div>;

  if (runs.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>☠</span>
        <p style={styles.emptyTitle}>Sin runs activas</p>
        <p style={styles.emptyDesc}>Crea una nueva run e invita a tu companero, o pide el codigo de invitacion para unirte.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Tus Runs ({runs.length})</span>
        <button onClick={onRefresh} style={styles.refreshBtn}>↻ Actualizar</button>
      </div>
      <div style={styles.list}>
        {runs.map(run => {
          const isP1 = run.player1_id === profile.id;
          const partner = isP1 ? run.player2 : run.player1;
          const color = GAME_COLORS[run.game] || '#888';
          const gameName = GAME_NAMES[run.game] || run.game;
          const platform = GAME_PLATFORM[run.game] || '';
          return (
            <div key={run.id} style={styles.runCard} onClick={() => onOpenRun(run)}>
              <div style={{ ...styles.runAccent, background: color }}></div>
              <div style={styles.runInner}>
                <div style={styles.runLeft}>
                  <div style={styles.gameRow}>
                    <span style={styles.gameName}>{gameName}</span>
                    <span style={{ ...styles.platformBadge, borderColor: color + '44', color }}>{platform}</span>
                  </div>
                  <div style={styles.runMeta}>
                    {partner
                      ? <span>vs <strong style={{ color: partner.avatar_color }}>{partner.username}</strong></span>
                      : <span style={{ color: '#888' }}>Esperando companero...</span>}
                  </div>
                  <div style={styles.createdAt}>
                    {new Date(run.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={styles.runRight}>
                  <span style={{
                    ...styles.statusBadge,
                    ...(run.status === 'active' ? styles.statusActive
                      : run.status === 'waiting' ? styles.statusWaiting
                      : styles.statusFinished)
                  }}>
                    {run.status === 'active' ? '▶ Activa' : run.status === 'waiting' ? '⏳ Esperando' : '✓ Terminada'}
                  </span>
                  {run.status === 'waiting' && (
                    <div style={styles.inviteCode}>
                      <span style={styles.inviteLabel}>CODIGO:</span>
                      <span style={styles.inviteValue}>{run.invite_code}</span>
                    </div>
                  )}
                  <span style={styles.arrow}>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  empty: { color: '#888', fontFamily: "'Space Mono', monospace", padding: '40px 0', textAlign: 'center' },
  emptyState: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '20px', opacity: 0.3 },
  emptyTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#888', marginBottom: '12px' },
  emptyDesc: { fontSize: '13px', color: '#555', maxWidth: '340px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  headerTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#888' },
  refreshBtn: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', background: 'none', border: '1px solid #2a2a2a', color: '#888', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  runCard: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' },
  runAccent: { height: '3px' },
  runInner: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  runLeft: {},
  gameRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  gameName: { fontFamily: "'Press Start 2P', monospace", fontSize: '11px', color: '#f0f0f0' },
  platformBadge: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', border: '1px solid', padding: '2px 6px', borderRadius: '2px' },
  runMeta: { fontSize: '13px', color: '#ccc', marginBottom: '4px' },
  createdAt: { fontSize: '11px', color: '#555' },
  runRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 },
  statusBadge: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', padding: '4px 8px', borderRadius: '2px' },
  statusActive: { background: 'rgba(45,198,83,0.15)', color: '#2DC653', border: '1px solid rgba(45,198,83,0.3)' },
  statusWaiting: { background: 'rgba(255,214,10,0.1)', color: '#FFD60A', border: '1px solid rgba(255,214,10,0.3)' },
  statusFinished: { background: 'rgba(136,136,136,0.1)', color: '#888', border: '1px solid #2a2a2a' },
  inviteCode: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
  inviteLabel: { fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#555' },
  inviteValue: { fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#FFD60A', letterSpacing: '2px' },
  arrow: { fontSize: '18px', color: '#2a2a2a' },
};
