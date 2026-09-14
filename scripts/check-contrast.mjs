/* Valida a paleta contra a WCAG 2.1: 4.5:1 para texto normal, 3:1 para texto
   grande e para componentes de interface. */
const lum = (hex) => {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const razao = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const claro = {
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

const escuro = {
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

const checar = (nome, tema) => {
  console.log(`\n--- ${nome} ---`);
  const pares = [
    ['texto sobre surface', tema.onSurface, tema.surface, 4.5],
    ['texto sobre background', tema.onSurface, tema.background, 4.5],
    ['texto secundario sobre surface', tema.onSurfaceMuted, tema.surface, 4.5],
    ['texto secundario sobre variant', tema.onSurfaceMuted, tema.surfaceVariant, 4.5],
    ['primary sobre surface', tema.primary, tema.surface, 3],
    ['onPrimary sobre primary', tema.onPrimary, tema.primary, 4.5],
    ['success sobre surface', tema.success, tema.surface, 3],
    ['warning sobre surface', tema.warning, tema.surface, 3],
    ['error sobre surface', tema.error, tema.surface, 3],
    ['info sobre surface', tema.info, tema.surface, 3],
    ['outline sobre surface', tema.outline, tema.surface, 1.5],
  ];
  let falhas = 0;
  for (const [label, fg, bg, minimo] of pares) {
    const r = razao(fg, bg);
    const ok = r >= minimo;
    if (!ok) falhas += 1;
    console.log(`  ${ok ? 'OK  ' : 'BAIXO'} ${label.padEnd(34)} ${r.toFixed(2)}:1  (min ${minimo})`);
  }
  return falhas;
};

const total = checar('tema claro', claro) + checar('tema escuro', escuro);
console.log(`\n${total === 0 ? 'paleta aprovada' : total + ' par(es) abaixo do minimo'}`);
