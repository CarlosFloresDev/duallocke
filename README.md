# Duallocke Soul Link — App completa

Web app para trackear tu Duallocke Soul Link Nuzlocke con tu companero en tiempo real.

## Stack

- **Astro** — Framework principal (paginas estaticas + componentes React)
- **React** — Componentes interactivos del tracker
- **Tailwind CSS** — Estilos de utilidad
- **Supabase** — Auth + base de datos + realtime
- **Vercel** — Deploy

---

## Setup en 10 minutos

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd duallocke-soul-link
npm install
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto nuevo (gratis)
2. En el dashboard: **SQL Editor → New Query**
3. Pega todo el contenido de `supabase_schema.sql` y ejecuta
4. Ve a **Settings → API** y copia la **Project URL** y la **anon key**

### 3. Configurar variables de entorno

Crea el archivo `.env` en la raiz del proyecto:

```env
PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre http://localhost:4321

---

## Deploy en Vercel

### Opcion A — Via GitHub (recomendado)

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/duallocke
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) → **Add New Project** → importa tu repo
3. En **Environment Variables** agrega:
   - `PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `PUBLIC_SUPABASE_ANON_KEY` = tu anon key
4. Click **Deploy** — listo en ~1 minuto

### Opcion B — Vercel CLI

```bash
npm i -g vercel
vercel
# Sigue las instrucciones, agrega las env vars cuando te las pida
```

---

## Estructura del proyecto

```
src/
  pages/
    index.astro          # Pagina principal: guia del Duallocke
    instalacion.astro    # Guia de instalacion por plataforma
    tracker.astro        # Tracker de runs (con React)
  
  components/
    tracker/
      TrackerApp.jsx     # Componente raiz del tracker
      AuthScreen.jsx     # Login / registro
      Dashboard.jsx      # Dashboard del usuario
      RunList.jsx        # Lista de runs del usuario
      CreateRun.jsx      # Formulario crear run nueva
      JoinRun.jsx        # Unirse con codigo
      RunDetail.jsx      # Vista detalle de una run
      GymTracker.jsx     # Checkboxes de gimnasios
      PokemonLinks.jsx   # Registro de vinculos Pokemon
  
  data/
    games.ts             # Datos de gimnasios y rutas por juego
  
  layouts/
    Layout.astro         # Layout base con nav y footer
  
  styles/
    global.css           # Variables CSS y estilos globales

supabase_schema.sql      # Schema SQL completo para Supabase
```

---

## Como usar el tracker

1. **Cada jugador** crea su cuenta en `/tracker`
2. **Jugador 1** crea una nueva run y elige el juego
3. **Jugador 1** comparte el **codigo de invitacion** (6 letras)
4. **Jugador 2** va a "Unirse" e ingresa el codigo
5. Ambos pueden ver y actualizar el progreso en tiempo real:
   - Marcar gimnasios vencidos con checkbox
   - Registrar vinculos de Pokemon por ruta
   - Actualizar estado de cada vinculo (vivo / muerto / PC)
6. La app hace **polling cada 10 segundos** para ver los cambios del companero

---

## Agregar mas juegos

Edita `src/data/games.ts` y agrega un nuevo objeto al array `GAMES` con:
- `id`, `name`, `generation`, `color`
- `gyms[]` — lista de gimnasios con `number`, `leader`, `type`, `badge`, `location`
- `routes[]` — lista de rutas con `id`, `name`, `order`

---

## Notas

- El diseño conserva el estilo retro pixel del HTML original (Press Start 2P + Space Mono)
- Tailwind se usa principalmente para layout, los estilos del tracker son inline React
- La autenticacion usa Supabase Auth con email/password
- Row Level Security (RLS) asegura que solo los jugadores de una run puedan ver su data
