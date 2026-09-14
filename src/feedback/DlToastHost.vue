<script setup lang="ts">
/**
 * Onde os avisos aparecem. Monte **uma vez**, perto da raiz da aplicação.
 *
 * ## Duas regiões vivas, não uma
 *
 * Erro entra numa região `role="alert"`, que o leitor de tela interrompe para
 * anunciar. Os demais entram numa `role="status"`, que espera a leitura atual
 * terminar. Jogar tudo em `alert` faz o leitor cortar a pessoa no meio de uma
 * frase para dizer "salvo com sucesso", e aí ela desliga o som.
 *
 * ## Canto inferior, largura inteira no telefone
 *
 * No desktop fica no canto, longe do conteúdo. No telefone ocupa a largura,
 * porque um cartão estreito no canto de uma tela de 375px vira uma tira
 * ilegível. Fica acima da área de gesto do sistema.
 *
 * ## Quem prefere menos movimento não recebe deslizamento
 *
 * Com `prefers-reduced-motion`, a entrada é um aparecer simples. O aviso
 * continua chegando; só não desliza.
 */
import { computed } from 'vue';
import { useToasts, type Toast, type ToastKind } from './useToast';

const { toasts, dismiss, pause, resume } = useToasts();

const KIND_ICON: Record<ToastKind, string> = {
  success: 'mdi-check-circle-outline',
  info: 'mdi-information-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
};

const KIND_COLOR: Record<ToastKind, string> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

const alerts = computed(() => toasts.value.filter((t) => t.kind === 'error'));
const statuses = computed(() => toasts.value.filter((t) => t.kind !== 'error'));

const onAction = (item: Toast): void => {
  item.action?.handler();
  dismiss(item.id);
};
</script>

<template>
  <div class="dl-toasts">
    <!-- Erro interrompe o leitor de tela; o resto espera. Ver a nota acima. -->
    <div class="dl-toasts__region" role="alert" aria-live="assertive">
      <TransitionGroup name="dl-toast">
        <article
          v-for="item in alerts"
          :key="item.id"
          class="dl-toast dl-toast--error"
          @mouseenter="pause(item.id)"
          @mouseleave="resume(item.id)"
          @focusin="pause(item.id)"
          @focusout="resume(item.id)"
        >
          <VIcon :icon="KIND_ICON[item.kind]" :color="KIND_COLOR[item.kind]" size="20" class="dl-toast__icon" />
          <div class="dl-toast__body">
            <p class="dl-toast__title">{{ item.title }}</p>
            <p v-if="item.description" class="dl-toast__description">{{ item.description }}</p>
            <VBtn
              v-if="item.action"
              :color="KIND_COLOR[item.kind]"
              variant="text"
              size="small"
              class="dl-toast__action"
              @click="onAction(item)"
            >
              {{ item.action.label }}
            </VBtn>
          </div>
          <VBtn
            icon="mdi-close"
            aria-label="Dismiss"
            variant="text"
            size="x-small"
            density="comfortable"
            class="dl-toast__close"
            @click="dismiss(item.id)"
          />
        </article>
      </TransitionGroup>
    </div>

    <div class="dl-toasts__region" role="status" aria-live="polite">
      <TransitionGroup name="dl-toast">
        <article
          v-for="item in statuses"
          :key="item.id"
          class="dl-toast"
          :class="`dl-toast--${item.kind}`"
          @mouseenter="pause(item.id)"
          @mouseleave="resume(item.id)"
          @focusin="pause(item.id)"
          @focusout="resume(item.id)"
        >
          <VIcon :icon="KIND_ICON[item.kind]" :color="KIND_COLOR[item.kind]" size="20" class="dl-toast__icon" />
          <div class="dl-toast__body">
            <p class="dl-toast__title">{{ item.title }}</p>
            <p v-if="item.description" class="dl-toast__description">{{ item.description }}</p>
            <VBtn
              v-if="item.action"
              :color="KIND_COLOR[item.kind]"
              variant="text"
              size="small"
              class="dl-toast__action"
              @click="onAction(item)"
            >
              {{ item.action.label }}
            </VBtn>
          </div>
          <VBtn
            icon="mdi-close"
            aria-label="Dismiss"
            variant="text"
            size="x-small"
            density="comfortable"
            class="dl-toast__close"
            @click="dismiss(item.id)"
          />
        </article>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.dl-toasts {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2400;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: min(400px, calc(100vw - 32px));
}

.dl-toasts__region {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dl-toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 12px 12px 14px;
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
  border-left: 3px solid var(--dl-outline);
  border-radius: var(--dl-radius-md, 10px);
  box-shadow: 0 8px 24px rgba(16, 18, 28, 0.16);
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
}

/* A faixa à esquerda repete o tipo em cor, sem depender só do ícone. */
.dl-toast--success { border-left-color: var(--dl-success); }
.dl-toast--info { border-left-color: var(--dl-info); }
.dl-toast--warning { border-left-color: var(--dl-warning); }
.dl-toast--error { border-left-color: var(--dl-error); }

.dl-toast__icon {
  margin-top: 1px;
  flex-shrink: 0;
}

.dl-toast__body {
  min-width: 0;
  flex: 1;
}

.dl-toast__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.dl-toast__description {
  margin: 3px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--dl-on-surface-muted);
  overflow-wrap: anywhere;
}

.dl-toast__action {
  margin: 6px 0 0 -8px;
}

.dl-toast__close {
  flex-shrink: 0;
  margin: -2px -4px 0 0;
  opacity: 0.7;
}

.dl-toast__close:hover {
  opacity: 1;
}

.dl-toast-enter-active,
.dl-toast-leave-active {
  transition:
    opacity var(--dl-motion-normal, 200ms) var(--dl-easing),
    transform var(--dl-motion-normal, 200ms) var(--dl-easing);
}

.dl-toast-enter-from,
.dl-toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Os que ficam deslizam para o lugar em vez de saltar. */
.dl-toast-move {
  transition: transform var(--dl-motion-normal, 200ms) var(--dl-easing);
}

@media (prefers-reduced-motion: reduce) {
  .dl-toast-enter-active,
  .dl-toast-leave-active,
  .dl-toast-move {
    transition: opacity 1ms linear;
  }

  .dl-toast-enter-from,
  .dl-toast-leave-to {
    transform: none;
  }
}

/* No telefone ocupa a largura: cartão estreito no canto de uma tela de 375px
   vira uma tira ilegível. */
@media (max-width: 599px) {
  .dl-toasts {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
  }
}
</style>
