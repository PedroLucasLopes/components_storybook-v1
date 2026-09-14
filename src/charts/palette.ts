/**
 * Paleta categórica dos gráficos.
 *
 * ## Por que ela é separada da paleta da interface
 *
 * As cores de estado (`success`, `warning`, `error`) são **reservadas**. Usar o
 * vermelho de erro como "série 4" faz uma barra qualquer parecer um alerta. Aqui
 * vive um conjunto próprio, escolhido para séries.
 *
 * ## Os slots são atribuídos em ordem fixa, nunca ciclados
 *
 * A série 1 sempre recebe o slot 1. A ordem dos slots é o mecanismo de segurança
 * para daltonismo, não estética: cada par adjacente foi medido. Ciclar a lista
 * numa nona série quebraria isso, então acima de oito séries a resposta é
 * agrupar em "Other" ou separar em gráficos menores.
 *
 * ## A cor segue a entidade, nunca a posição
 *
 * Filtrar uma série não pode repintar as que sobraram. Quem desenha passa o
 * índice da ENTIDADE, e não a posição dela na lista já filtrada.
 *
 * ## Validação
 *
 * Conferida com o validador do método, contra as nossas superfícies:
 *
 * ```
 * claro  (#FFFFFF): banda de luminosidade, croma, separação para daltonismo
 *                   (pior par ΔE 9.1), piso de visão normal (ΔE 19.6)  → passa
 * escuro (#1A1A20): idem, com contraste ≥ 3:1 em todos os slots        → passa
 * ```
 *
 * ⚠️ No tema **claro**, três slots ficam abaixo de 3:1 contra o branco. A regra
 * de alívio se aplica e **não é dispensável**: todo gráfico daqui traz rótulo
 * direto e uma visão de tabela. É por isso que `DlChartFrame` tem o botão de
 * tabela e não é opcional.
 */

/** Slots do tema claro, na ordem em que devem ser atribuídos. */
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

/** Os mesmos oito tons, re-escalonados para a superfície escura. Não é um flip. */
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

/**
 * Rampa sequencial, um tom só, claro para escuro. Para magnitude contínua.
 * Nunca arco-íris: o olho não ordena matiz, ordena luminosidade.
 */
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

/**
 * Cor de uma série pelo índice da ENTIDADE.
 *
 * Acima de oito devolve o último slot em vez de gerar um tom novo: um matiz
 * inventado não passou por nenhuma das verificações. Quem chega aí deveria
 * agrupar, e o retorno repetido torna isso visível.
 */
export const seriesColor = (index: number, dark: boolean): string => {
  const slots = dark ? chartSeriesDark : chartSeriesLight;

  return slots[Math.min(index, slots.length - 1)];
};
