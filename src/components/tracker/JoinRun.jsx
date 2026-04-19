import { useState } from 'react';

export default function JoinRun({ onSubmit, onCancel }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) { setError('Ingresa el codigo'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(code.trim());
    } catch (err) {
      setError(err.message || 'Codigo invalido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button onClick={onCancel} style={styles.back}>← Volver</button>
        <h2 style={styles.title}>Unirse a Run</h2>
      </div>

      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <span style={styles.icon}>🔗</span>
        </div>
        <p style={styles.desc}>
          Pide a tu companero el <strong style={{color:'#FFD60A'}}>codigo de invitacion</strong> de su run e ingrésalo aqui.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>CODIGO DE INVITACION</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              style={styles.codeInput}
              autoComplete="off"
            />
          </div>

          {error && <div style={styles.error}>⚠ {error}</div>}

          <div style={styles.btnRow}>
            <button type="button" onClick={onCancel} style={styles.btnCancel}>Cancelar</button>
            <button type="submit" style={{...styles.btnJoin, opacity: loading ? 0.6 : 1}} disabled={loading}>
              {loading ? 'Buscando...' : '▶ Unirme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '400px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' },
  back: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', background: 'none', border: '1px solid #2a2a2a', color: '#888', padding: '8px 14px', borderRadius: '3px', cursor: 'pointer' },
  title: { fontFamily: "'Press Start 2P', monospace", fontSize: '14px', color: '#FFD60A', margin: 0 },
  card: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '28px' },
  iconWrap: { textAlign: 'center', marginBottom: '16px' },
  icon: { fontSize: '36px' },
  desc: { fontSize: '13px', color: '#bbb', textAlign: 'center', marginBottom: '24px', lineHeight: 1.7 },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#888', letterSpacing: '1px', marginBottom: '10px' },
  codeInput: {
    width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '3px',
    padding: '14px', color: '#FFD60A', fontFamily: "'Press Start 2P', monospace",
    fontSize: '20px', letterSpacing: '6px', textAlign: 'center', outline: 'none',
    boxSizing: 'border-box', textTransform: 'uppercase',
  },
  error: { background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '3px', padding: '10px 14px', fontSize: '12px', color: '#E63946', marginBottom: '16px' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '20px' },
  btnCancel: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '12px 20px', borderRadius: '3px', cursor: 'pointer', flex: 1 },
  btnJoin: { fontFamily: "'Press Start 2P', monospace", fontSize: '9px', background: '#2DC653', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '3px', cursor: 'pointer', letterSpacing: '1px', flex: 1 },
};
