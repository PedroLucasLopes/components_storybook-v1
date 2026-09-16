<script setup lang="ts">
/**
 * Esqueleto de conteúdo.
 *
 * ## Por que esqueleto e não giro
 *
 * Um indicador circular diz "espere". Um esqueleto diz "vai aparecer aqui, com
 * esta forma". A segunda mensagem é melhor porque o olho já se posiciona, e
 * quando o dado chega nada salta: o bloco cinza vira texto no mesmo lugar.
 *
 * ## O brilho atravessa, não pisca
 *
 * Opacidade piscando lê como defeito. Um brilho que varre da esquerda para a
 * direita lê como carregamento, e é o que o olho já aprendeu em toda parte.
 *
 * ## Quem prefere menos movimento vê um bloco parado
 *
 * Com `prefers-reduced-motion` o brilho some e fica a forma. A informação
 * "está carregando" continua, porque ela está na forma, não na animação.
 */
import { useDotlogText } from '../i18n/useDotlogText';

withDefaults(
  defineProps<{
    /** Quantos blocos empilhar. */
    lines?: number;
    /** Altura de cada bloco. */
    height?: string;
    /** Largura. `varied` faz a última linha mais curta, como texto real. */
    width?: string;
    variant?: 'text' | 'block' | 'circle';
    /** Última linha mais curta, como parágrafo de verdade. */
    varied?: boolean;
  }>(),
  {
    lines: 1,
    height: '14px',
    width: '100%',
    variant: 'text',
    varied: true,
  },
);

const { t } = useDotlogText();
</script>

<template>
  <div
    class="dl-skeleton"
    :class="`dl-skeleton--${variant}`"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="dl-skeleton__sr">{{ t('common.loading') }}</span>
    <span
      v-for="n in lines"
      :key="n"
      class="dl-skeleton__bar"
      :style="{
        height: variant === 'circle' ? width : height,
        width: varied && lines > 1 && n === lines ? '62%' : width,
      }"
    />
  </div>
</template>

<style scoped>
.dl-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.dl-skeleton__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.dl-skeleton__bar {
  display: block;
  border-radius: var(--dl-radius-sm, 6px);
  background: var(--dl-surface-variant);
  position: relative;
  overflow: hidden;
}

/* O brilho é um gradiente que atravessa. `transform` só, para a animação
   rodar no compositor e não forçar novo layout a cada quadro. */
.dl-skeleton__bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--v-theme-on-surface), 0.07) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: dl-shimmer 1.6s var(--dl-easing) infinite;
}

.dl-skeleton--circle .dl-skeleton__bar {
  border-radius: 50%;
  aspect-ratio: 1;
}

.dl-skeleton--block .dl-skeleton__bar {
  border-radius: var(--dl-radius-md, 10px);
}

@keyframes dl-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl-skeleton__bar::after {
    animation: none;
    background: none;
  }
}
</style>
