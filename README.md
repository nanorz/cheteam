# CheTeam

Página de perfil del equipo CheTeam: hero con escudo animado, plantel con tarjetas
que giran, estadísticas y promedios animados, vitrina de trofeos y formulario
"¿Querés jugar contra nosotros?" (los desafíos se guardan en localStorage).

## Stack
- HTML + CSS puro (sin frameworks)
- TypeScript compilado a ES modules

## Uso
```bash
npm install
npm run build     # compila src/*.ts -> public/js
npm start         # sirve public/ en http://localhost:5173
```
`npm run watch` recompila el TypeScript mientras editás.

## Estructura
- `src/data.ts` — datos del equipo (jugadores, trofeos, partidos, stats) y cálculos de promedios
- `src/main.ts` — render, animaciones y validación del formulario
- `public/index.html`, `public/styles.css` — markup y estilos
