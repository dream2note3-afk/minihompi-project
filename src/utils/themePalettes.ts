import { ThemePalette, ThemePaletteId } from '../types';

export const RETRO_THEME_PALETTES: ThemePalette[] = [
  {
    id: 'classic_sky',
    name: '싸이월드 클래식 스카이 (Sky Blue)',
    desc: '2000년대 원조 미니홈피의 시그니처 연하늘색 감성',
    bgHex: '#c3d9df',
    borderHex: '#7897a2',
    accentHex: '#ff6b2b',
    badgeBg: 'bg-[#c3d9df]'
  },
  {
    id: 'retro_orange',
    name: '따뜻한 도토리 웜 오렌지 (Acorn Warm)',
    desc: '도토리와 다람쥐를 연상시키는 포근하고 아늑한 오렌지빛',
    bgHex: '#fce2d0',
    borderHex: '#de8953',
    accentHex: '#ea580c',
    badgeBg: 'bg-[#fce2d0]'
  },
  {
    id: 'vintage_green',
    name: '앤틱 포레스트 민트 (Forest Mint)',
    desc: '싱그러운 숲과 빈티지 다이어리 느낌의 힐링 세이지 그린',
    bgHex: '#d5e7dc',
    borderHex: '#649776',
    accentHex: '#059669',
    badgeBg: 'bg-[#d5e7dc]'
  },
  {
    id: 'nostalgia_lavender',
    name: '노스탤지어 라벤더 (Retro Lavender)',
    desc: '감성적인 일기장과 밤하늘의 몽환적인 파스텔 퍼플',
    bgHex: '#dfd5ea',
    borderHex: '#8b72ab',
    accentHex: '#7c3aed',
    badgeBg: 'bg-[#dfd5ea]'
  }
];

export const DEFAULT_THEME_ID: ThemePaletteId = 'classic_sky';

export function getThemePalette(id?: ThemePaletteId): ThemePalette {
  return (
    RETRO_THEME_PALETTES.find((p) => p.id === id) ||
    RETRO_THEME_PALETTES[0]
  );
}
