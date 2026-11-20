import { useAuth } from '../../hooks/useAuth';
import AuthScreen from './AuthScreen';
import Dashboard from './Dashboard';
import { Alert, Button, Loading } from './ui';

export default function TrackerApp() {
  const { profile, setProfile, loading, error, reload, logout } = useAuth();

  if (loading) return <Loading />;
  if (error && !profile) {
    return (
      <div className="mx-auto grid max-w-md gap-4 px-5 py-16">
        <Alert>No se pudo conectar con el servidor: {error}</Alert>
        <Button variant="secondary" onClick={reload}>
          Reintentar
        </Button>
      </div>
    );
  }
  if (!profile) return <AuthScreen onAuthed={setProfile} />;
  return <Dashboard profile={profile} onLogout={logout} onProfile={setProfile} />;
}
