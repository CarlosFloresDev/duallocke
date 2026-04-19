import { useState, useEffect } from 'react';
import { GAMES } from '../../data/games.ts';
import GymTracker    from './GymTracker';
import PokemonLinks  from './PokemonLinks';
import TeamDisplay   from './TeamDisplay';
import LivesDisplay  from './LivesDisplay';

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
const PLAYER_COLOR_PAIRS = [
  ['#E63946','#457B9D'], ['#FFD60A','#9B5DE5'],
  ['#2DC653','#FF6B35'], ['#F15BB5','#00BBF9'],
];

export default function RunDetail({ run, profile, supaFetch, onBack }) {
  const [tab, setTab]                   = useState('gyms');
  const [gymProgress, setGymProgress]   = useState([]);
  const [pokemonLinks, setPokemonLinks] = useState([]);
  const [runData, setRunData]           = useState(run); // for live lives updates
  const [loading, setLoading]           = useState(true);
  const [partnerProfile, setPartnerProfile] = useState(null);

  const isPlayer1 = run.player1_id === profile.id;
  const myId      = profile.id;
  const partnerId = isPlayer1 ? run.player2_id : run.player1_id;
  const gameData  = GAMES.find(g => g.id === run.game);
  const gameColor = GAME_COLORS[run.game] || '#888';
  const gameName  = GAME_NAMES[run.game] || run.game;

  function getDistinctColors(c1, c2) {
    if (!c2) return { myColor: c1, partnerColor: '#457B9D' };
    if (c1 === c2) {
      const pair = PLAYER_COLOR_PAIRS.find(([a]) => a === c1) || PLAYER_COLOR_PAIRS[0];
      return { myColor: pair[0], partnerColor: pair[1] };
    }
    return { myColor: c1, partnerColor: c2 };
  }

  const { myColor, partnerColor } = getDistinctColors(profile.avatar_color, partnerProfile?.avatar_color);
  const myProfileColored      = { ...profile, avatar_color: myColor };
  const partnerProfileColored = partnerProfile ? { ...partnerProfile, avatar_color: partnerColor } : null;

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, [run.id]);

  async function loadAll() {
    try {
      const [gyms, links, freshRun] = await Promise.all([
        supaFetch(`/gym_progress?run_id=eq.${run.id}&order=gym_number.asc&select=*`),
        supaFetch(`/pokemon_links?run_id=eq.${run.id}&order=created_at.asc&select=*`),
        supaFetch(`/runs?id=eq.${run.id}&select=*`),
      ]);
      if (partnerId && !partnerProfile) {
        const p = await supaFetch(`/profiles?id=eq.${partnerId}&select=*`);
        if (p && p.length > 0) setPartnerProfile(p[0]);
      }
      setGymProgress(gyms || []);
      setPokemonLinks(links || []);
      if (freshRun && freshRun.length > 0) setRunData(freshRun[0]);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  }

  async function toggleGym(gymNumber, gymName, currentDefeated) {
    const existing = gymProgress.find(g => g.player_id === myId && g.gym_number === gymNumber);
    if (existing) {
      await supaFetch(`/gym_progress?id=eq.${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ defeated: !currentDefeated, defeated_at: !currentDefeated ? new Date().toISOString() : null }),
      });
    } else {
      await supaFetch('/gym_progress', {
        method: 'POST',
        body: JSON.stringify({ run_id: run.id, player_id: myId, gym_number: gymNumber, gym_name: gymName, defeated: true, defeated_at: new Date().toISOString() }),
      });
    }
    await loadAll();
  }

  async function addPokemon(linkData) {
    const { route_name, my_pokemon, my_nickname, existing_link_id } = linkData;
    if (existing_link_id) {
      const myPokeField = isPlayer1 ? 'player1_pokemon'  : 'player2_pokemon';
      const myNickField = isPlayer1 ? 'player1_nickname' : 'player2_nickname';
      await supaFetch(`/pokemon_links?id=eq.${existing_link_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [myPokeField]: my_pokemon, [myNickField]: my_nickname || null }),
      });
    } else {
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
      method: 'PATCH', body: JSON.stringify({ status }),
    });
    await loadAll();
  }

  const myGyms          = gymProgress.filter(g => g.player_id === myId);
  const partnerGyms     = gymProgress.filter(g => g.player_id === partnerId);
  const totalGyms       = gameData ? gameData.gyms.length : 8;
  const myDefeated      = myGyms.filter(g => g.defeated).length;
  const partnerDefeated = partnerGyms.filter(g => g.defeated).length;
  const deadLinks       = pokemonLinks.filter(l => l.status === 'dead').length;
  const livesPerPlayer  = runData.lives_per_player || 3;
  const myLives         = isPlayer1 ? (runData.player1_lives ?? livesPerPlayer) : (runData.player2_lives ?? livesPerPlayer);
  const partnerLives    = isPlayer1 ? (runData.player2_lives ?? livesPerPlayer) : (runData.player1_lives ?? livesPerPlayer);

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
          <span style={styles.statLabel}>TUS GYMS</span>
          <span style={{ ...styles.statVal, color: myColor }}>{myDefeated}/{totalGyms}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>GYMS {(partnerProfileColored?.username || 'P2').toUpperCase()}</span>
          <span style={{ ...styles.statVal, color: partnerColor }}>{partnerDefeated}/{totalGyms}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>POKÉMON</span>
          <span style={styles.statVal}>{[...new Set(pokemonLinks.map(l=>l.route_name))].length}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>MUERTES</span>
          <span style={{ ...styles.statVal, color: deadLinks > 0 ? '#E63946' : '#f0f0f0' }}>{deadLinks}</span>
        </div>
        {livesPerPlayer < 99 && (
          <>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>TUS VIDAS</span>
              <span style={{ ...styles.statVal, color: myLives === 0 ? '#E63946' : myColor }}>
                {myLives === 0 ? '☠' : myLives}/{livesPerPlayer}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>VIDAS {(partnerProfileColored?.username||'P2').toUpperCase()}</span>
              <span style={{ ...styles.statVal, color: partnerLives === 0 ? '#E63946' : partnerColor }}>
                {partnerLives === 0 ? '☠' : partnerLives}/{livesPerPlayer}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Vidas display */}
      <LivesDisplay
        run={runData}
        myProfile={myProfileColored}
        partnerProfile={partnerProfileColored}
        isPlayer1={isPlayer1}
      />

      {/* Invite code */}
      {run.status === 'waiting' && (
        <div style={styles.inviteBanner}>
          <span style={styles.inviteText}>Código de invitación:</span>
          <span style={styles.inviteCode}>{run.invite_code}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'gyms',    label: '🏆 Gimnasios' },
          { id: 'pokemon', label: '🔗 Pokémon'   },
          { id: 'team',    label: '⚔ Equipo'     },
        ].map(t => (
          <button
            key={t.id}
            style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
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
              gameId={run.game}
              myId={myId}
              isPlayer1={isPlayer1}
              myProfile={myProfileColored}
              partnerProfile={partnerProfileColored}
              onAdd={addPokemon}
              onUpdateStatus={updateLinkStatus}
            />
          )}
          {tab === 'team' && (
            <TeamDisplay
              links={pokemonLinks}
              myId={myId}
              isPlayer1={isPlayer1}
              myProfile={myProfileColored}
              partnerProfile={partnerProfileColored}
              supaFetch={supaFetch}
              runId={run.id}
            />
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  wrapper: { paddingBottom: '40px' },
  header: { display:'flex', alignItems:'flex-start', gap:'20px', marginBottom:'24px', flexWrap:'wrap' },
  back: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', background:'none', border:'1px solid #2a2a2a', color:'#888', padding:'8px 14px', borderRadius:'3px', cursor:'pointer', flexShrink:0 },
  runInfo: { flex:1 },
  gameTag: { display:'inline-block', fontFamily:"'Press Start 2P',monospace", fontSize:'8px', border:'1px solid', padding:'4px 10px', borderRadius:'2px', marginBottom:'10px' },
  players: { display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' },
  playerTag: { fontFamily:"'Press Start 2P',monospace", fontSize:'11px' },
  vs: { fontSize:'14px', color:'#2a2a2a' },
  waitingPartner: { fontFamily:"'Press Start 2P',monospace", fontSize:'10px', color:'#555' },
  statsBar: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px, 1fr))', gap:'1px', background:'#2a2a2a', border:'1px solid #2a2a2a', borderRadius:'4px', overflow:'hidden', marginBottom:'16px' },
  statItem: { background:'#161616', padding:'12px 14px', display:'flex', flexDirection:'column', gap:'4px' },
  statLabel: { fontFamily:"'Press Start 2P',monospace", fontSize:'6px', color:'#555' },
  statVal: { fontFamily:"'Press Start 2P',monospace", fontSize:'16px', color:'#f0f0f0' },
  inviteBanner: { background:'rgba(255,214,10,0.06)', border:'1px solid rgba(255,214,10,0.2)', borderRadius:'4px', padding:'14px 20px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' },
  inviteText: { fontSize:'12px', color:'#bbb' },
  inviteCode: { fontFamily:"'Press Start 2P',monospace", fontSize:'18px', color:'#FFD60A', letterSpacing:'4px' },
  tabs: { display:'flex', gap:'0', borderBottom:'1px solid #2a2a2a', marginBottom:'24px' },
  tab: { fontFamily:"'Press Start 2P',monospace", fontSize:'8px', background:'none', border:'none', borderBottom:'2px solid transparent', color:'#888', padding:'12px 20px', cursor:'pointer', transition:'all 0.15s' },
  tabActive: { color:'#FFD60A', borderBottomColor:'#FFD60A' },
  loadingMsg: { color:'#888', padding:'40px 0', textAlign:'center' },
};
