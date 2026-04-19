import { useState, useEffect } from 'react';
import AuthScreen from './AuthScreen';
import Dashboard from './Dashboard';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Minimal supabase client inline for React components
async function supaFetch(path, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${opts.token || SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function authSignUp(email, password, username) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    // Es imperativo enviar el username dentro del objeto "data" 
    // para que el Trigger de la base de datos pueda extraerlo.
    body: JSON.stringify({ email, password, data: { username } }),
  });
  const data = await res.json();
  
  // Validar usando res.ok asegura que se capturen errores bajo msg, message o error_description
  if (!res.ok) {
    throw new Error(data.msg || data.message || data.error_description || data.error || 'Error en el registro');
  }
  return data;
}

async function authSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || data.error || 'Error de autenticacion');
  }
  return data;
}

async function authSignOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${token}` },
  });
}

export default function TrackerApp() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('duallocke_session');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        // Check expiry
        if (s.expires_at && Date.now() / 1000 < s.expires_at) {
          setSession(s);
          loadProfile(s.access_token, s.user.id);
        } else {
          localStorage.removeItem('duallocke_session');
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function loadProfile(token, userId) {
    try {
      const data = await supaFetch(`/profiles?id=eq.${userId}&select=*`, { token });
      if (data && data.length > 0) {
        setProfile(data[0]);
      }
    } catch (e) {
      console.error('Error loading profile', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(email, password) {
    const data = await authSignIn(email, password);
    localStorage.setItem('duallocke_session', JSON.stringify(data));
    setSession(data);
    await loadProfile(data.access_token, data.user.id);
  }

  async function handleSignUp(email, password, username) {
  // 1. Ejecutar el registro (el Trigger en BD insertara el perfil en paralelo)
  await authSignUp(email, password, username);

  // 2. Iniciar sesion para obtener el token de acceso y el objeto user
  const session = await authSignIn(email, password);

  // 3. Almacenar la sesion y cargar el perfil
  // (La operacion supaFetch hacia /profiles fue eliminada para evitar conflictos)
  localStorage.setItem('duallocke_session', JSON.stringify(session));
  setSession(session);
  await loadProfile(session.access_token, session.user.id);
}

  async function handleSignOut() {
    if (session) await authSignOut(session.access_token).catch(() => {});
    localStorage.removeItem('duallocke_session');
    setSession(null);
    setProfile(null);
  }

  function randomColor() {
    const colors = ['#E63946', '#FFD60A', '#457B9D', '#2DC653', '#FF6B35', '#9B5DE5', '#F15BB5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:'16px'}}>
        <div style={{fontFamily:"'Press Start 2P', monospace",fontSize:'10px',color:'#888'}}>Cargando...</div>
        <div style={{width:'40px',height:'40px',border:'3px solid #2a2a2a',borderTop:'3px solid #E63946',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
    );
  }

  return (
    <Dashboard
      session={session}
      profile={profile}
      onSignOut={handleSignOut}
      supaFetch={(path, opts) => supaFetch(path, { ...opts, token: session.access_token })}
    />
  );
}
