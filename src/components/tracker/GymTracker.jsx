import PokeImage from './PokeImage';

// Imagen de los lideres de gimnasio usando PokeAPI trainer sprites via bulbapedia o sprites conocidos
// Para los lideres de gym usamos sus Pokemon principales como representacion visual
const GYM_LEADER_POKEMON = {
  // Kanto
  'Brock':     'geodude',     'Misty':      'starmie',
  'Lt. Surge': 'raichu',     'Erika':      'vileplume',
  'Koga':      'weezing',    'Sabrina':    'alakazam',
  'Blaine':    'arcanine',   'Giovanni':   'nidoking',
  // Johto
  'Falkner':   'pidgeot',    'Bugsy':      'scyther',
  'Whitney':   'miltank',    'Morty':      'gengar',
  'Chuck':     'machamp',    'Jasmine':    'steelix',
  'Pryce':     'dewgong',    'Clair':      'kingdra',
  // Hoenn
  'Roxanne':   'nosepass',   'Brawly':     'hariyama',
  'Wattson':   'magneton',   'Flannery':   'torkoal',
  'Norman':    'slaking',    'Winona':     'altaria',
  'Tate & Liza':'solrock',   'Juan':       'kingdra',
  'Wallace':   'milotic',
  // Sinnoh
  'Roark':     'cranidos',   'Gardenia':   'roserade',
  'Maylene':   'lucario',    'Crasher Wake':'floatzel',
  'Fantina':   'mismagius',  'Byron':      'bastiodon',
  'Candice':   'froslass',   'Volkner':    'electivire',
  // Unova
  'Cilan / Chili / Cress': 'simisage',
  'Lenora':    'watchog',    'Burgh':      'leavanny',
  'Elesa':     'zebstrika',  'Clay':       'excadrill',
  'Skyla':     'swanna',     'Brycen':     'beartic',
  'Drayden':   'haxorus',    'Iris':       'haxorus',
  'Cheren':    'stoutland',  'Roxie':      'scolipede',
  'Marlon':    'jellicent',
};

const TYPE_COLORS = {
  'Roca':'#b8a038','Agua':'#6890f0','Electrico':'#f8d030','Planta':'#78c850',
  'Veneno':'#a040a0','Psiquico':'#f85888','Fuego':'#f08030','Tierra':'#e0c068',
  'Lucha':'#c03028','Volador':'#a890f0','Bicho':'#a8b820','Fantasma':'#705898',
  'Normal':'#a8a878','Hielo':'#98d8d8','Dragon':'#7038f8','Acero':'#b8b8d0',
  'Hada':'#ee99ac',
};

