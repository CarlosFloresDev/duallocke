/** Small PokeAPI client with in-memory caching. Names are English slugs (e.g. "nidoran-m"). */

export interface PokemonInfo {
  id: number;
  name: string;
  sprite: string | null;
}

export interface EvolutionStep {
  name: string;
  stage: number;
  method: string | null;
}

const API = 'https://pokeapi.co/api/v2';
const pokemonCache = new Map<string, Promise<PokemonInfo | null>>();
const chainCache = new Map<string, Promise<EvolutionStep[] | null>>();

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function displayName(slug: string): string {
  return slug
    .split('-')
    .map((p) => (p === 'm' ? '♂' : p === 'f' ? '♀' : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
    .replace(/ (♂|♀)$/, '$1');
}

export function getPokemon(name: string): Promise<PokemonInfo | null> {
  const slug = toSlug(name);
  if (!slug) return Promise.resolve(null);
  let pending = pokemonCache.get(slug);
  if (!pending) {
    pending = fetch(`${API}/pokemon/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) =>
        d
          ? {
              id: d.id as number,
              name: d.name as string,
              sprite: (d.sprites?.other?.['official-artwork']?.front_default ?? d.sprites?.front_default ?? null) as string | null,
            }
          : null,
      )
      .catch(() => null);
    pokemonCache.set(slug, pending);
  }
  return pending;
}

function formatMethod(d: Record<string, any> | undefined): string | null {
  if (!d) return null;
  const clean = (s: string) => s.replace(/-/g, ' ');
  if (d.min_level) return `Nv. ${d.min_level}`;
  if (d.item?.name) return `Usar ${clean(d.item.name)}`;
  if (d.held_item?.name) return `Equipar ${clean(d.held_item.name)}`;
  if (d.trigger?.name === 'trade') return 'Intercambio';
  if (d.known_move?.name) return `Aprender ${clean(d.known_move.name)}`;
  if (d.min_happiness) return 'Amistad';
  if (d.min_beauty) return 'Belleza';
  if (d.time_of_day) return d.time_of_day === 'day' ? 'De día' : 'De noche';
  if (d.location?.name) return `En ${clean(d.location.name)}`;
  return 'Especial';
}

export function getEvolutionChain(name: string): Promise<EvolutionStep[] | null> {
  const slug = toSlug(name);
  if (!slug) return Promise.resolve(null);
  let pending = chainCache.get(slug);
  if (!pending) {
    pending = (async () => {
      try {
        const p = await fetch(`${API}/pokemon/${slug}`).then((r) => (r.ok ? r.json() : null));
        if (!p) return null;
        const species = await fetch(p.species.url).then((r) => (r.ok ? r.json() : null));
        if (!species?.evolution_chain?.url) return null;
        const chain = await fetch(species.evolution_chain.url).then((r) => (r.ok ? r.json() : null));
        if (!chain) return null;
        const steps: EvolutionStep[] = [];
        const walk = (node: any, stage: number) => {
          steps.push({ name: node.species.name, stage, method: formatMethod(node.evolution_details?.[0]) });
          (node.evolves_to ?? []).forEach((n: any) => walk(n, stage + 1));
        };
        walk(chain.chain, 0);
        return steps;
      } catch {
        return null;
      }
    })();
    chainCache.set(slug, pending);
  }
  return pending;
}
