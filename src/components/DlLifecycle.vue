<script setup lang="ts">
/**
 * Onde um registro está no ciclo de vida dele: as etapas em ordem, a atual
 * marcada, e a saída que encerra o caminho antes do fim.
 *
 * **A situação diz "onde"; o ciclo diz "e depois".** A pastilha `PENDING`
 * informa o estado, mas não que o próximo passo é começar e o último é fechar.
 * Quem abre um contrato precisa das duas coisas.
 *
 * **Saída não é etapa.** Cancelar não vem depois de ativo: é um desvio. Ela
 * aparece no fim, com tom próprio, e as etapas que não chegaram a acontecer
 * ficam marcadas como puladas. Como pendentes, prometeriam um futuro que não
 * vem.
 *
 * **Lista ordenada de verdade.** `<ol>`, com `aria-current="step"` na atual e o
 * estado de cada etapa em texto para o leitor de tela. Cor e ícone repetem a
 * informação, nunca a carregam sozinhos.
 *
 * **Vira coluna quando falta largura**, pela largura do próprio componente e
 * não da janela, como o `DlMasterDetail`: dentro de um cartão estreito a linha
 * horizontal não cabe, mesmo com a janela larga.
 *
 * O componente não conhece contrato nem projeto. As etapas chegam por prop, e o
 * mesmo desenho serve `PENDING › ACTIVE › COMPLETED` e qualquer outro fluxo.
 */
import { computed } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';
import type { StatusTone } from './DlStatusChip.vue';

export interface LifecycleStep {
  key: string;
  label: string;
  /** Ícone da etapa ainda não feita, no formato `mdi-*`. Feita, ela mostra o visto. */
  icon?: string;
  /** Texto curto abaixo do rótulo: quando aconteceu, quem fez. */
  caption?: string;
}

export interface LifecycleExit extends LifecycleStep {
  /** Tom da saída. Cancelado costuma ser `dark`; recusado, `error`. */
  tone?: StatusTone;
}

type StepState = 'done' | 'current' | 'pending' | 'skipped';

const props = withDefaults(
  defineProps<{
    /** O caminho principal, em ordem. */
    steps: LifecycleStep[];
    /** Chave da situação atual: uma etapa ou uma saída. */
    current: string;
    /** Situações que encerram o caminho antes do fim. */
    exits?: LifecycleExit[];
    /** Última etapa alcançada antes da saída. Sem valor, nenhuma conta como feita. */
    exitedFrom?: string;
    /** Nome da lista para o leitor de tela. Sem valor, "Lifecycle" na língua corrente. */
    label?: string;
  }>(),
  { exits: () => [], exitedFrom: undefined, label: undefined },
);

const { t } = useDotlogText();

/** Mesma tradução de tom para cor do tema que a pastilha de situação usa. */
const TONE_COLOR: Record<StatusTone, string> = {
  neutral: 'on-surface-variant',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  dark: 'on-surface',
};

const exit = computed(() => props.exits.find((item) => item.key === props.current) ?? null);

const items = computed(() => {
  const currentIndex = props.steps.findIndex((step) => step.key === props.current);
  const lastReached = exit.value && props.exitedFrom
    ? props.steps.findIndex((step) => step.key === props.exitedFrom)
    : -1;

  return props.steps.map((step, index) => {
    let state: StepState;

    if (exit.value) {
      state = index <= lastReached ? 'done' : 'skipped';
    } else if (currentIndex === -1 || index > currentIndex) {
      state = 'pending';
    } else if (index < currentIndex || index === props.steps.length - 1) {
      // A última etapa, quando é a atual, é o fluxo concluído: mostra o visto.
      state = 'done';
    } else {
      state = 'current';
    }

    return { ...step, state, isCurrent: !exit.value && index === currentIndex };
  });
});

const STATE_TEXT = {
  done: 'lifecycle.done',
  current: 'lifecycle.current',
  pending: 'lifecycle.pending',
  skipped: 'lifecycle.skipped',
} as const satisfies Record<StepState, string>;

/** O estado em texto, para o leitor de tela: a cor e o ícone não chegam até ele. */
const stateText = (item: { state: StepState; label: string }): string =>
  t(STATE_TEXT[item.state], { step: item.label });

const markerIcon = (item: { state: StepState; icon?: string }): string => {
  if (item.state === 'done') return 'mdi-check';
  if (item.state === 'skipped') return 'mdi-minus';

  return item.icon ?? 'mdi-circle-small';
};

const exitStyle = computed(() => ({
  '--dl-life-exit-rgb': `var(--v-theme-${TONE_COLOR[exit.value?.tone ?? 'neutral']})`,
}));
</script>

