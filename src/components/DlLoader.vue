<script setup lang="ts">
/**
 * Carregamento de tela, em três formas, porque são três situações diferentes.
 *
 * | Forma | Quando | Bloqueia? |
 * |---|---|---|
 * | `bar` | troca de rota, busca em segundo plano | não |
 * | `inline` | um pedaço da tela, dentro de um cartão | não |
 * | `overlay` | operação que não pode ser interrompida | sim |
 *
 * **A barra é o padrão para navegação.** Ela avisa sem tirar a tela de quem
 * ainda está lendo. Overlay em troca de rota é agressivo: apaga o que a pessoa
 * tinha na frente por causa de uma espera que costuma durar menos de um
 * segundo.
 *
 * **Overlay é para o que não pode ser interrompido**: gerar documento, importar
 * planilha, revogar chave. Ali travar é proteção, não estorvo, e por isso ele
 * pede uma mensagem dizendo o que está acontecendo.
 *
 * **Nenhuma forma aparece antes de `delay`.** Resposta de 100ms com um piscar
 * de indicador lê como defeito. Abaixo do limiar, nada aparece.
 */
import { ref, watch } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    active: boolean;
    variant?: 'bar' | 'inline' | 'overlay';
    /** Mostrado no `overlay` e no `inline`. Diga o que está acontecendo. */
    message?: string;
    /** Milissegundos antes de aparecer. */
    delay?: number;
  }>(),
  { variant: 'bar', delay: 220 },
);

const { t } = useDotlogText();

const visible = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.active,
  (active) => {
    clearTimeout(timer);

    if (!active) {
      visible.value = false;
      return;
    }

    timer = setTimeout(() => (visible.value = true), props.delay);
  },
  { immediate: true },
);
</script>

<template>
  <Transition :name="variant === 'bar' ? 'dl-loader-bar' : 'dl-loader-fade'">
    <div
      v-if="visible"
      class="dl-loader"
      :class="`dl-loader--${variant}`"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <template v-if="variant === 'bar'">
        <span class="dl-loader__sr">{{ message ?? t('common.loading') }}</span>
        <span class="dl-loader__track"><span class="dl-loader__indicator" /></span>
      </template>

      <template v-else>
        <VProgressCircular :size="variant === 'overlay' ? 38 : 28" width="3" color="primary" indeterminate />
        <p v-if="message" class="dl-loader__message">{{ message }}</p>
        <span v-else class="dl-loader__sr">{{ t('common.loading') }}</span>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.dl-loader__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* --------------------------------- bar -------------------------------- */

.dl-loader--bar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 2500;
  height: 3px;
}

.dl-loader__track {
  display: block;
  height: 100%;
  width: 100%;
  background: rgba(var(--v-theme-primary), 0.16);
  overflow: hidden;
}

/* Duas velocidades numa só faixa: a barra acelera e desacelera, que lê como
   progresso real em vez de um bloco indo e voltando. */
.dl-loader__indicator {
  display: block;
  height: 100%;
  width: 40%;
  background: var(--dl-primary);
  border-radius: 0 2px 2px 0;
  animation: dl-bar 1.3s var(--dl-easing) infinite;
}

@keyframes dl-bar {
  0% { transform: translateX(-100%) scaleX(0.6); }
  50% { transform: translateX(90%) scaleX(1); }
  100% { transform: translateX(260%) scaleX(0.6); }
}

/* ------------------------------- inline ------------------------------- */

.dl-loader--inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  min-height: 160px;
}

/* ------------------------------- overlay ------------------------------ */

.dl-loader--overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  /* Fundo da superfície com transparência, não preto: o conteúdo continua
     legível por baixo e a pessoa não perde o contexto. */
  background: rgba(var(--v-theme-surface), 0.82);
  backdrop-filter: blur(2px);
}

.dl-loader__message {
  margin: 0;
  font-family: var(--dl-font);
  font-size: 13px;
  color: var(--dl-on-surface-muted);
  text-align: center;
  max-width: 40ch;
}

/* ----------------------------- transições ----------------------------- */

.dl-loader-fade-enter-active,
.dl-loader-fade-leave-active {
  transition: opacity var(--dl-motion-normal, 200ms) var(--dl-easing);
}

.dl-loader-fade-enter-from,
.dl-loader-fade-leave-to {
  opacity: 0;
}

.dl-loader-bar-enter-active,
.dl-loader-bar-leave-active {
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-loader-bar-enter-from,
.dl-loader-bar-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .dl-loader__indicator {
    animation: none;
    width: 100%;
    opacity: 0.7;
  }

  .dl-loader-fade-enter-active,
  .dl-loader-fade-leave-active,
  .dl-loader-bar-enter-active,
  .dl-loader-bar-leave-active {
    transition: opacity 1ms linear;
  }

  .dl-loader-bar-enter-from,
  .dl-loader-bar-leave-to {
    transform: none;
  }

  .dl-loader--overlay {
    backdrop-filter: none;
  }
}
</style>
