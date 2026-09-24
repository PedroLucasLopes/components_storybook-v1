const lum = (hex) => {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const light = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceVariant: '#ECECEF',
  onSurface: '#1B1B1F',
  onSurfaceMuted: '#5A5A66',
  outline: '#C9C9D0',
  primary: '#3B5BDB',
  onPrimary: '#FFFFFF',
  success: '#1F7A4D',
  warning: '#8F5D00',
  error: '#C02626',
  info: '#1A6BAA',
};

const dark = {
  background: '#121216',
  surface: '#1A1A20',
  surfaceVariant: '#25252D',
  onSurface: '#E6E6EA',
  onSurfaceMuted: '#A0A0AE',
  outline: '#3A3A45',
  primary: '#93A8FF',
  onPrimary: '#10121C',
  success: '#5FD39B',
  warning: '#E9B44C',
  error: '#FF8A8A',
  info: '#7CC0F0',
};

const check = (name, theme) => {
  console.log(`\n--- ${name} ---`);
  const pairs = [
    ['texto sobre surface', theme.onSurface, theme.surface, 4.5],
    ['texto sobre background', theme.onSurface, theme.background, 4.5],
    ['texto secundario sobre surface', theme.onSurfaceMuted, theme.surface, 4.5],
    ['texto secundario sobre variant', theme.onSurfaceMuted, theme.surfaceVariant, 4.5],
    ['primary sobre surface', theme.primary, theme.surface, 3],
    ['onPrimary sobre primary', theme.onPrimary, theme.primary, 4.5],
    ['success sobre surface', theme.success, theme.surface, 3],
    ['warning sobre surface', theme.warning, theme.surface, 3],
    ['error sobre surface', theme.error, theme.surface, 3],
    ['info sobre surface', theme.info, theme.surface, 3],
    ['outline sobre surface', theme.outline, theme.surface, 1.5],
  ];
  let failures = 0;
  for (const [label, fg, bg, minimum] of pairs) {
    const r = ratio(fg, bg);
    const ok = r >= minimum;
    if (!ok) failures += 1;
    console.log(`  ${ok ? 'OK  ' : 'BAIXO'} ${label.padEnd(34)} ${r.toFixed(2)}:1  (min ${minimum})`);
  }
  return failures;
};

const total = check('tema claro', light) + check('tema escuro', dark);
console.log(`\n${total === 0 ? 'paleta aprovada' : total + ' par(es) abaixo do minimo'}`);
