import { useState, useEffect } from 'react';
import { GAMES } from '../../data/games.ts';
import GymTracker from './GymTracker';
import PokemonLinks from './PokemonLinks';

const GAME_NAMES = {
  firered:'Rojo Fuego', leafgreen:'Verde Hoja', ruby:'Rubi', sapphire:'Zafiro', emerald:'Esmeralda',
  diamond:'Diamante', pearl:'Perla', platinum:'Platino', heartgold:'HeartGold', soulsilver:'SoulSilver',
  black:'Negro', white:'Blanco', black2:'Negro 2', white2:'Blanco 2',
};
const GAME_COLORS = {
  firered:'#E63946', leafgreen:'#2DC653', ruby:'#cc0000', sapphire:'#457B9D', emerald:'#00a36c',
  diamond:'#5b8dee', pearl:'#e8a0c8', platinum:'#c8c8f0', heartgold:'#FFD60A', soulsilver:'#a8c8e8',
  black:'#555', white:'#e8e8e8', black2:'#1a1a3a', white2:'#f0f0ff',
};

// Colores distintos garantizados para el par de jugadores
const PLAYER_COLOR_PAIRS = [
  ['#E63946', '#457B9D'],  // rojo / azul
  ['#FFD60A', '#9B5DE5'],  // amarillo / morado
  ['#2DC653', '#FF6B35'],  // verde / naranja
  ['#F15BB5', '#00BBF9'],  // rosa / celeste
];

