export interface Player {
  number: number;
  name: string;
}

export interface Trophy {
  title: string;
  competition: string;
  image: string;
}

export type MatchResult = 'W' | 'D' | 'L';

export interface Match {
  rival: string;
  score: string;
  result: MatchResult;
}

export const players: Player[] = [
  { number: 1, name: 'Leonardo Ventura' },
  { number: 2, name: 'Thomas Sposato' },
  { number: 3, name: 'Nicolas Cassinari' },
  { number: 4, name: 'Alejo Marquez' },
  { number: 5, name: 'Alexis Gomez' },
  { number: 6, name: 'Giuliano Ramirez' },
  { number: 7, name: 'Nahuel Rodriguez' },
  { number: 8, name: 'Lautaro Delaveccia' },
];

export const trophies: Trophy[] = [
  { title: 'Copa Libertadores', competition: 'CONMEBOL', image: 'copas/libertadores.png' },
  { title: 'Mundial de Clubes', competition: 'FIFA', image: 'copas/mundial-clubes.png' },
  { title: 'Copa Argentina', competition: 'AFA', image: 'copas/copa-argentina.png' },
];

export const matches: Match[] = [
  { rival: 'Ara', score: '7-6', result: 'W' },
  { rival: 'Holanda', score: '2-5', result: 'L' },
  { rival: 'Thomyfriends', score: '12-3', result: 'W' },
  { rival: '6to', score: '10-9', result: 'W' },
  { rival: 'Losfuleros', score: '10-6', result: 'W' },
  { rival: 'Losfuleros', score: '8-6', result: 'W' },
  { rival: 'Berutti', score: '4-8', result: 'L' },
  { rival: 'Tapones', score: '8-4', result: 'W' },
];

export interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

function buildStats(list: Match[]): TeamStats {
  const base: TeamStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
  return list.reduce((acc, m) => {
    const [gf, ga] = m.score.split('-').map(Number) as [number, number];
    acc.played += 1;
    acc.goalsFor += gf;
    acc.goalsAgainst += ga;
    if (m.result === 'W') acc.won += 1;
    else if (m.result === 'D') acc.drawn += 1;
    else acc.lost += 1;
    return acc;
  }, base);
}

export const stats: TeamStats = buildStats(matches);

export function winRate(s: TeamStats): number {
  return Math.round((s.won / s.played) * 1000) / 10;
}

export function goalsPerMatch(s: TeamStats): number {
  return Math.round((s.goalsFor / s.played) * 100) / 100;
}

export function goalsAgainstPerMatch(s: TeamStats): number {
  return Math.round((s.goalsAgainst / s.played) * 100) / 100;
}

export function biggestWin(list: Match[]): Match {
  const wins = list.filter((m) => m.result === 'W');
  return wins.reduce((best, m) => (margin(m) > margin(best) ? m : best), wins[0] as Match);
}

function margin(m: Match): number {
  const [gf, ga] = m.score.split('-').map(Number) as [number, number];
  return gf - ga;
}
