export type Game = {
  id: string;
  name: string;
  generation: number;
  platform: string;
  color: string;
  gyms: Gym[];
  routes: Route[];
};

export type Gym = {
  number: number;
  name: string;
  leader: string;
  type: string;
  badge: string;
  location: string;
  levels: string; // nivel recomendado del equipo del lider
};

export type Route = {
  id: string;
  name: string;
  order: number;
};

export const GAMES: Game[] = [

  // ─────────────────────────────────────────────
  // GBA — Generacion 1 remakes
  // ─────────────────────────────────────────────
  {
    id: "firered",
    name: "Pokemon Rojo Fuego",
    generation: 1,
    platform: "GBA",
    color: "#E63946",
  gyms: [
    { number: 1, leader: "Brock",    type: "Roca",     badge: "Medalla Piedra",   location: "Ciudad Plateada",  name: "Gimnasio de Ciudad Plateada", levels: "Lv 12-14" },
    { number: 2, leader: "Misty",    type: "Agua",     badge: "Medalla Cascada",  location: "Ciudad Celeste",   name: "Gimnasio de Ciudad Celeste",  levels: "Lv 18-21" },
    { number: 3, leader: "Lt. Surge", type: "Eléctrico", badge: "Medalla Trueno",   location: "Ciudad Carmín",    name: "Gimnasio de Ciudad Carmín",   levels: "Lv 18-24" },
    { number: 4, leader: "Erika",    type: "Planta",   badge: "Medalla Arcoíris", location: "Ciudad Azulona",   name: "Gimnasio de Ciudad Azulona",  levels: "Lv 24-29" },
    { number: 5, leader: "Koga",     type: "Veneno",   badge: "Medalla Alma",     location: "Ciudad Fucsia",    name: "Gimnasio de Ciudad Fucsia",   levels: "Lv 37-43" },
    { number: 6, leader: "Sabrina",  type: "Psíquico", badge: "Medalla Pantano",  location: "Ciudad Azafrán",   name: "Gimnasio de Ciudad Azafrán",  levels: "Lv 38-43" },
    { number: 7, leader: "Blaine",   type: "Fuego",    badge: "Medalla Volcán",   location: "Isla Canela",      name: "Gimnasio de Isla Canela",     levels: "Lv 42-47" },
    { number: 8, leader: "Giovanni", type: "Tierra",   badge: "Medalla Tierra",   location: "Ciudad Verde",     name: "Gimnasio de Ciudad Verde",    levels: "Lv 42-50" }
  ],
    routes: [
      { id: "ruta1",        name: "Ruta 1",            order: 1  },
      { id: "ruta2",        name: "Ruta 2",            order: 2  },
      { id: "ruta3",        name: "Ruta 3",            order: 3  },
      { id: "ruta4",        name: "Ruta 4",            order: 4  },
      { id: "ruta5",        name: "Ruta 5",            order: 5  },
      { id: "ruta6",        name: "Ruta 6",            order: 6  },
      { id: "ruta7",        name: "Ruta 7",            order: 7  },
      { id: "ruta8",        name: "Ruta 8",            order: 8  },
      { id: "ruta9",        name: "Ruta 9",            order: 9  },
      { id: "ruta10",       name: "Ruta 10",           order: 10 },
      { id: "ruta11",       name: "Ruta 11",           order: 11 },
      { id: "ruta12",       name: "Ruta 12",           order: 12 },
      { id: "ruta13",       name: "Ruta 13",           order: 13 },
      { id: "ruta14",       name: "Ruta 14",           order: 14 },
      { id: "ruta15",       name: "Ruta 15",           order: 15 },
      { id: "ruta16",       name: "Ruta 16",           order: 16 },
      { id: "ruta17",       name: "Ruta 17",           order: 17 },
      { id: "ruta18",       name: "Ruta 18",           order: 18 },
      { id: "ruta21",       name: "Ruta 21",           order: 19 },
      { id: "ruta22",       name: "Ruta 22",           order: 20 },
      { id: "ruta23",       name: "Ruta 23",           order: 21 },
      { id: "ruta24",       name: "Ruta 24",           order: 22 },
      { id: "ruta25",       name: "Ruta 25",           order: 23 },
      { id: "monte-moon",   name: "Cueva Monte Moon",  order: 24 },
      { id: "tunel-roca",   name: "Tunel Roca",        order: 25 },
      { id: "safari",       name: "Zona Safari",       order: 26 },
      { id: "torre-pokemon",name: "Torre Pokemon",     order: 27 },
      { id: "victoria-road",name: "Victoria Road",     order: 28 }
    ]
  },
  {
    id: "leafgreen",
    name: "Pokemon Verde Hoja",
    generation: 1,
    platform: "GBA",
    color: "#2DC653",
  gyms: [
    { number: 1, leader: "Brock",    type: "Roca",     badge: "Medalla Piedra",   location: "Ciudad Plateada",  name: "Gimnasio de Ciudad Plateada", levels: "Lv 12-14" },
    { number: 2, leader: "Misty",    type: "Agua",     badge: "Medalla Cascada",  location: "Ciudad Celeste",   name: "Gimnasio de Ciudad Celeste",  levels: "Lv 18-21" },
    { number: 3, leader: "Lt. Surge", type: "Eléctrico", badge: "Medalla Trueno",   location: "Ciudad Carmín",    name: "Gimnasio de Ciudad Carmín",   levels: "Lv 18-24" },
    { number: 4, leader: "Erika",    type: "Planta",   badge: "Medalla Arcoíris", location: "Ciudad Azulona",   name: "Gimnasio de Ciudad Azulona",  levels: "Lv 24-29" },
    { number: 5, leader: "Koga",     type: "Veneno",   badge: "Medalla Alma",     location: "Ciudad Fucsia",    name: "Gimnasio de Ciudad Fucsia",   levels: "Lv 37-43" },
    { number: 6, leader: "Sabrina",  type: "Psíquico", badge: "Medalla Pantano",  location: "Ciudad Azafrán",   name: "Gimnasio de Ciudad Azafrán",  levels: "Lv 38-43" },
    { number: 7, leader: "Blaine",   type: "Fuego",    badge: "Medalla Volcán",   location: "Isla Canela",      name: "Gimnasio de Isla Canela",     levels: "Lv 42-47" },
    { number: 8, leader: "Giovanni", type: "Tierra",   badge: "Medalla Tierra",   location: "Ciudad Verde",     name: "Gimnasio de Ciudad Verde",    levels: "Lv 42-50" }
  ],
    routes: [
      { id: "ruta1",        name: "Ruta 1",           order: 1  },
      { id: "ruta2",        name: "Ruta 2",           order: 2  },
      { id: "ruta3",        name: "Ruta 3",           order: 3  },
      { id: "ruta4",        name: "Ruta 4",           order: 4  },
      { id: "ruta5",        name: "Ruta 5",           order: 5  },
      { id: "ruta6",        name: "Ruta 6",           order: 6  },
      { id: "ruta7",        name: "Ruta 7",           order: 7  },
      { id: "ruta8",        name: "Ruta 8",           order: 8  },
      { id: "ruta9",        name: "Ruta 9",           order: 9  },
      { id: "ruta10",       name: "Ruta 10",          order: 10 },
      { id: "ruta11",       name: "Ruta 11",          order: 11 },
      { id: "ruta12",       name: "Ruta 12",          order: 12 },
      { id: "ruta22",       name: "Ruta 22",          order: 13 },
      { id: "monte-moon",   name: "Cueva Monte Moon", order: 14 },
      { id: "tunel-roca",   name: "Tunel Roca",       order: 15 },
      { id: "safari",       name: "Zona Safari",      order: 16 },
      { id: "torre-pokemon",name: "Torre Pokemon",    order: 17 },
      { id: "victoria-road",name: "Victoria Road",    order: 18 }
    ]
  },

  // ─────────────────────────────────────────────
  // GBA — Generacion 3
  // ─────────────────────────────────────────────
  {
    id: "ruby",
    name: "Pokemon Rubi",
    generation: 3,
    platform: "GBA",
    color: "#cc0000",
  gyms: [
    { number: 1, leader: "Roxanne",    type: "Roca",     badge: "Medalla Piedra",     location: "Ciudad Férrica",   name: "Gimnasio de Ciudad Férrica",  levels: "Lv 12-15" },
    { number: 2, leader: "Brawly",     type: "Lucha",    badge: "Medalla Puño",       location: "Pueblo Azuliza",   name: "Gimnasio de Pueblo Azuliza",  levels: "Lv 16-18" },
    { number: 3, leader: "Wattson",    type: "Electrico", badge: "Medalla Dínamo",     location: "Ciudad Malvalona", name: "Gimnasio de Ciudad Malvalona",levels: "Lv 20-23" },
    { number: 4, leader: "Flannery",   type: "Fuego",    badge: "Medalla Calor",      location: "Pueblo Lavacalda",  name: "Gimnasio de Pueblo Lavacalda",levels: "Lv 24-28" },
    { number: 5, leader: "Norman",     type: "Normal",   badge: "Medalla Equilibrio", location: "Ciudad Petalia",   name: "Gimnasio de Ciudad Petalia",  levels: "Lv 27-31" },
    { number: 6, leader: "Winona",     type: "Volador",  badge: "Medalla Pluma",      location: "Ciudad Arborada",  name: "Gimnasio de Ciudad Arborada", levels: "Lv 29-33" },
    { number: 7, leader: "Tate & Liza", type: "Psiquico", badge: "Medalla Mente",      location: "Ciudad Algaria",   name: "Gimnasio de Ciudad Algaria",  levels: "Lv 42-42" },
    { number: 8, leader: "Wallace",    type: "Agua",     badge: "Medalla Lluvia",     location: "Arrecípolis",      name: "Gimnasio de Arrecípolis",     levels: "Lv 40-43" }
  ],
    routes: [
      { id: "ruta101", name: "Ruta 101",          order: 1  },
      { id: "ruta102", name: "Ruta 102",          order: 2  },
      { id: "ruta103", name: "Ruta 103",          order: 3  },
      { id: "ruta104", name: "Ruta 104",          order: 4  },
      { id: "ruta105", name: "Ruta 105",          order: 5  },
      { id: "ruta106", name: "Ruta 106",          order: 6  },
      { id: "ruta110", name: "Ruta 110",          order: 7  },
      { id: "ruta111", name: "Ruta 111",          order: 8  },
      { id: "ruta112", name: "Ruta 112",          order: 9  },
      { id: "ruta113", name: "Ruta 113",          order: 10 },
      { id: "ruta114", name: "Ruta 114",          order: 11 },
      { id: "ruta115", name: "Ruta 115",          order: 12 },
      { id: "ruta116", name: "Ruta 116",          order: 13 },
      { id: "ruta117", name: "Ruta 117",          order: 14 },
      { id: "ruta118", name: "Ruta 118",          order: 15 },
      { id: "ruta119", name: "Ruta 119",          order: 16 },
      { id: "ruta120", name: "Ruta 120",          order: 17 },
      { id: "ruta121", name: "Ruta 121",          order: 18 },
      { id: "ruta123", name: "Ruta 123",          order: 19 },
      { id: "ruta124", name: "Ruta 124",          order: 20 },
      { id: "ruta125", name: "Ruta 125",          order: 21 },
      { id: "ruta126", name: "Ruta 126",          order: 22 },
      { id: "ruta127", name: "Ruta 127",          order: 23 },
      { id: "ruta128", name: "Ruta 128",          order: 24 },
      { id: "cueva-granite",  name: "Cueva de Granito", order: 25 },
      { id: "mt-chimney",     name: "Monte Chimenea",   order: 26 },
      { id: "cueva-meteor",   name: "Cueva Meteoro",    order: 27 },
      { id: "jungla-pokemo",  name: "Jungla Pokemon",   order: 28 }
    ]
  },
  {
    id: "sapphire",
    name: "Pokemon Zafiro",
    generation: 3,
    platform: "GBA",
    color: "#457B9D",
  gyms: [
    { number: 1, leader: "Roxanne",    type: "Roca",     badge: "Medalla Piedra",     location: "Ciudad Férrica",   name: "Gimnasio de Ciudad Férrica",  levels: "Lv 12-15" },
    { number: 2, leader: "Brawly",     type: "Lucha",    badge: "Medalla Puño",       location: "Pueblo Azuliza",   name: "Gimnasio de Pueblo Azuliza",  levels: "Lv 16-18" },
    { number: 3, leader: "Wattson",    type: "Electrico", badge: "Medalla Dínamo",     location: "Ciudad Malvalona", name: "Gimnasio de Ciudad Malvalona",levels: "Lv 20-23" },
    { number: 4, leader: "Flannery",   type: "Fuego",    badge: "Medalla Calor",      location: "Pueblo Lavacalda",  name: "Gimnasio de Pueblo Lavacalda",levels: "Lv 24-28" },
    { number: 5, leader: "Norman",     type: "Normal",   badge: "Medalla Equilibrio", location: "Ciudad Petalia",   name: "Gimnasio de Ciudad Petalia",  levels: "Lv 27-31" },
    { number: 6, leader: "Winona",     type: "Volador",  badge: "Medalla Pluma",      location: "Ciudad Arborada",  name: "Gimnasio de Ciudad Arborada", levels: "Lv 29-33" },
    { number: 7, leader: "Tate & Liza", type: "Psiquico", badge: "Medalla Mente",      location: "Ciudad Algaria",   name: "Gimnasio de Ciudad Algaria",  levels: "Lv 42-42" },
    { number: 8, leader: "Wallace",    type: "Agua",     badge: "Medalla Lluvia",     location: "Arrecípolis",      name: "Gimnasio de Arrecípolis",     levels: "Lv 40-43" }
  ],
    routes: [
      { id: "ruta101", name: "Ruta 101",       order: 1  },
      { id: "ruta102", name: "Ruta 102",       order: 2  },
      { id: "ruta103", name: "Ruta 103",       order: 3  },
      { id: "ruta104", name: "Ruta 104",       order: 4  },
      { id: "ruta110", name: "Ruta 110",       order: 5  },
      { id: "ruta111", name: "Ruta 111",       order: 6  },
      { id: "ruta112", name: "Ruta 112",       order: 7  },
      { id: "ruta113", name: "Ruta 113",       order: 8  },
      { id: "ruta116", name: "Ruta 116",       order: 9  },
      { id: "ruta117", name: "Ruta 117",       order: 10 },
      { id: "ruta118", name: "Ruta 118",       order: 11 },
      { id: "ruta119", name: "Ruta 119",       order: 12 },
      { id: "ruta120", name: "Ruta 120",       order: 13 },
      { id: "ruta121", name: "Ruta 121",       order: 14 },
      { id: "ruta123", name: "Ruta 123",       order: 15 },
      { id: "ruta124", name: "Ruta 124",       order: 16 },
      { id: "cueva-granite", name: "Cueva de Granito", order: 17 },
      { id: "mt-chimney",    name: "Monte Chimenea",   order: 18 },
      { id: "cueva-meteor",  name: "Cueva Meteoro",    order: 19 }
    ]
  },
  {
    id: "emerald",
    name: "Pokemon Esmeralda",
    generation: 3,
    platform: "GBA",
    color: "#00a36c",
  gyms: [
    { number: 1, leader: "Roxanne",    type: "Roca",     badge: "Medalla Piedra",   location: "Ciudad Férrica",   name: "Gimnasio de Ciudad Férrica",  levels: "Lv 12-15" },
    { number: 2, leader: "Brawly",     type: "Lucha",    badge: "Medalla Puño",     location: "Pueblo Azuliza",   name: "Gimnasio de Pueblo Azuliza",  levels: "Lv 16-19" },
    { number: 3, leader: "Wattson",    type: "Electrico", badge: "Medalla Dínamo",   location: "Ciudad Malvalona", name: "Gimnasio de Ciudad Malvalona",levels: "Lv 20-24" },
    { number: 4, leader: "Flannery",   type: "Fuego",    badge: "Medalla Calor",    location: "Pueblo Lavacalda",  name: "Gimnasio de Pueblo Lavacalda",levels: "Lv 24-29" },
    { number: 5, leader: "Norman",     type: "Normal",   badge: "Medalla Equilibrio",location: "Ciudad Petalia",   name: "Gimnasio de Ciudad Petalia",  levels: "Lv 27-31" },
    { number: 6, leader: "Winona",     type: "Volador",  badge: "Medalla Pluma",    location: "Ciudad Arborada",  name: "Gimnasio de Ciudad Arborada", levels: "Lv 29-33" },
    { number: 7, leader: "Tate & Liza", type: "Psiquico", badge: "Medalla Mente",    location: "Ciudad Algaria",   name: "Gimnasio de Ciudad Algaria",  levels: "Lv 41-42" },
    { number: 8, leader: "Juan",       type: "Agua",     badge: "Medalla Lluvia",   location: "Arrecípolis",      name: "Gimnasio de Arrecípolis",     levels: "Lv 41-46" }
  ],
    routes: [
      { id: "ruta101", name: "Ruta 101",       order: 1  },
      { id: "ruta102", name: "Ruta 102",       order: 2  },
      { id: "ruta103", name: "Ruta 103",       order: 3  },
      { id: "ruta104", name: "Ruta 104",       order: 4  },
      { id: "ruta110", name: "Ruta 110",       order: 5  },
      { id: "ruta111", name: "Ruta 111",       order: 6  },
      { id: "ruta112", name: "Ruta 112",       order: 7  },
      { id: "ruta113", name: "Ruta 113",       order: 8  },
      { id: "ruta116", name: "Ruta 116",       order: 9  },
      { id: "ruta117", name: "Ruta 117",       order: 10 },
      { id: "ruta118", name: "Ruta 118",       order: 11 },
      { id: "ruta119", name: "Ruta 119",       order: 12 },
      { id: "ruta120", name: "Ruta 120",       order: 13 },
      { id: "ruta121", name: "Ruta 121",       order: 14 },
      { id: "ruta123", name: "Ruta 123",       order: 15 },
      { id: "cueva-granite", name: "Cueva de Granito", order: 16 },
      { id: "mt-chimney",    name: "Monte Chimenea",   order: 17 },
      { id: "cueva-meteor",  name: "Cueva Meteoro",    order: 18 }
    ]
  },

  // ─────────────────────────────────────────────
  // NDS — Generacion 2 remakes (Gen IV)
  // ─────────────────────────────────────────────
  {
    id: "heartgold",
    name: "Pokemon HeartGold",
    generation: 4,
    platform: "NDS",
    color: "#FFD60A",
  gyms: [
    { number: 1, leader: "Falkner", type: "Volador",  badge: "Medalla Céfiro",   location: "Ciudad Malva",     name: "Gimnasio de Ciudad Malva",    levels: "Lv 9-13"   },
    { number: 2, leader: "Bugsy",   type: "Bicho",    badge: "Medalla Colmena",  location: "Pueblo Azalea",    name: "Gimnasio de Pueblo Azalea",   levels: "Lv 15-17"  },
    { number: 3, leader: "Whitney", type: "Normal",   badge: "Medalla Planicie", location: "Ciudad Trigal",    name: "Gimnasio de Ciudad Trigal",   levels: "Lv 17-19"  },
    { number: 4, leader: "Morty",   type: "Fantasma", badge: "Medalla Niebla",   location: "Ciudad Iris",      name: "Gimnasio de Ciudad Iris",     levels: "Lv 21-25"  },
    { number: 5, leader: "Chuck",   type: "Lucha",    badge: "Medalla Tormenta", location: "Ciudad Orquídea",  name: "Gimnasio de Ciudad Orquídea", levels: "Lv 29-31"  },
    { number: 6, leader: "Jasmine", type: "Acero",    badge: "Medalla Mineral",  location: "Ciudad Olivo",     name: "Gimnasio de Ciudad Olivo",    levels: "Lv 30-35"  },
    { number: 7, leader: "Pryce",   type: "Hielo",    badge: "Medalla Glaciar",  location: "Pueblo Caoba",     name: "Gimnasio de Pueblo Caoba",    levels: "Lv 30-34"  },
    { number: 8, leader: "Clair",   type: "Dragón",   badge: "Medalla Dragón",   location: "Ciudad Endrino",   name: "Gimnasio de Ciudad Endrino",  levels: "Lv 38-41"  }
  ],
    routes: [
      { id: "ruta29",      name: "Ruta 29",          order: 1  },
      { id: "ruta30",      name: "Ruta 30",          order: 2  },
      { id: "ruta31",      name: "Ruta 31",          order: 3  },
      { id: "ruta32",      name: "Ruta 32",          order: 4  },
      { id: "ruta33",      name: "Ruta 33",          order: 5  },
      { id: "ruta34",      name: "Ruta 34",          order: 6  },
      { id: "ruta35",      name: "Ruta 35",          order: 7  },
      { id: "ruta36",      name: "Ruta 36",          order: 8  },
      { id: "ruta37",      name: "Ruta 37",          order: 9  },
      { id: "ruta38",      name: "Ruta 38",          order: 10 },
      { id: "ruta39",      name: "Ruta 39",          order: 11 },
      { id: "ruta40",      name: "Ruta 40",          order: 12 },
      { id: "ruta41",      name: "Ruta 41",          order: 13 },
      { id: "ruta42",      name: "Ruta 42",          order: 14 },
      { id: "ruta43",      name: "Ruta 43",          order: 15 },
      { id: "ruta44",      name: "Ruta 44",          order: 16 },
      { id: "ruta45",      name: "Ruta 45",          order: 17 },
      { id: "ruta46",      name: "Ruta 46",          order: 18 },
      { id: "cueva-union", name: "Cueva Union",      order: 19 },
      { id: "cueva-hielo", name: "Cueva de Hielo",   order: 20 },
      { id: "torre-quemada",name:"Torre Quemada",    order: 21 },
      { id: "lago-ira",    name: "Lago de la Ira",   order: 22 },
      { id: "guarida-victor",name:"Guarida Victoria",order: 23 }
    ]
  },
  {
    id: "soulsilver",
    name: "Pokemon SoulSilver",
    generation: 4,
    platform: "NDS",
    color: "#a8c8e8",
  gyms: [
    { number: 1, leader: "Falkner", type: "Volador",  badge: "Medalla Céfiro",   location: "Ciudad Malva",     name: "Gimnasio de Ciudad Malva",    levels: "Lv 9-13"   },
    { number: 2, leader: "Bugsy",   type: "Bicho",    badge: "Medalla Colmena",  location: "Pueblo Azalea",    name: "Gimnasio de Pueblo Azalea",   levels: "Lv 15-17"  },
    { number: 3, leader: "Whitney", type: "Normal",   badge: "Medalla Planicie", location: "Ciudad Trigal",    name: "Gimnasio de Ciudad Trigal",   levels: "Lv 17-19"  },
    { number: 4, leader: "Morty",   type: "Fantasma", badge: "Medalla Niebla",   location: "Ciudad Iris",      name: "Gimnasio de Ciudad Iris",     levels: "Lv 21-25"  },
    { number: 5, leader: "Chuck",   type: "Lucha",    badge: "Medalla Tormenta", location: "Ciudad Orquídea",  name: "Gimnasio de Ciudad Orquídea", levels: "Lv 29-31"  },
    { number: 6, leader: "Jasmine", type: "Acero",    badge: "Medalla Mineral",  location: "Ciudad Olivo",     name: "Gimnasio de Ciudad Olivo",    levels: "Lv 30-35"  },
    { number: 7, leader: "Pryce",   type: "Hielo",    badge: "Medalla Glaciar",  location: "Pueblo Caoba",     name: "Gimnasio de Pueblo Caoba",    levels: "Lv 30-34"  },
    { number: 8, leader: "Clair",   type: "Dragón",   badge: "Medalla Dragón",   location: "Ciudad Endrino",   name: "Gimnasio de Ciudad Endrino",  levels: "Lv 38-41"  }
  ],
    routes: [
      { id: "ruta29",      name: "Ruta 29",         order: 1  },
      { id: "ruta30",      name: "Ruta 30",         order: 2  },
      { id: "ruta31",      name: "Ruta 31",         order: 3  },
      { id: "ruta32",      name: "Ruta 32",         order: 4  },
      { id: "ruta33",      name: "Ruta 33",         order: 5  },
      { id: "ruta34",      name: "Ruta 34",         order: 6  },
      { id: "ruta35",      name: "Ruta 35",         order: 7  },
      { id: "ruta36",      name: "Ruta 36",         order: 8  },
      { id: "ruta37",      name: "Ruta 37",         order: 9  },
      { id: "ruta38",      name: "Ruta 38",         order: 10 },
      { id: "ruta39",      name: "Ruta 39",         order: 11 },
      { id: "ruta40",      name: "Ruta 40",         order: 12 },
      { id: "ruta42",      name: "Ruta 42",         order: 13 },
      { id: "ruta44",      name: "Ruta 44",         order: 14 },
      { id: "cueva-union", name: "Cueva Union",     order: 15 },
      { id: "cueva-hielo", name: "Cueva de Hielo",  order: 16 },
      { id: "lago-ira",    name: "Lago de la Ira",  order: 17 }
    ]
  },

  // ─────────────────────────────────────────────
  // NDS — Generacion 4 (Diamante / Perla / Platino)
  // ─────────────────────────────────────────────
  {
    id: "diamond",
    name: "Pokemon Diamante",
    generation: 4,
    platform: "NDS",
    color: "#5b8dee",
  gyms: [
    { number: 1, leader: "Roark",        type: "Roca",     badge: "Medalla Lignito",  location: "Ciudad Pirita",    name: "Gimnasio de Ciudad Pirita",   levels: "Lv 12-14" },
    { number: 2, leader: "Gardenia",     type: "Planta",   badge: "Medalla Bosque",   location: "Ciudad Eterna",    name: "Gimnasio de Ciudad Eterna",   levels: "Lv 19-22" },
    { number: 3, leader: "Maylene",      type: "Lucha",    badge: "Medalla Cobalto",  location: "Ciudad Rocavelo",  name: "Gimnasio de Ciudad Rocavelo", levels: "Lv 27-30" },
    { number: 4, leader: "Crasher Wake", type: "Agua",     badge: "Medalla Ciénaga",  location: "Ciudad Pradera",   name: "Gimnasio de Ciudad Pradera",  levels: "Lv 27-30" },
    { number: 5, leader: "Fantina",      type: "Fantasma", badge: "Medalla Reliquia", location: "Ciudad Corazón",   name: "Gimnasio de Ciudad Corazón",  levels: "Lv 32-36" },
    { number: 6, leader: "Byron",        type: "Acero",    badge: "Medalla Mina",     location: "Ciudad Canal",     name: "Gimnasio de Ciudad Canal",    levels: "Lv 36-39" },
    { number: 7, leader: "Candice",      type: "Hielo",    badge: "Medalla Glaciar",  location: "Ciudad Puntaneva", name: "Gimnasio de Ciudad Puntaneva",levels: "Lv 38-42" },
    { number: 8, leader: "Volkner",      type: "Eléctrico", badge: "Medalla Faro",    location: "Ciudad Marina",    name: "Gimnasio de Ciudad Marina",   levels: "Lv 46-49" }
  ],
    routes: [
      { id: "ruta201", name: "Ruta 201",         order: 1  },
      { id: "ruta202", name: "Ruta 202",         order: 2  },
      { id: "ruta203", name: "Ruta 203",         order: 3  },
      { id: "ruta204", name: "Ruta 204",         order: 4  },
      { id: "ruta205", name: "Ruta 205",         order: 5  },
      { id: "ruta206", name: "Ruta 206",         order: 6  },
      { id: "ruta207", name: "Ruta 207",         order: 7  },
      { id: "ruta208", name: "Ruta 208",         order: 8  },
      { id: "ruta209", name: "Ruta 209",         order: 9  },
      { id: "ruta210", name: "Ruta 210",         order: 10 },
      { id: "ruta211", name: "Ruta 211",         order: 11 },
      { id: "ruta212", name: "Ruta 212",         order: 12 },
      { id: "ruta213", name: "Ruta 213",         order: 13 },
      { id: "ruta214", name: "Ruta 214",         order: 14 },
      { id: "ruta215", name: "Ruta 215",         order: 15 },
      { id: "ruta216", name: "Ruta 216",         order: 16 },
      { id: "ruta217", name: "Ruta 217",         order: 17 },
      { id: "ruta218", name: "Ruta 218",         order: 18 },
      { id: "ruta219", name: "Ruta 219",         order: 19 },
      { id: "ruta220", name: "Ruta 220",         order: 20 },
      { id: "ruta221", name: "Ruta 221",         order: 21 },
      { id: "ruta222", name: "Ruta 222",         order: 22 },
      { id: "ruta224", name: "Ruta 224",         order: 23 },
      { id: "cueva-oreburgh",  name: "Cueva Oreburgh",    order: 24 },
      { id: "bosque-eterna",   name: "Bosque Eterno",     order: 25 },
      { id: "cueva-wayward",   name: "Cueva Wayward",     order: 26 },
      { id: "monte-coronet",   name: "Monte Coronet",     order: 27 },
      { id: "gran-pantano",    name: "Gran Pantano",      order: 28 },
      { id: "lago-verity",     name: "Lago Verity",       order: 29 },
      { id: "lago-valor",      name: "Lago Valor",        order: 30 },
      { id: "lago-acuity",     name: "Lago Acuity",       order: 31 },
      { id: "victoria-road-d", name: "Victoria Road",     order: 32 }
    ]
  },
  {
    id: "pearl",
    name: "Pokemon Perla",
    generation: 4,
    platform: "NDS",
    color: "#e8a0c8",
  gyms: [
    { number: 1, leader: "Roark",        type: "Roca",     badge: "Medalla Lignito",  location: "Ciudad Pirita",    name: "Gimnasio de Ciudad Pirita",   levels: "Lv 12-14" },
    { number: 2, leader: "Gardenia",     type: "Planta",   badge: "Medalla Bosque",   location: "Ciudad Eterna",    name: "Gimnasio de Ciudad Eterna",   levels: "Lv 19-22" },
    { number: 3, leader: "Maylene",      type: "Lucha",    badge: "Medalla Cobalto",  location: "Ciudad Rocavelo",  name: "Gimnasio de Ciudad Rocavelo", levels: "Lv 27-30" },
    { number: 4, leader: "Crasher Wake", type: "Agua",     badge: "Medalla Ciénaga",  location: "Ciudad Pradera",   name: "Gimnasio de Ciudad Pradera",  levels: "Lv 27-30" },
    { number: 5, leader: "Fantina",      type: "Fantasma", badge: "Medalla Reliquia", location: "Ciudad Corazón",   name: "Gimnasio de Ciudad Corazón",  levels: "Lv 32-36" },
    { number: 6, leader: "Byron",        type: "Acero",    badge: "Medalla Mina",     location: "Ciudad Canal",     name: "Gimnasio de Ciudad Canal",    levels: "Lv 36-39" },
    { number: 7, leader: "Candice",      type: "Hielo",    badge: "Medalla Glaciar",  location: "Ciudad Puntaneva", name: "Gimnasio de Ciudad Puntaneva",levels: "Lv 38-42" },
    { number: 8, leader: "Volkner",      type: "Eléctrico", badge: "Medalla Faro",    location: "Ciudad Marina",    name: "Gimnasio de Ciudad Marina",   levels: "Lv 46-49" }
  ],
    routes: [
      { id: "ruta201", name: "Ruta 201", order: 1  },
      { id: "ruta202", name: "Ruta 202", order: 2  },
      { id: "ruta203", name: "Ruta 203", order: 3  },
      { id: "ruta204", name: "Ruta 204", order: 4  },
      { id: "ruta205", name: "Ruta 205", order: 5  },
      { id: "ruta208", name: "Ruta 208", order: 6  },
      { id: "ruta209", name: "Ruta 209", order: 7  },
      { id: "ruta210", name: "Ruta 210", order: 8  },
      { id: "ruta212", name: "Ruta 212", order: 9  },
      { id: "ruta213", name: "Ruta 213", order: 10 },
      { id: "ruta214", name: "Ruta 214", order: 11 },
      { id: "ruta216", name: "Ruta 216", order: 12 },
      { id: "ruta217", name: "Ruta 217", order: 13 },
      { id: "cueva-oreburgh", name: "Cueva Oreburgh",  order: 14 },
      { id: "bosque-eterna",  name: "Bosque Eterno",   order: 15 },
      { id: "monte-coronet",  name: "Monte Coronet",   order: 16 },
      { id: "gran-pantano",   name: "Gran Pantano",    order: 17 },
      { id: "victoria-road-p",name: "Victoria Road",   order: 18 }
    ]
  },
  {
    id: "platinum",
    name: "Pokemon Platino",
    generation: 4,
    platform: "NDS",
    color: "#c8c8f0",
  gyms: [
    { number: 1, leader: "Roark",        type: "Roca",     badge: "Medalla Lignito",  location: "Ciudad Pirita",    name: "Gimnasio de Ciudad Pirita",   levels: "Lv 12-14" },
    { number: 2, leader: "Gardenia",     type: "Planta",   badge: "Medalla Bosque",   location: "Ciudad Eterna",    name: "Gimnasio de Ciudad Eterna",   levels: "Lv 20-22" },
    { number: 3, leader: "Fantina",      type: "Fantasma", badge: "Medalla Reliquia", location: "Ciudad Corazón",   name: "Gimnasio de Ciudad Corazón",  levels: "Lv 24-26" },
    { number: 4, leader: "Maylene",      type: "Lucha",    badge: "Medalla Cobalto",  location: "Ciudad Rocavelo",  name: "Gimnasio de Ciudad Rocavelo", levels: "Lv 28-32" },
    { number: 5, leader: "Crasher Wake", type: "Agua",     badge: "Medalla Ciénaga",  location: "Ciudad Pradera",   name: "Gimnasio de Ciudad Pradera",  levels: "Lv 33-37" },
    { number: 6, leader: "Byron",        type: "Acero",    badge: "Medalla Mina",     location: "Ciudad Canal",     name: "Gimnasio de Ciudad Canal",    levels: "Lv 37-41" },
    { number: 7, leader: "Candice",      type: "Hielo",    badge: "Medalla Glaciar",  location: "Ciudad Puntaneva", name: "Gimnasio de Ciudad Puntaneva",levels: "Lv 40-44" },
    { number: 8, leader: "Volkner",      type: "Eléctrico", badge: "Medalla Faro",    location: "Ciudad Marina",    name: "Gimnasio de Ciudad Marina",   levels: "Lv 46-50" }
  ],
    routes: [
      { id: "ruta201", name: "Ruta 201", order: 1  },
      { id: "ruta202", name: "Ruta 202", order: 2  },
      { id: "ruta203", name: "Ruta 203", order: 3  },
      { id: "ruta204", name: "Ruta 204", order: 4  },
      { id: "ruta205", name: "Ruta 205", order: 5  },
      { id: "ruta206", name: "Ruta 206", order: 6  },
      { id: "ruta207", name: "Ruta 207", order: 7  },
      { id: "ruta208", name: "Ruta 208", order: 8  },
      { id: "ruta209", name: "Ruta 209", order: 9  },
      { id: "ruta210", name: "Ruta 210", order: 10 },
      { id: "ruta211", name: "Ruta 211", order: 11 },
      { id: "ruta212", name: "Ruta 212", order: 12 },
      { id: "ruta213", name: "Ruta 213", order: 13 },
      { id: "ruta214", name: "Ruta 214", order: 14 },
      { id: "ruta215", name: "Ruta 215", order: 15 },
      { id: "ruta216", name: "Ruta 216", order: 16 },
      { id: "ruta217", name: "Ruta 217", order: 17 },
      { id: "ruta222", name: "Ruta 222", order: 18 },
      { id: "ruta224", name: "Ruta 224", order: 19 },
      { id: "cueva-oreburgh", name: "Cueva Oreburgh",    order: 20 },
      { id: "bosque-eterna",  name: "Bosque Eterno",     order: 21 },
      { id: "cueva-wayward",  name: "Cueva Wayward",     order: 22 },
      { id: "monte-coronet",  name: "Monte Coronet",     order: 23 },
      { id: "gran-pantano",   name: "Gran Pantano",      order: 24 },
      { id: "lago-verity",    name: "Lago Verity",       order: 25 },
      { id: "lago-valor",     name: "Lago Valor",        order: 26 },
      { id: "lago-acuity",    name: "Lago Acuity",       order: 27 },
      { id: "distortion-world",name:"Mundo Distorsion",  order: 28 },
      { id: "victoria-road-pl",name:"Victoria Road",     order: 29 }
    ]
  },

  // ─────────────────────────────────────────────
  // NDS — Generacion 5 (Negro / Blanco)
  // ─────────────────────────────────────────────
  {
    id: "black",
    name: "Pokemon Negro",
    generation: 5,
    platform: "NDS",
    color: "#2a2a2a",
  gyms: [
    { number: 1, leader: "Cilan / Chili / Cress", type: "Planta/Fuego/Agua", badge: "Medalla Trío",     location: "Ciudad Gres",     name: "Gimnasio de Ciudad Gres",     levels: "Lv 12-14" },
    { number: 2, leader: "Lenora",                type: "Normal",            badge: "Medalla Base",     location: "Ciudad Esmalte",  name: "Gimnasio de Ciudad Esmalte",  levels: "Lv 18-20" },
    { number: 3, leader: "Burgh",                 type: "Bicho",             badge: "Medalla Élitro",   location: "Ciudad Porcelana",name: "Gimnasio de Ciudad Porcelana",levels: "Lv 21-23" },
    { number: 4, leader: "Elesa",                 type: "Eléctrico",         badge: "Medalla Voltio",   location: "Ciudad Mayólica", name: "Gimnasio de Ciudad Mayólica", levels: "Lv 25-27" },
    { number: 5, leader: "Clay",                  type: "Tierra",            badge: "Medalla Temblor",  location: "Ciudad Fayenza",  name: "Gimnasio de Ciudad Fayenza",  levels: "Lv 29-31" },
    { number: 6, leader: "Skyla",                 type: "Volador",           badge: "Medalla Jet",      location: "Ciudad Loza",     name: "Gimnasio de Ciudad Loza",     levels: "Lv 33-35" },
    { number: 7, leader: "Brycen",                type: "Hielo",             badge: "Medalla Candelizo",location: "Ciudad Teja",     name: "Gimnasio de Ciudad Teja",     levels: "Lv 37-39" },
    { number: 8, leader: "Drayden",               type: "Dragón",            badge: "Medalla Leyenda",  location: "Ciudad Caolín",   name: "Gimnasio de Ciudad Caolín",   levels: "Lv 41-43" }
  ],
    routes: [
      { id: "ruta1-n",  name: "Ruta 1",  order: 1  },
      { id: "ruta2-n",  name: "Ruta 2",  order: 2  },
      { id: "ruta3-n",  name: "Ruta 3",  order: 3  },
      { id: "ruta4-n",  name: "Ruta 4",  order: 4  },
      { id: "ruta5-n",  name: "Ruta 5",  order: 5  },
      { id: "ruta6-n",  name: "Ruta 6",  order: 6  },
      { id: "ruta7-n",  name: "Ruta 7",  order: 7  },
      { id: "ruta8-n",  name: "Ruta 8",  order: 8  },
      { id: "ruta9-n",  name: "Ruta 9",  order: 9  },
      { id: "ruta10-n", name: "Ruta 10", order: 10 },
      { id: "ruta11-n", name: "Ruta 11", order: 11 },
      { id: "ruta12-n", name: "Ruta 12", order: 12 },
      { id: "ruta13-n", name: "Ruta 13", order: 13 },
      { id: "ruta14-n", name: "Ruta 14", order: 14 },
      { id: "ruta15-n", name: "Ruta 15", order: 15 },
      { id: "ruta16-n", name: "Ruta 16", order: 16 },
      { id: "ruta17-n", name: "Ruta 17", order: 17 },
      { id: "ruta18-n", name: "Ruta 18", order: 18 },
      { id: "bosque-pinwheel",   name: "Bosque Pinwheel",     order: 19 },
      { id: "desierto-desert",   name: "Desierto Negro/Blanco",order: 20 },
      { id: "cueva-chargestone", name: "Cueva Chargestone",   order: 21 },
      { id: "montana-twist",     name: "Montana Twist",       order: 22 },
      { id: "victoria-road-n",   name: "Victoria Road",       order: 23 }
    ]
  },
  {
    id: "white",
    name: "Pokemon Blanco",
    generation: 5,
    platform: "NDS",
    color: "#e8e8e8",
  gyms: [
    { number: 1, leader: "Cilan / Chili / Cress", type: "Planta/Fuego/Agua", badge: "Medalla Trío",     location: "Ciudad Gres",     name: "Gimnasio de Ciudad Gres",     levels: "Lv 12-14" },
    { number: 2, leader: "Lenora",                type: "Normal",            badge: "Medalla Base",     location: "Ciudad Esmalte",  name: "Gimnasio de Ciudad Esmalte",  levels: "Lv 18-20" },
    { number: 3, leader: "Burgh",                 type: "Bicho",             badge: "Medalla Élitro",   location: "Ciudad Porcelana",name: "Gimnasio de Ciudad Porcelana",levels: "Lv 21-23" },
    { number: 4, leader: "Elesa",                 type: "Electrico",         badge: "Medalla Voltio",   location: "Ciudad Mayólica", name: "Gimnasio de Ciudad Mayólica", levels: "Lv 25-27" },
    { number: 5, leader: "Clay",                  type: "Tierra",            badge: "Medalla Temblor",  location: "Ciudad Fayenza",  name: "Gimnasio de Ciudad Fayenza",  levels: "Lv 29-31" },
    { number: 6, leader: "Skyla",                 type: "Volador",           badge: "Medalla Jet",      location: "Ciudad Loza",     name: "Gimnasio de Ciudad Loza",     levels: "Lv 33-35" },
    { number: 7, leader: "Brycen",                type: "Hielo",             badge: "Medalla Candelizo",location: "Ciudad Teja",     name: "Gimnasio de Ciudad Teja",     levels: "Lv 37-39" },
    { number: 8, leader: "Iris",                  type: "Dragon",            badge: "Medalla Leyenda",  location: "Ciudad Caolín",   name: "Gimnasio de Ciudad Caolín",   levels: "Lv 41-43" }
  ],
    routes: [
      { id: "ruta1-w",  name: "Ruta 1",  order: 1  },
      { id: "ruta2-w",  name: "Ruta 2",  order: 2  },
      { id: "ruta3-w",  name: "Ruta 3",  order: 3  },
      { id: "ruta4-w",  name: "Ruta 4",  order: 4  },
      { id: "ruta5-w",  name: "Ruta 5",  order: 5  },
      { id: "ruta6-w",  name: "Ruta 6",  order: 6  },
      { id: "ruta7-w",  name: "Ruta 7",  order: 7  },
      { id: "ruta8-w",  name: "Ruta 8",  order: 8  },
      { id: "ruta9-w",  name: "Ruta 9",  order: 9  },
      { id: "ruta10-w", name: "Ruta 10", order: 10 },
      { id: "ruta13-w", name: "Ruta 13", order: 11 },
      { id: "ruta14-w", name: "Ruta 14", order: 12 },
      { id: "ruta15-w", name: "Ruta 15", order: 13 },
      { id: "bosque-pinwheel",    name: "Bosque Pinwheel",      order: 14 },
      { id: "ciudad-blanca",      name: "Ciudad Blanca",        order: 15 },
      { id: "cueva-chargestone",  name: "Cueva Chargestone",    order: 16 },
      { id: "victoria-road-w",    name: "Victoria Road",        order: 17 }
    ]
  },
  {
    id: "black2",
    name: "Pokemon Negro 2",
    generation: 5,
    platform: "NDS",
    color: "#1a1a3a",
  gyms: [
    { number: 1, leader: "Cheren",  type: "Normal",    badge: "Medalla Base",     location: "Ciudad Engobe",    name: "Gimnasio de Ciudad Engobe",   levels: "Lv 11-13" },
    { number: 2, leader: "Roxie",   type: "Veneno",    badge: "Medalla Ponzoña",  location: "Ciudad Hormigón",  name: "Gimnasio de Ciudad Hormigón", levels: "Lv 16-18" },
    { number: 3, leader: "Burgh",   type: "Bicho",     badge: "Medalla Élitro",   location: "Ciudad Porcelana", name: "Gimnasio de Ciudad Porcelana",levels: "Lv 22-24" },
    { number: 4, leader: "Elesa",   type: "Electrico", badge: "Medalla Voltio",   location: "Ciudad Mayólica",  name: "Gimnasio de Ciudad Mayólica", levels: "Lv 28-30" },
    { number: 5, leader: "Clay",    type: "Tierra",    badge: "Medalla Temblor",  location: "Ciudad Fayenza",   name: "Gimnasio de Ciudad Fayenza",  levels: "Lv 31-33" },
    { number: 6, leader: "Skyla",   type: "Volador",   badge: "Medalla Jet",      location: "Ciudad Loza",      name: "Gimnasio de Ciudad Loza",     levels: "Lv 37-39" },
    { number: 7, leader: "Drayden", type: "Dragon",    badge: "Medalla Leyenda",  location: "Ciudad Caolín",    name: "Gimnasio de Ciudad Caolín",   levels: "Lv 46-48" },
    { number: 8, leader: "Marlon",  type: "Agua",      badge: "Medalla Ola",      location: "Ciudad Marga",     name: "Gimnasio de Ciudad Marga",    levels: "Lv 49-51" }
  ],
    routes: [
      { id: "ruta19-b2", name: "Ruta 19", order: 1  },
      { id: "ruta20-b2", name: "Ruta 20", order: 2  },
      { id: "ruta4-b2",  name: "Ruta 4",  order: 3  },
      { id: "ruta5-b2",  name: "Ruta 5",  order: 4  },
      { id: "ruta6-b2",  name: "Ruta 6",  order: 5  },
      { id: "ruta7-b2",  name: "Ruta 7",  order: 6  },
      { id: "ruta8-b2",  name: "Ruta 8",  order: 7  },
      { id: "ruta9-b2",  name: "Ruta 9",  order: 8  },
      { id: "ruta11-b2", name: "Ruta 11", order: 9  },
      { id: "ruta12-b2", name: "Ruta 12", order: 10 },
      { id: "ruta13-b2", name: "Ruta 13", order: 11 },
      { id: "ruta14-b2", name: "Ruta 14", order: 12 },
      { id: "ruta21-b2", name: "Ruta 21", order: 13 },
      { id: "ruta22-b2", name: "Ruta 22", order: 14 },
      { id: "ruta23-b2", name: "Ruta 23", order: 15 },
      { id: "bosque-virbank",    name: "Complejo Virbank",    order: 16 },
      { id: "cueva-seaside",     name: "Cueva Seaside",       order: 17 },
      { id: "cueva-chargestone", name: "Cueva Chargestone",   order: 18 },
      { id: "montana-twist",     name: "Montana Twist",       order: 19 },
      { id: "victoria-road-b2",  name: "Victoria Road",       order: 20 }
    ]
  },
  {
    id: "white2",
    name: "Pokemon Blanco 2",
    generation: 5,
    platform: "NDS",
    color: "#f0f0ff",
  gyms: [
    { number: 1, leader: "Cheren",  type: "Normal",    badge: "Medalla Base",     location: "Ciudad Engobe",    name: "Gimnasio de Ciudad Engobe",   levels: "Lv 11-13" },
    { number: 2, leader: "Roxie",   type: "Veneno",    badge: "Medalla Ponzoña",  location: "Ciudad Hormigón",  name: "Gimnasio de Ciudad Hormigón", levels: "Lv 16-18" },
    { number: 3, leader: "Burgh",   type: "Bicho",     badge: "Medalla Élitro",   location: "Ciudad Porcelana", name: "Gimnasio de Ciudad Porcelana",levels: "Lv 22-24" },
    { number: 4, leader: "Elesa",   type: "Eléctrico", badge: "Medalla Voltio",   location: "Ciudad Mayólica",  name: "Gimnasio de Ciudad Mayólica", levels: "Lv 28-30" },
    { number: 5, leader: "Clay",    type: "Tierra",    badge: "Medalla Temblor",  location: "Ciudad Fayenza",   name: "Gimnasio de Ciudad Fayenza",  levels: "Lv 31-33" },
    { number: 6, leader: "Skyla",   type: "Volador",   badge: "Medalla Jet",      location: "Ciudad Loza",      name: "Gimnasio de Ciudad Loza",     levels: "Lv 37-39" },
    { number: 7, leader: "Drayden", type: "Dragón",    badge: "Medalla Leyenda",  location: "Ciudad Caolín",    name: "Gimnasio de Ciudad Caolín",   levels: "Lv 46-48" },
    { number: 8, leader: "Marlon",  type: "Agua",      badge: "Medalla Ola",      location: "Ciudad Marga",     name: "Gimnasio de Ciudad Marga",    levels: "Lv 49-51" }
  ],
    routes: [
      { id: "ruta19-w2", name: "Ruta 19", order: 1  },
      { id: "ruta20-w2", name: "Ruta 20", order: 2  },
      { id: "ruta4-w2",  name: "Ruta 4",  order: 3  },
      { id: "ruta5-w2",  name: "Ruta 5",  order: 4  },
      { id: "ruta6-w2",  name: "Ruta 6",  order: 5  },
      { id: "ruta7-w2",  name: "Ruta 7",  order: 6  },
      { id: "ruta9-w2",  name: "Ruta 9",  order: 7  },
      { id: "ruta11-w2", name: "Ruta 11", order: 8  },
      { id: "ruta13-w2", name: "Ruta 13", order: 9  },
      { id: "ruta14-w2", name: "Ruta 14", order: 10 },
      { id: "ruta21-w2", name: "Ruta 21", order: 11 },
      { id: "ruta22-w2", name: "Ruta 22", order: 12 },
      { id: "bosque-virbank",    name: "Complejo Virbank",  order: 13 },
      { id: "cueva-seaside",     name: "Cueva Seaside",     order: 14 },
      { id: "ciudad-blanca-w2",  name: "Ciudad Blanca",     order: 15 },
      { id: "cueva-chargestone", name: "Cueva Chargestone", order: 16 },
      { id: "victoria-road-w2",  name: "Victoria Road",     order: 17 }
    ]
  }
];

export function getGameById(id: string): Game | undefined {
  return GAMES.find(g => g.id === id);
}