export default function GymTracker({ gyms, myProgress, partnerProgress, myProfile, partnerProfile, onToggle }) {
  function isDefeated(progress, gymNumber) {
    return progress.some(g => g.gym_number === gymNumber && g.defeated);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: myProfile.avatar_color }}></div>
          <span style={{ ...styles.legendName, color: myProfile.avatar_color }}>{myProfile.username} (tú)</span>
        </div>
        {partnerProfile && (
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: partnerProfile.avatar_color }}></div>
            <span style={{ ...styles.legendName, color: partnerProfile.avatar_color }}>{partnerProfile.username}</span>
          </div>
        )}
        <div style={styles.legendNote}>• Haz click en tu checkbox para marcar/desmarcar</div>
      </div>

      <div style={styles.gymList}>
        {gyms.map(gym => {
          const myDone     = isDefeated(myProgress, gym.number);
          const partnerDone = isDefeated(partnerProgress, gym.number);
          const bothDone   = myDone && (partnerProfile ? partnerDone : true);
          const typeColor  = TYPE_COLORS[gym.type] || '#888';
          const leaderPoke = GYM_LEADER_POKEMON[gym.leader] || gym.leader?.toLowerCase().replace(/[^a-z]/g, '');

          return (
            <div key={gym.number} style={{
              ...styles.gymRow,
              ...(bothDone ? styles.gymRowDone : {}),
              borderLeft: `3px solid ${bothDone ? '#2DC653' : typeColor}40`,
            }}>
              {/* Numero */}
              <div style={styles.gymNum}>{gym.number}</div>

              {/* Sprite del lider */}
              <div style={styles.gymSprite}>
                <PokeImage
                  name={leaderPoke}
                  size={56}
                  style={{ opacity: bothDone ? 1 : 0.6, transition: 'opacity 0.2s' }}
                />
              </div>

              {/* Info */}
              <div style={styles.gymInfo}>
                <div style={styles.gymLeader}>{gym.leader}</div>
                <div style={styles.gymLocation}>{gym.location}</div>
                <div style={styles.gymTags}>
                  <span style={{ ...styles.typeTag, background: typeColor + '22', color: typeColor, border: `1px solid ${typeColor}44` }}>
                    {gym.type}
                  </span>
                  {gym.levels && gym.levels !== '?' && (
                    <span style={styles.levelTag}>⚔ Rec. {gym.levels}</span>
                  )}
                </div>
              </div>

              {/* Checkboxes y medalla */}
              <div style={styles.gymRight}>
                {/* Mi checkbox (clickeable) */}
                <div style={styles.playerCheck} onClick={() => onToggle(gym.number, gym.name, myDone)}>
                  <div style={{
                    ...styles.checkBox,
                    background: myDone ? myProfile.avatar_color : 'transparent',
                    borderColor: myDone ? myProfile.avatar_color : '#333',
                    boxShadow: myDone ? `0 0 8px ${myProfile.avatar_color}66` : 'none',
                  }}>
                    {myDone && <span style={styles.checkMark}>✓</span>}
                  </div>
                  <span style={{ ...styles.checkLabel, color: myDone ? myProfile.avatar_color : '#555' }}>
                    {myProfile.username}
                  </span>
                </div>

                {/* Checkbox del compañero (solo lectura) */}
                {partnerProfile && (
                  <div style={styles.playerCheck}>
                    <div style={{
                      ...styles.checkBox,
                      background: partnerDone ? partnerProfile.avatar_color : 'transparent',
                      borderColor: partnerDone ? partnerProfile.avatar_color : '#333',
                      boxShadow: partnerDone ? `0 0 8px ${partnerProfile.avatar_color}66` : 'none',
                      cursor: 'default',
                    }}>
                      {partnerDone && <span style={styles.checkMark}>✓</span>}
                    </div>
                    <span style={{ ...styles.checkLabel, color: partnerDone ? partnerProfile.avatar_color : '#555' }}>
                      {partnerProfile.username}
                    </span>
                  </div>
                )}

                {/* Medalla */}
                <div style={{ ...styles.badge, ...(bothDone ? styles.badgeDone : {}) }}>
                  {bothDone ? '✓ ' : ''}{gym.badge}
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
  wrapper: {},
  legend: { display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '2px' },
  legendName: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px' },
  legendNote: { fontSize: '11px', color: '#444', marginLeft: 'auto' },

  gymList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  gymRow: {
    background: '#161616', border: '1px solid #2a2a2a', borderRadius: '4px',
    padding: '14px 20px', display: 'flex', alignItems: 'center',
    gap: '16px', transition: 'all 0.2s', flexWrap: 'wrap',
  },
  gymRowDone: { background: 'rgba(45,198,83,0.04)', borderColor: 'rgba(45,198,83,0.15)' },

  gymNum: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '16px',
    color: 'rgba(230,57,70,0.25)', flexShrink: 0, width: '20px', textAlign: 'center',
  },
  gymSprite: { flexShrink: 0 },
  gymInfo: { flex: 1, minWidth: '140px' },
  gymLeader: { fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#f0f0f0', marginBottom: '4px' },
  gymLocation: { fontSize: '11px', color: '#555', marginBottom: '6px' },
  gymTags: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  typeTag: { fontSize: '10px', padding: '2px 8px', borderRadius: '20px', display: 'inline-block' },
  levelTag: {
    fontSize: '10px', color: '#FFD60A', background: 'rgba(255,214,10,0.08)',
    border: '1px solid rgba(255,214,10,0.2)', padding: '2px 8px', borderRadius: '20px',
  },

  gymRight: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', flexShrink: 0 },
  playerCheck: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '5px', cursor: 'pointer', userSelect: 'none',
  },
  checkBox: {
    width: '32px', height: '32px', border: '2px solid',
    borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  checkMark: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  checkLabel: { fontFamily: "'Press Start 2P', monospace", fontSize: '6px', textAlign: 'center', maxWidth: '60px' },
  badge: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#333',
    border: '1px solid #1e1e1e', padding: '4px 8px', borderRadius: '2px', transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  badgeDone: { color: '#2DC653', borderColor: 'rgba(45,198,83,0.3)', background: 'rgba(45,198,83,0.08)' },
};
