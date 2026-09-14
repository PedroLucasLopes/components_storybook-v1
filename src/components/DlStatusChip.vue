<script setup lang="ts">
/**
 * Situação de um registro, como pastilha.
 *
 * ## Três intensidades da mesma cor
 *
 * ```
 * texto e ícone   cor cheia          o que informa
 * borda           cor a 42%          delimita, e sobrevive a fundo zebrado
 * fundo           cor a 12%          agrupa, sem competir com o texto
 * ```
 *
 * A borda existe por uma razão prática: dentro da tabela a linha muda de fundo
 * no hover e na zebra, e uma pastilha só com preenchimento fraco some nesse
 * momento. Com contorno ela continua sendo um objeto.
 *
 * ## Por que não é `VChip`
 *
 * O `tonal` do Vuetify dá fundo fraco sem borda, e o `outlined` dá borda sem
 * fundo. Precisávamos dos dois, em intensidades diferentes, então a pastilha é
 * um `<span>` e lê a cor do tema por `--v-theme-*`, que o Vuetify publica como
 * `r,g,b` justamente para composição assim.
 *
 * ## Decisões que não mudam
 *
 * **O mapa é de quem usa.** O componente não conhece `AVAILABLE` nem `PENDING`.
 * Cada aplicação passa o próprio mapa, e o mesmo componente serve equipamento,
 * contrato e projeto. Situação fora do mapa cai em `neutral` com o próprio
 * código como rótulo, em vez de sumir.
 *
 * **A cor nunca vai sozinha.** Sempre há texto. Quem não distingue vermelho de
 * verde, que é perto de um homem em doze, ficaria sem informação num sistema
 * que só muda a cor.
 *
 * **`dark` não é `#000000`.** Ele resolve para `on-surface`: quase preto no tema
 * claro e quase branco no escuro. Preto fixo desapareceria no tema escuro, e é
 * justamente o estado arquivado que precisa continuar legível para não ser
 * confundido com célula vazia.
 */
import { computed } from 'vue';

export type StatusTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  /** Máximo contraste neutro. Para arquivado, retirado, encerrado. */
  | 'dark';

export interface StatusDefinition {
  label: string;
  tone: StatusTone;
  icon?: string;
}

const props = withDefaults(
  defineProps<{
    status: string;
    /** Mapa de situação para aparência. Situação ausente vira neutra. */
    map: Record<string, StatusDefinition>;
    size?: 'small' | 'default';
    /** Mostra o ícone declarado no mapa. */
    withIcon?: boolean;
  }>(),
  { size: 'small', withIcon: true },
);

/**
 * Tom para cor do tema. Os pares texto sobre fundo foram conferidos contra a
 * WCAG na composição acima, com `npm run check:contrast`.
 */
const TONE_COLOR: Record<StatusTone, string> = {
  neutral: 'on-surface-variant',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  dark: 'on-surface',
};

const definition = computed<StatusDefinition>(
  () => props.map[props.status] ?? { label: props.status, tone: 'neutral' },
);

/* O Vuetify publica cada cor do tema como `r,g,b` numa variável CSS. Repassar
   por uma variável própria deixa o CSS abaixo compor as três intensidades sem
   saber qual tom está em uso. */
const style = computed(() => ({
  '--dl-status-rgb': `var(--v-theme-${TONE_COLOR[definition.value.tone]})`,
}));
</script>

<template>
  <span class="dl-status" :class="`dl-status--${size}`" :style="style">
    <VIcon
      v-if="withIcon && definition.icon"
      :icon="definition.icon"
      :size="size === 'small' ? 14 : 16"
      class="dl-status__icon"
    />
    {{ definition.label }}
  </span>
</template>

<style scoped>
.dl-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  font-family: var(--dl-font);
  font-weight: 500;
  letter-spacing: 0.01em;
  border-radius: var(--dl-radius-sm, 6px);

  color: rgb(var(--dl-status-rgb));
  background: rgba(var(--dl-status-rgb), 0.12);
  border: 1px solid rgba(var(--dl-status-rgb), 0.42);
}

.dl-status--small {
  font-size: 12px;
  padding: 1px 8px;
  line-height: 1.6;
}

.dl-status--default {
  font-size: 13px;
  padding: 3px 10px;
  line-height: 1.6;
}

.dl-status__icon {
  /* O ícone é reforço, não a informação: um pouco mais apagado que o texto
     mantém a leitura no rótulo. */
  opacity: 0.9;
  flex-shrink: 0;
}
</style>
