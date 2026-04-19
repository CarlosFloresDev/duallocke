import { useState } from 'react';

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        if (!username.trim()) throw new Error('El nombre de usuario es obligatorio');
        await onSignUp(email, password, username.trim());
      }
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.topBar}></div>
        <div style={styles.header}>
          <span style={styles.icon}>⚔</span>
          <h1 style={styles.title}>DUALLOCKE<br/>TRACKER</h1>
          <p style={styles.subtitle}>Trackea tu run en tiempo real</p>
        </div>

        <div style={styles.tabs}>
          <button
            style={{...styles.tab, ...(mode === 'signin' ? styles.tabActive : {})}}
            onClick={() => { setMode('signin'); setError(''); }}
          >Iniciar sesión</button>
          <button
            style={{...styles.tab, ...(mode === 'signup' ? styles.tabActive : {})}}
            onClick={() => { setMode('signup'); setError(''); }}
          >Registrarse</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.field}>
              <label style={styles.label}>NOMBRE DE JUGADOR</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ash, Misty, Gary..."
                style={styles.input}
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>CONTRASEÑA</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={styles.error}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" style={{...styles.btn, opacity: loading ? 0.6 : 1}} disabled={loading}>
            {loading ? 'Cargando...' : mode === 'signin' ? '▶ Entrar' : '▶ Crear cuenta'}
          </button>
        </form>

        <p style={styles.footer}>
          Cada jugador necesita su propia cuenta para trackear su run
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  topBar: {
    height: '3px',
    background: 'linear-gradient(90deg, #E63946 0%, #FFD60A 50%, #457B9D 100%)',
  },
  header: {
    padding: '32px 28px 24px',
    textAlign: 'center',
  },
  icon: { fontSize: '28px', display: 'block', marginBottom: '12px' },
  title: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '16px',
    color: '#FFD60A',
    textShadow: '3px 3px 0 rgba(230,57,70,0.4)',
    margin: '0 0 10px',
    lineHeight: 1.6,
  },
  subtitle: { fontSize: '12px', color: '#888', margin: 0 },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #2a2a2a',
    borderTop: '1px solid #2a2a2a',
  },
  tab: {
    flex: 1,
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px',
    padding: '14px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#FFD60A',
    borderBottomColor: '#FFD60A',
    background: 'rgba(255,214,10,0.03)',
  },
  form: { padding: '24px 28px' },
  field: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '7px',
    color: '#888',
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  input: {
    width: '100%',
    background: '#0d0d0d',
    border: '1px solid #2a2a2a',
    borderRadius: '3px',
    padding: '10px 14px',
    color: '#f0f0f0',
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  error: {
    background: 'rgba(230,57,70,0.1)',
    border: '1px solid rgba(230,57,70,0.3)',
    borderRadius: '3px',
    padding: '10px 14px',
    fontSize: '12px',
    color: '#E63946',
    marginBottom: '16px',
  },
  btn: {
    width: '100%',
    background: '#E63946',
    color: '#fff',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '9px',
    padding: '14px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: 'background 0.15s',
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#555',
    padding: '0 28px 24px',
    margin: 0,
  },
};
