import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { GymProgress, PokemonLink, Profile, Run } from '../lib/types';

const POLL_MS = 3000;

interface RunData {
  run: Run;
  gyms: GymProgress[];
  links: PokemonLink[];
  players: Record<string, Profile>;
}

/**
 * Loads a run and keeps both players in sync. Every write bumps `runs.version`; the client polls that
 * single number (one tiny query) and only refetches the full run when it changes. Polling pauses while
 * the tab is hidden.
 */
export function useRunData(initial: Run) {
  const [data, setData] = useState<RunData>({ run: initial, gyms: [], links: [], players: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const version = useRef<number>(-1);

  const refresh = useCallback(async () => {
    try {
      const d = await api.getRun(initial.id);
      version.current = d.run.version;
      setData({ run: d.run, gyms: d.gyms, links: d.links, players: Object.fromEntries(d.players.map((p) => [p.id, p])) });
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [initial.id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState === 'visible') {
        try {
          const { version: v } = await api.runVersion(initial.id);
          if (v !== version.current) await refresh();
        } catch {
          /* transient network error: try again next tick */
        }
      }
      timer = setTimeout(tick, POLL_MS);
    };

    refresh().then(() => (timer = setTimeout(tick, POLL_MS)));
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [initial.id, refresh]);

  return { ...data, loading, error, refresh };
}
