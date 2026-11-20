import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Profile } from '../lib/types';

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setProfile(await api.me());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    setProfile(null);
  }, []);

  return { profile, setProfile, loading, error, reload, logout };
}
