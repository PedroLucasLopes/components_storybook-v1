export const chartSeriesLight = [
  '#2a78d6', // 1 azul
  '#eb6834', // 2 laranja
  '#1baf7a', // 3 água
  '#eda100', // 4 amarelo
  '#e87ba4', // 5 magenta
  '#008300', // 6 verde
  '#4a3aa7', // 7 violeta
  '#e34948', // 8 vermelho
] as const;

export const chartSeriesDark = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
] as const;

export const chartSequential = [
  '#cde2fb',
  '#9ec5f4',
  '#6da7ec',
  '#3987e5',
  '#2a78d6',
  '#256abf',
  '#1c5cab',
  '#184f95',
] as const;

export const MAX_SERIES = chartSeriesLight.length;

export const seriesColor = (index: number, dark: boolean): string => {
  const slots = dark ? chartSeriesDark : chartSeriesLight;

  return slots[Math.min(index, slots.length - 1)];
};
