import { useState, useEffect } from 'react';
import RunList from './RunList';
import RunDetail from './RunDetail';
import CreateRun from './CreateRun';
import JoinRun from './JoinRun';

export default function Dashboard({ session, profile, onSignOut, supaFetch }) {
  const [view, setView] = useState('runs'); // 'runs' | 'create' | 'join' | 'detail'
  const [runs, setRuns] = useState([]);
  const [activeRun, setActiveRun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRuns();
  }, []);

  async function loadRuns() {
    setLoading(true);
    try {
      const data = await supaFetch(
        `/runs?or=(player1_id.eq.${profile.id},player2_id.eq.${profile.id})&order=created_at.desc&select=*,player1:profiles!player1_id(id,username,avatar_color),player2:profiles!player2_id(id,username,avatar_color)`
      );
      setRuns(data || []);
    } catch (e) {
      console.error('Error loading runs', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRun(runData) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRun = await supaFetch('/runs', {
      method: 'POST',
      body: JSON.stringify({
        player1_id: profile.id,
        game: runData.game,
        lives_per_player: runData.lives || 3,
        player1_lives: runData.lives || 3,
        player2_lives: runData.lives || 3,
        invite_code: code,
        status: 'waiting',
      }),
    });
    await loadRuns();
    setView('runs');
  }

  async function handleJoinRun(code) {
    const runs = await supaFetch(`/runs?invite_code=eq.${code.toUpperCase()}&status=eq.waiting`);
    if (!runs || runs.length === 0) throw new Error('Codigo invalido o la run ya tiene 2 jugadores');
    const run = runs[0];
    if (run.player1_id === profile.id) throw new Error('No puedes unirte a tu propia run');
    await supaFetch(`/runs?id=eq.${run.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ player2_id: profile.id, status: 'active' }),
    });
    await loadRuns();
    setView('runs');
  }

  function openRun(run) {
    setActiveRun(run);
    setView('detail');
  }

  return (
    <div style={styles.wrapper}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.avatar(profile.avatar_color)}>{profile.username[0].toUpperCase()}</span>
          <div>
            <div style={styles.username}>{profile.username}</div>
            <div style={styles.email}>{session.user.email}</div>
          </div>
        </div>
        <button onClick={onSignOut} style={styles.signOutBtn}>Salir</button>
      </div>

      {/* Navigation */}
      {view !== 'detail' && (
        <div style={styles.nav}>
          <button style={{...styles.navBtn, ...(view === 'runs' ? styles.navActive : {})}} onClick={() => setView('runs')}>
            Mis Runs
          </button>
          <button style={{...styles.navBtn, ...(view === 'create' ? styles.navActive : {})}} onClick={() => setView('create')}>
            + Nueva Run
          </button>
          <button style={{...styles.navBtn, ...(view === 'join' ? styles.navActive : {})}} onClick={() => setView('join')}>
            Unirse
          </button>
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {view === 'runs' && (
          <RunList
            runs={runs}
            loading={loading}
            profile={profile}
            onOpenRun={openRun}
            onRefresh={loadRuns}
          />
        )}
        {view === 'create' && (
          <CreateRun
            onSubmit={handleCreateRun}
            onCancel={() => setView('runs')}
          />
        )}
        {view === 'join' && (
          <JoinRun
            onSubmit={handleJoinRun}
            onCancel={() => setView('runs')}
          />
        )}
        {view === 'detail' && activeRun && (
          <RunDetail
            run={activeRun}
            profile={profile}
            supaFetch={supaFetch}
            onBack={() => { setView('runs'); loadRuns(); }}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: '80vh', maxWidth: '1000px', margin: '0 auto', padding: '0 20px 60px' },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0',
    borderBottom: '1px solid #2a2a2a',
    marginBottom: '24px',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: (color) => ({
    width: '40px', height: '40px',
    background: color || '#E63946',
    borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '14px',
    color: '#fff',
    flexShrink: 0,
  }),
  username: { fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#f0f0f0', marginBottom: '4px' },
  email: { fontSize: '11px', color: '#888' },
  signOutBtn: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px',
    background: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#888',
    padding: '8px 14px',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    gap: '8px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  navBtn: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px',
    background: '#161616',
    border: '1px solid #2a2a2a',
    color: '#888',
    padding: '10px 18px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  navActive: {
    background: 'rgba(255,214,10,0.08)',
    borderColor: '#FFD60A',
    color: '#FFD60A',
  },
  content: {},
};
