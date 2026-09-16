<script setup lang="ts">
/**
 * Confirmação de ação destrutiva.
 *
 * **O botão diz o que faz.** "Confirmar" e "OK" obrigam a reler a pergunta para
 * saber o que vai acontecer. O rótulo padrão é o verbo da ação: "Retirar
 * equipamento", "Revogar chave".
 *
 * **Digitar para confirmar, quando o estrago é grande.** Com `requireText`, a
 * pessoa precisa escrever o nome do registro. É atrito de propósito, reservado
 * para o que não tem volta: revogar chave de cliente, apagar projeto.
 *
 * **O botão seguro vem primeiro na ordem de foco.** Quem quer destruir precisa
 * se mover até lá, e não acertar por reflexo.
 */
import { computed, ref, watch } from 'vue';
import { splitAround, useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message?: string;
    /** Sem valor, "Confirmar" na língua corrente. Prefira o verbo da ação. */
    confirmLabel?: string;
    cancelLabel?: string;
    /** Vermelho e ícone de alerta. Ligue para o que apaga ou revoga. */
    destructive?: boolean;
    /** Exige digitar este texto para liberar a confirmação. */
    requireText?: string | null;
    processing?: boolean;
    /**
     * Falha vinda do servidor. Aparece aqui dentro, e o modal não fecha: a
     * pessoa precisa ler por que não deu, ao lado do que tentou fazer.
     */
    error?: string | null;
  }>(),
  {
    confirmLabel: undefined,
    cancelLabel: undefined,
    requireText: null,
  },
);

const { t } = useDotlogText();

/* O texto a digitar vai em `<code>`, no lugar que cada língua der a ele. */
const gate = computed(() => splitAround((marker) => t('confirm.typeToConfirm', { text: marker })));

const emit = defineEmits<{
  'update:modelValue': [isOpen: boolean];
  confirm: [];
  cancel: [];
}>();

const typed = ref('');

// Limpa ao abrir: reaproveitar o texto da vez anterior liberaria a confirmação
// sem a pessoa ter lido de novo.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) typed.value = '';
  },
);

const unlocked = computed(
  () => !props.requireText || typed.value.trim() === props.requireText,
);

const close = (): void => {
  emit('update:modelValue', false);
  emit('cancel');
};
</script>

<template>
  <VDialog
    :model-value="modelValue"
    :max-width="460"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard rounded="lg" class="dl-confirm">
      <div class="dl-confirm__head">
        <VIcon
          :icon="destructive ? 'mdi-alert-outline' : 'mdi-help-circle-outline'"
          :color="destructive ? 'error' : 'primary'"
          size="24"
        />
        <h2 class="dl-confirm__title">{{ title }}</h2>
      </div>

      <p v-if="message" class="dl-confirm__message">{{ message }}</p>

      <div v-if="error" class="dl-confirm__error" role="alert">
        <VIcon icon="mdi-alert-circle-outline" size="18" color="error" />
        <span>{{ error }}</span>
      </div>

      <div v-if="requireText" class="dl-confirm__gate">
        <p class="dl-confirm__gate-label">
          {{ gate[0] }}<code>{{ requireText }}</code>{{ gate[1] }}
        </p>
        <VTextField
          v-model="typed"
          :placeholder="requireText"
          variant="outlined"
          density="comfortable"
          autocomplete="off"
          hide-details
        />
      </div>

      <div class="dl-confirm__actions">
        <VBtn variant="text" :disabled="processing" @click="close">
          {{ cancelLabel ?? t('common.cancel') }}
        </VBtn>
        <VBtn
          :color="destructive ? 'error' : 'primary'"
          :disabled="!unlocked || processing"
          :loading="processing"
          variant="flat"
          @click="emit('confirm')"
        >
          {{ confirmLabel ?? t('common.confirm') }}
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<style scoped>
.dl-confirm {
  padding: 20px;
  background: var(--dl-surface);
}

.dl-confirm__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dl-confirm__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--dl-on-surface);
}

.dl-confirm__message {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--dl-on-surface-muted);
}

.dl-confirm__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-error);
  background: rgb(var(--v-theme-error), 0.1);
  border: 1px solid rgb(var(--v-theme-error), 0.4);
  border-radius: var(--dl-radius-sm, 6px);
}

.dl-confirm__gate {
  margin-top: 16px;
}

.dl-confirm__gate-label {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--dl-on-surface-muted);
}

.dl-confirm__gate-label code {
  font-family: var(--dl-font-mono);
  font-size: 12px;
  background: var(--dl-surface-variant);
  padding: 1px 6px;
  border-radius: var(--dl-radius-sm, 6px);
  color: var(--dl-on-surface);
}

.dl-confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>
