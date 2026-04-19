import { useState, useEffect } from 'react';
import PokeImage from './PokeImage';

// Componente "Active Team" — muestra el equipo activo de cada jugador
// Los Pokemon en el equipo son los que tienen status 'alive'
// Los usuarios pueden marcar cuales están en su equipo activo (max 6)

export default function TeamDisplay({ links, myId, isPlayer1, myProfile, partnerProfile, supaFetch, runId }) {
  const [myTeam, setMyTeam] = useState([]);
  const [partnerTeam, setPartnerTeam] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [teamSlots, setTeamSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  // Todos los Pokemon vivos disponibles
  const aliveLinks = links.filter(l => l.status === 'alive' || l.status === 'box');

  const myAlivePokemon = aliveLinks
    .map(l => ({
      linkId: l.id,
      name:     isPlayer1 ? l.player1_pokemon : l.player2_pokemon,
      nickname: isPlayer1 ? l.player1_nickname : l.player2_nickname,
      route:    l.route_name,
      status:   l.status,
      inTeam:   isPlayer1 ? l.player1_in_team : l.player2_in_team,
    }))
    .filter(p => p.name && p.name.trim() !== '');

  const partnerAlivePokemon = aliveLinks
    .map(l => ({
      linkId: l.id,
      name:     isPlayer1 ? l.player2_pokemon : l.player1_pokemon,
      nickname: isPlayer1 ? l.player2_nickname : l.player1_nickname,
      route:    l.route_name,
      status:   l.status,
      inTeam:   isPlayer1 ? l.player2_in_team : l.player1_in_team,
    }))
    .filter(p => p.name && p.name.trim() !== '');

  useEffect(() => {
    setMyTeam(myAlivePokemon.filter(p => p.inTeam));
    setPartnerTeam(partnerAlivePokemon.filter(p => p.inTeam));
    setTeamSlots(myAlivePokemon.filter(p => p.inTeam).map(p => p.linkId));
  }, [links]);

  function toggleSlot(linkId) {
    setTeamSlots(prev => {
      if (prev.includes(linkId)) return prev.filter(id => id !== linkId);
      if (prev.length >= 6) return prev; // max 6
      return [...prev, linkId];
    });
  }

  async function saveTeam() {
    setSaving(true);
    try {
      const myTeamField = isPlayer1 ? 'player1_in_team' : 'player2_in_team';
      // Update all alive links
      await Promise.all(
        myAlivePokemon.map(p =>
          supaFetch(`/pokemon_links?id=eq.${p.linkId}`, {
            method: 'PATCH',
            body: JSON.stringify({ [myTeamField]: teamSlots.includes(p.linkId) }),
          })
        )
      );
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  }

  const currentMyTeam = myAlivePokemon.filter(p => teamSlots.includes(p.linkId));

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>⚔ Equipos activos</span>
        <button style={styles.editBtn} onClick={() => setEditMode(!editMode)}>
          {editMode ? '✕ Cancelar' : '✏ Editar mi equipo'}
        </button>
      </div>

      {/* Modo edición */}
      {editMode && (
        <div style={styles.editPanel}>
          <div style={styles.editHint}>
            Selecciona hasta <span style={{color:'#FFD60A'}}>6 Pokemon</span> para tu equipo activo.
            ({teamSlots.length}/6)
          </div>
          <div style={styles.pickGrid}>
            {myAlivePokemon.length === 0 ? (
              <div style={styles.noMons}>Registra Pokemon primero en la pestaña "Pokemon"</div>
            ) : (
              myAlivePokemon.map(p => {
                const selected = teamSlots.includes(p.linkId);
                return (
                  <div
                    key={p.linkId}
                    style={{
                      ...styles.pickCard,
                      ...(selected ? styles.pickCardSelected : {}),
                      ...(p.status === 'box' ? styles.pickCardBox : {}),
                    }}
                    onClick={() => toggleSlot(p.linkId)}
                  >
                    <PokeImage name={p.name} size={48} />
                    <div style={styles.pickName}>{p.nickname || p.name}</div>
                    <div style={styles.pickRoute}>{p.route}</div>
                    {selected && <div style={styles.pickCheck}>✓</div>}
                  </div>
                );
              })
            )}
          </div>
          <button
            style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
            onClick={saveTeam}
            disabled={saving}
          >
            {saving ? 'Guardando...' : '▶ Guardar equipo'}
          </button>
        </div>
      )}

      {/* Display de equipos */}
      {!editMode && (
        <div style={styles.teamsGrid}>
          <TeamCard
            profile={myProfile}
            team={currentMyTeam}
            isMe={true}
          />
          <div style={styles.teamVs}>⚔</div>
          <TeamCard
            profile={partnerProfile}
            team={partnerTeam}
            isMe={false}
          />
        </div>
      )}
    </div>
  );
}

function TeamCard({ profile, team, isMe }) {
  if (!profile) {
    return (
      <div style={cardStyles.wrapper}>
        <div style={cardStyles.header}>
          <div style={{ ...cardStyles.avatar, background: '#333' }}>?</div>
          <span style={cardStyles.name}>Esperando...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyles.wrapper}>
      {/* Header */}
      <div style={cardStyles.header}>
        <div style={{ ...cardStyles.avatar, background: profile.avatar_color }}>
          {profile.username[0].toUpperCase()}
        </div>
        <div>
          <div style={{ ...cardStyles.name, color: profile.avatar_color }}>{profile.username}</div>
          <div style={cardStyles.count}>{team.length}/6 Pokemon</div>
        </div>
      </div>

      {/* Slots del equipo */}
      <div style={cardStyles.slots}>
        {Array.from({ length: 6 }).map((_, i) => {
          const mon = team[i];
          return (
            <div key={i} style={{ ...cardStyles.slot, ...(mon ? cardStyles.slotFilled : cardStyles.slotEmpty) }}>
              {mon ? (
                <div style={cardStyles.monInSlot}>
                  <PokeImage name={mon.name} size={56} />
                  <div style={{ ...cardStyles.monName, color: profile.avatar_color }}>
                    {mon.nickname || mon.name}
                  </div>
                  {mon.nickname && (
                    <div style={cardStyles.monSpecies}>{mon.name}</div>
                  )}
                </div>
              ) : (
                <div style={cardStyles.emptySlot}>
                  <span style={cardStyles.emptyBall}>○</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pokeballs visuales */}
      <div style={cardStyles.balls}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              ...cardStyles.ball,
              background: i < team.length ? profile.avatar_color : '#2a2a2a',
              boxShadow: i < team.length ? `0 0 6px ${profile.avatar_color}66` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { marginTop: '0' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
  },
  sectionTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#f0f0f0' },
  editBtn: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '7px',
    background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)',
    color: '#FFD60A', padding: '7px 12px', borderRadius: '3px', cursor: 'pointer',
  },
  editPanel: {
    background: '#161616', border: '1px solid #2a2a2a', borderRadius: '4px',
    padding: '16px', marginBottom: '20px',
  },
  editHint: { fontSize: '12px', color: '#888', marginBottom: '14px' },
  pickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '14px' },
  pickCard: {
    background: '#0d0d0d', border: '2px solid #2a2a2a', borderRadius: '4px',
    padding: '10px 8px', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.15s', position: 'relative',
  },
  pickCardSelected: { border: '2px solid #2DC653', background: 'rgba(45,198,83,0.08)' },
  pickCardBox: { opacity: 0.5 },
  pickName: { fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#f0f0f0', marginTop: '4px', textTransform: 'capitalize' },
  pickRoute: { fontSize: '9px', color: '#555', marginTop: '2px' },
  pickCheck: {
    position: 'absolute', top: '4px', right: '4px',
    background: '#2DC653', color: '#000', borderRadius: '50%',
    width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: 'bold',
  },
  noMons: { color: '#555', fontSize: '12px', gridColumn: '1/-1', padding: '20px 0', textAlign: 'center' },
  saveBtn: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
    background: '#2DC653', color: '#000', border: 'none',
    padding: '10px 20px', borderRadius: '3px', cursor: 'pointer',
  },
  teamsGrid: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'start' },
  teamVs: { fontSize: '24px', color: '#2a2a2a', paddingTop: '40px', textAlign: 'center' },
};

const cardStyles = {
  wrapper: {
    background: '#161616', border: '1px solid #2a2a2a',
    borderRadius: '6px', padding: '16px', overflow: 'hidden',
  },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#fff', flexShrink: 0,
  },
  name: { fontFamily: "'Press Start 2P', monospace", fontSize: '9px', marginBottom: '3px' },
  count: { fontSize: '11px', color: '#555' },
  slots: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' },
  slot: { borderRadius: '4px', padding: '8px', textAlign: 'center', minHeight: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  slotFilled: { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a2a' },
  slotEmpty: { background: 'transparent', border: '1px dashed #1e1e1e' },
  monInSlot: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' },
  monName: { fontFamily: "'Press Start 2P', monospace", fontSize: '6px', textTransform: 'capitalize', textAlign: 'center' },
  monSpecies: { fontSize: '9px', color: '#555', textTransform: 'capitalize' },
  emptySlot: { opacity: 0.2 },
  emptyBall: { fontSize: '22px', color: '#444' },
  balls: { display: 'flex', gap: '6px', justifyContent: 'center' },
  ball: { width: '10px', height: '10px', borderRadius: '50%', transition: 'all 0.2s' },
};