<template>
  <div class="dl-life">
    <ol class="dl-life__list" :aria-label="label ?? t('lifecycle.label')">
      <li
        v-for="item in items"
        :key="item.key"
        class="dl-life__step"
        :class="[`dl-life__step--${item.state}`, { 'dl-life__step--now': item.isCurrent }]"
        :aria-current="item.isCurrent ? 'step' : undefined"
      >
        <span class="dl-life__marker" aria-hidden="true">
          <VIcon :icon="markerIcon(item)" size="18" />
        </span>

        <span class="dl-life__text">
          <span class="dl-life__label" aria-hidden="true">{{ item.label }}</span>
          <span class="dl-life__sr">{{ stateText(item) }}</span>
          <span v-if="item.caption" class="dl-life__caption">{{ item.caption }}</span>
        </span>
      </li>

      <li v-if="exit" class="dl-life__step dl-life__step--exit dl-life__step--now" :style="exitStyle" aria-current="step">
        <span class="dl-life__marker" aria-hidden="true">
          <VIcon :icon="exit.icon ?? 'mdi-close'" size="18" />
        </span>

        <span class="dl-life__text">
          <span class="dl-life__label" aria-hidden="true">{{ exit.label }}</span>
          <span class="dl-life__sr">{{ t('lifecycle.exit', { step: exit.label }) }}</span>
          <span v-if="exit.caption" class="dl-life__caption">{{ exit.caption }}</span>
        </span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.dl-life {
  container-type: inline-size;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);

  --dl-life-marker: 34px;
  --dl-life-gap: 18px;
}

.dl-life__list {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dl-life__step {
  position: relative;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0 6px;
  text-align: center;

  /* Cor da etapa como `r,g,b`, para o marcador compor as intensidades. */
  --dl-life-rgb: var(--v-theme-primary);
}

/* O traço antes de cada etapa liga a anterior a ela, e tem a cor de quem chega. */
.dl-life__step::before {
  content: '';
  position: absolute;
  top: calc(var(--dl-life-marker) / 2 - 1px);
  right: calc(50% + var(--dl-life-marker) / 2 + 6px);
  left: calc(-50% + var(--dl-life-marker) / 2 + 6px);
  height: 2px;
  border-radius: 2px;
  background: rgb(var(--dl-life-rgb));
}

.dl-life__step:first-child::before {
  display: none;
}

.dl-life__marker {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--dl-life-marker);
  height: var(--dl-life-marker);
  border-radius: 50%;
  border: 2px solid rgb(var(--dl-life-rgb));
  transition:
    background var(--dl-motion-normal, 200ms) var(--dl-easing),
    border-color var(--dl-motion-normal, 200ms) var(--dl-easing),
    color var(--dl-motion-normal, 200ms) var(--dl-easing);
}

.dl-life__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dl-life__label {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.dl-life__caption {
  font-size: 12px;
  line-height: 1.35;
  color: var(--dl-on-surface-muted);
  font-variant-numeric: tabular-nums;
}

.dl-life__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* Feita: marcador cheio. */
.dl-life__step--done .dl-life__marker {
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--dl-life-rgb));
}

/* Atual: anel e fundo tonal, rótulo mais forte. */
.dl-life__step--current .dl-life__marker {
  color: rgb(var(--dl-life-rgb));
  background: rgba(var(--dl-life-rgb), 0.12);
  box-shadow: 0 0 0 4px rgba(var(--dl-life-rgb), 0.16);
}

.dl-life__step--now .dl-life__label {
  font-weight: 600;
}

/* Pendente: contorno neutro, texto de apoio. */
.dl-life__step--pending {
  --dl-life-rgb: var(--v-theme-on-surface-variant);
}

.dl-life__step--pending .dl-life__marker {
  color: var(--dl-on-surface-muted);
  background: var(--dl-surface);
  border-color: var(--dl-outline);
}

.dl-life__step--pending::before {
  background: var(--dl-outline);
}

.dl-life__step--pending .dl-life__label,
.dl-life__step--skipped .dl-life__label {
  color: var(--dl-on-surface-muted);
}

/* Pulada: tracejado, que lê como caminho não percorrido. */
.dl-life__step--skipped .dl-life__marker {
  color: var(--dl-on-surface-muted);
  background: transparent;
  border: 2px dashed var(--dl-outline);
}

.dl-life__step--skipped::before {
  height: 0;
  background: none;
  border-top: 2px dashed var(--dl-outline);
}

/* Saída: o tom pedido, cheio. */
.dl-life__step--exit {
  --dl-life-rgb: var(--dl-life-exit-rgb);
}

.dl-life__step--exit .dl-life__marker {
  color: rgb(var(--v-theme-surface));
  background: rgb(var(--dl-life-rgb));
}

.dl-life__step--exit::before {
  height: 0;
  background: none;
  border-top: 2px dashed rgb(var(--dl-life-rgb));
}

/* Estreito: coluna, com o traço descendo entre os marcadores. */
@container (max-width: 520px) {
  .dl-life__list {
    flex-direction: column;
    gap: var(--dl-life-gap);
  }

  .dl-life__step {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 0;
    text-align: start;
  }

  .dl-life__step::before {
    top: calc(-1 * var(--dl-life-gap) - 1px);
    right: auto;
    left: calc(var(--dl-life-marker) / 2 - 1px);
    width: 2px;
    height: calc(var(--dl-life-gap) + 2px);
  }

  .dl-life__step--skipped::before,
  .dl-life__step--exit::before {
    width: 0;
    border-top: none;
    border-left: 2px dashed var(--dl-outline);
  }

  .dl-life__step--exit::before {
    border-left-color: rgb(var(--dl-life-rgb));
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl-life__marker {
    transition: none;
  }
}
</style>
