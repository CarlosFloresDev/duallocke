// Muestra los corazones de vida de ambos jugadores
export default function LivesDisplay({ run, myProfile, partnerProfile, isPlayer1 }) {
  const livesPerPlayer = run.lives_per_player || 3;
  const myLives        = isPlayer1 ? (run.player1_lives ?? livesPerPlayer) : (run.player2_lives ?? livesPerPlayer);
  const partnerLives   = isPlayer1 ? (run.player2_lives ?? livesPerPlayer) : (run.player1_lives ?? livesPerPlayer);
  const infinite       = livesPerPlayer >= 99;

  if (infinite) return null; // No mostrar si son infinitas

  return (
    <div style={styles.wrapper}>
      <PlayerLives profile={myProfile}      lives={myLives}      max={livesPerPlayer} isMe={true}  />
      <div style={styles.sep}>—</div>
      <PlayerLives profile={partnerProfile} lives={partnerLives} max={livesPerPlayer} isMe={false} />
    </div>
  );
}

function PlayerLives({ profile, lives, max, isMe }) {
  if (!profile) return null;
  const isDead = lives === 0;

  return (
    <div style={styles.playerLives}>
      <div style={{ ...styles.playerName, color: profile.avatar_color }}>
        {profile.username}{isMe ? ' (tú)' : ''}
      </div>
      <div style={styles.hearts}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < lives;
          return (
            <span
              key={i}
              style={{
                ...styles.heart,
                color: filled ? '#E63946' : '#2a2a2a',
                textShadow: filled ? '0 0 8px rgba(230,57,70,0.6)' : 'none',
                transform: filled ? 'scale(1)' : 'scale(0.85)',
                transition: 'all 0.3s',
              }}
            >
              {filled ? '♥' : '♡'}
            </span>
          );
        })}
        {isDead && <span style={styles.deadTag}>☠ GAME OVER</span>}
      </div>
      <div style={styles.livesCount}>
        {isDead ? 'Sin vidas' : `${lives}/${max}`}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.15)',
    borderRadius: '4px', padding: '14px 20px', marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
  },
  sep: { color: '#2a2a2a', fontSize: '20px' },
  playerLives: { display: 'flex', flexDirection: 'column', gap: '4px' },
  playerName: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', marginBottom: '4px' },
  hearts: { display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' },
  heart: { fontSize: '22px', display: 'inline-block' },
  deadTag: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '7px',
    color: '#E63946', background: 'rgba(230,57,70,0.15)',
    border: '1px solid rgba(230,57,70,0.3)', padding: '3px 8px',
    borderRadius: '2px', marginLeft: '6px', animation: 'blink 1s step-end infinite',
  },
  livesCount: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#555' },
};
