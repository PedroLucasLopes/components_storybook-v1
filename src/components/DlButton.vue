<script setup lang="ts">
/**
 * Botão com carregamento que não sacode a tela.
 *
 * ## A largura não muda
 *
 * O rótulo continua no lugar, invisível, sustentando a caixa, e o indicador
 * entra por cima. Sem isso o botão encolhe ao virar "spinner", os vizinhos
 * andam, e o cursor da pessoa fica sobre outra coisa no momento exato em que
 * ela pode clicar de novo.
 *
 * ## O indicador espera um pouco antes de aparecer
 *
 * Resposta rápida não merece indicador: um piscar de 80ms lê como defeito, não
 * como progresso. Abaixo de `spinnerDelay` nada aparece, embora o botão já
 * esteja travado. Acima, o indicador entra suave.
 *
 * ## Fica travado até o fim
 *
 * Desabilitar durante o envio é o que impede o duplo clique virar dois
 * cadastros. Vale mesmo quando o indicador ainda não apareceu.
 */
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    appendIcon?: string;
    color?: string;
    variant?: 'flat' | 'tonal' | 'outlined' | 'text' | 'plain';
    size?: 'x-small' | 'small' | 'default' | 'large';
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
    type?: 'button' | 'submit';
    /** Milissegundos antes de o indicador aparecer. Ver a nota acima. */
    spinnerDelay?: number;
  }>(),
  {
    color: 'primary',
    variant: 'flat',
    size: 'default',
    type: 'button',
    spinnerDelay: 220,
  },
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const showSpinner = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.loading,
  (loading) => {
    clearTimeout(timer);

    if (!loading) {
      showSpinner.value = false;
      return;
    }

    timer = setTimeout(() => (showSpinner.value = true), props.spinnerDelay);
  },
  { immediate: true },
);

/** Travado desde o primeiro instante, mesmo antes de o indicador aparecer. */
const locked = computed(() => props.loading || props.disabled);
</script>

<template>
  <VBtn
    :color="color"
    :variant="variant"
    :size="size"
    :block="block"
    :type="type"
    :disabled="locked"
    :aria-busy="loading || undefined"
    class="dl-button"
    :class="{ 'dl-button--busy': showSpinner }"
    @click="emit('click', $event)"
  >
    <!-- O conteúdo some da vista mas continua ocupando a caixa. Ver a nota
         sobre largura no topo do arquivo. -->
    <span class="dl-button__content">
      <VIcon v-if="icon" :icon="icon" size="18" class="dl-button__icon" />
      <slot>{{ label }}</slot>
      <VIcon v-if="appendIcon" :icon="appendIcon" size="18" class="dl-button__icon" />
    </span>

    <Transition name="dl-button-spinner">
      <span v-if="showSpinner" class="dl-button__spinner">
        <VProgressCircular :size="size === 'small' || size === 'x-small' ? 16 : 20" width="2" indeterminate />
      </span>
    </Transition>
  </VBtn>
</template>

<style scoped>
.dl-button {
  position: relative;
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

/* Afunda de leve ao pressionar. Retorno tátil sem custo de layout. */
.dl-button:not(:disabled):active {
  transform: translateY(1px);
}

.dl-button__content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-button--busy .dl-button__content {
  opacity: 0;
}

.dl-button__icon {
  flex-shrink: 0;
}

.dl-button__spinner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.dl-button-spinner-enter-active,
.dl-button-spinner-leave-active {
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-button-spinner-enter-from,
.dl-button-spinner-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (prefers-reduced-motion: reduce) {
  .dl-button,
  .dl-button__content,
  .dl-button-spinner-enter-active,
  .dl-button-spinner-leave-active {
    transition: none;
  }

  .dl-button:not(:disabled):active {
    transform: none;
  }

  .dl-button-spinner-enter-from,
  .dl-button-spinner-leave-to {
    transform: none;
  }
}
</style>