export default function RunDetail({ run, profile, supaFetch, onBack }) {
  const [tab, setTab]           = useState('gyms');
  const [gymProgress, setGymProgress] = useState([]);
  const [pokemonLinks, setPokemonLinks] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [partnerProfile, setPartnerProfile] = useState(null);

  const isPlayer1 = run.player1_id === profile.id;
  const myId      = profile.id;
  const partnerId = isPlayer1 ? run.player2_id : run.player1_id;
  const gameData  = GAMES.find(g => g.id === run.game);
  const gameColor = GAME_COLORS[run.game] || '#888';
  const gameName  = GAME_NAMES[run.game] || run.game;

  // Asignar colores distintos a los dos jugadores
  // Player1 siempre usa su avatar_color original
  // Player2 usa su avatar_color, pero si son iguales, se le asigna uno diferente
  function getDistinctColors(p1Color, p2Color) {
    if (!p2Color) return { myColor: p1Color, partnerColor: '#457B9D' };
    // Si son el mismo color (o muy parecidos), forzar distincion
    if (p1Color === p2Color) {
      const pair = PLAYER_COLOR_PAIRS.find(([a]) => a === p1Color)
        || PLAYER_COLOR_PAIRS[0];
      return { myColor: pair[0], partnerColor: pair[1] };
    }
    return { myColor: p1Color, partnerColor: p2Color };
  }

  const { myColor, partnerColor } = getDistinctColors(
    profile.avatar_color,
    partnerProfile?.avatar_color
  );

  // Perfil enriquecido con color garantizadamente distinto
  const myProfileColored      = { ...profile, avatar_color: myColor };
  const partnerProfileColored = partnerProfile
    ? { ...partnerProfile, avatar_color: partnerColor }
    : null;

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, [run.id]);

  async function loadAll() {
    try {
      const [gyms, links] = await Promise.all([
        supaFetch(`/gym_progress?run_id=eq.${run.id}&order=gym_number.asc&select=*`),
        supaFetch(`/pokemon_links?run_id=eq.${run.id}&order=created_at.asc&select=*`),
      ]);

      if (partnerId && !partnerProfile) {
        const p = await supaFetch(`/profiles?id=eq.${partnerId}&select=*`);
        if (p && p.length > 0) setPartnerProfile(p[0]);
      }

      setGymProgress(gyms || []);
      setPokemonLinks(links || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleGym(gymNumber, gymName, currentDefeated) {
    const existing = gymProgress.find(g => g.player_id === myId && g.gym_number === gymNumber);
    if (existing) {
      await supaFetch(`/gym_progress?id=eq.${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          defeated: !currentDefeated,
          defeated_at: !currentDefeated ? new Date().toISOString() : null,
        }),
      });
    } else {
      await supaFetch('/gym_progress', {
        method: 'POST',
        body: JSON.stringify({
          run_id: run.id, player_id: myId,
          gym_number: gymNumber, gym_name: gymName,
          defeated: true, defeated_at: new Date().toISOString(),
        }),
      });
    }
    await loadAll();
  }

  // Nueva logica de add pokemon:
  // Busca si ya existe un link en esa ruta.
  // Si existe: hace PATCH para actualizar el campo de mi jugador.
  // Si no existe: crea uno nuevo con solo mis datos (el partner va en blanco).
  async function addPokemon(linkData) {
    const { route_name, my_pokemon, my_nickname, existing_link_id } = linkData;

    if (existing_link_id) {
      // El compañero ya registró esta ruta — actualizo el link existente
      const myPokeField   = isPlayer1 ? 'player1_pokemon'  : 'player2_pokemon';
      const myNickField   = isPlayer1 ? 'player1_nickname' : 'player2_nickname';
      await supaFetch(`/pokemon_links?id=eq.${existing_link_id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          [myPokeField]: my_pokemon,
          [myNickField]: my_nickname || null,
        }),
      });
    } else {
      // Soy el primero en registrar esta ruta
      await supaFetch('/pokemon_links', {
        method: 'POST',
        body: JSON.stringify({
          run_id: run.id,
          route_name,
          player1_id: run.player1_id,
          player2_id: run.player2_id || myId,
          player1_pokemon: isPlayer1 ? my_pokemon : '',
          player2_pokemon: isPlayer1 ? '' : my_pokemon,
          player1_nickname: isPlayer1 ? (my_nickname || null) : null,
          player2_nickname: isPlayer1 ? null : (my_nickname || null),
          status: 'alive',
        }),
      });
    }
    await loadAll();
  }

  async function updateLinkStatus(linkId, status) {
    await supaFetch(`/pokemon_links?id=eq.${linkId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadAll();
  }

  const myGyms      = gymProgress.filter(g => g.player_id === myId);
  const partnerGyms = gymProgress.filter(g => g.player_id === partnerId);
  const totalGyms   = gameData ? gameData.gyms.length : 8;
  const myDefeated  = myGyms.filter(g => g.defeated).length;
  const partnerDefeated = partnerGyms.filter(g => g.defeated).length;
  const deadLinks   = pokemonLinks.filter(l => l.status === 'dead').length;

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.back}>← Mis Runs</button>
        <div style={styles.runInfo}>
          <div style={{ ...styles.gameTag, borderColor: gameColor, color: gameColor }}>{gameName}</div>
          <div style={styles.players}>
            <span style={{ ...styles.playerTag, color: myColor }}>{profile.username}</span>
            <span style={styles.vs}>⚔</span>
            {partnerProfileColored
              ? <span style={{ ...styles.playerTag, color: partnerColor }}>{partnerProfileColored.username}</span>
              : <span style={styles.waitingPartner}>{run.status === 'waiting' ? 'Esperando...' : 'P2'}</span>
            }
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>TUS GIMNASIOS</span>
          <span style={{ ...styles.statVal, color: myColor }}>{myDefeated}/{totalGyms}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>GYMS DE {(partnerProfileColored?.username || 'COMPAÑERO').toUpperCase()}</span>
          <span style={{ ...styles.statVal, color: partnerColor }}>{partnerDefeated}/{totalGyms}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>RUTAS CON POKEMON</span>
          <span style={styles.statVal}>{[...new Set(pokemonLinks.map(l => l.route_name))].length}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>VINCULOS MUERTOS</span>
          <span style={{ ...styles.statVal, color: deadLinks > 0 ? '#E63946' : '#f0f0f0' }}>{deadLinks}</span>
        </div>
      </div>

      {/* Invite code si está waiting */}
      {run.status === 'waiting' && (
        <div style={styles.inviteBanner}>
          <span style={styles.inviteText}>Comparte este codigo:</span>
          <span style={styles.inviteCode}>{run.invite_code}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'gyms' ? styles.tabActive : {}) }} onClick={() => setTab('gyms')}>
          🏆 Gimnasios
        </button>
        <button style={{ ...styles.tab, ...(tab === 'pokemon' ? styles.tabActive : {}) }} onClick={() => setTab('pokemon')}>
          🔗 Pokemon
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingMsg}>Cargando...</div>
      ) : (
        <>
          {tab === 'gyms' && gameData && (
            <GymTracker
              gyms={gameData.gyms}
              myProgress={myGyms}
              partnerProgress={partnerGyms}
              myProfile={myProfileColored}
              partnerProfile={partnerProfileColored}
              onToggle={toggleGym}
            />
          )}
          {tab === 'pokemon' && gameData && (
            <PokemonLinks
              links={pokemonLinks}
              routes={gameData.routes}
              myId={myId}
              isPlayer1={isPlayer1}
              myProfile={myProfileColored}
              partnerProfile={partnerProfileColored}
              onAdd={addPokemon}
              onUpdateStatus={updateLinkStatus}
            />
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  wrapper: { paddingBottom: '40px' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' },
  back: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
    background: 'none', border: '1px solid #2a2a2a', color: '#888',
    padding: '8px 14px', borderRadius: '3px', cursor: 'pointer', flexShrink: 0,
  },
  runInfo: { flex: 1 },
  gameTag: {
    display: 'inline-block', fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px', border: '1px solid', padding: '4px 10px', borderRadius: '2px', marginBottom: '10px',
  },
  players: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  playerTag: { fontFamily: "'Press Start 2P', monospace", fontSize: '11px' },
  vs: { fontSize: '14px', color: '#2a2a2a' },
  waitingPartner: { fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#555' },

  statsBar: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1px', background: '#2a2a2a', border: '1px solid #2a2a2a',
    borderRadius: '4px', overflow: 'hidden', marginBottom: '20px',
  },
  statItem: { background: '#161616', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#555', letterSpacing: '0.5px' },
  statVal: { fontFamily: "'Press Start 2P', monospace", fontSize: '16px', color: '#f0f0f0' },

  inviteBanner: {
    background: 'rgba(255,214,10,0.06)', border: '1px solid rgba(255,214,10,0.2)',
    borderRadius: '4px', padding: '14px 20px', marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
  },
  inviteText: { fontSize: '12px', color: '#bbb' },
  inviteCode: { fontFamily: "'Press Start 2P', monospace", fontSize: '18px', color: '#FFD60A', letterSpacing: '4px' },

  tabs: { display: 'flex', gap: '0', borderBottom: '1px solid #2a2a2a', marginBottom: '24px' },
  tab: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
    background: 'none', border: 'none', borderBottom: '2px solid transparent',
    color: '#888', padding: '12px 20px', cursor: 'pointer', transition: 'all 0.15s',
  },
  tabActive: { color: '#FFD60A', borderBottomColor: '#FFD60A' },
  loadingMsg: { color: '#888', padding: '40px 0', textAlign: 'center' },
};
