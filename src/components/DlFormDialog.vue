<script setup lang="ts">
/**
 * Modal de cadastro e de edição. É o mesmo componente para os dois: muda o
 * título, o rótulo do botão e o que já vem preenchido, não a estrutura.
 *
 * ## Erro do servidor aparece DENTRO do modal
 *
 * Falha ao salvar não vira toast. O toast vive no canto da tela, e a pessoa
 * está olhando para o formulário; ela precisa ver a mensagem ao lado do que
 * causou o problema, e o modal não pode fechar, senão o que ela digitou some.
 * Toast fica para o que já terminou: "equipamento cadastrado".
 *
 * ## Não fecha por engano
 *
 * Com `dirty`, clicar fora ou apertar Esc pede confirmação. Formulário longo
 * perdido por um clique distraído é o tipo de coisa que faz a pessoa desconfiar
 * do sistema inteiro.
 *
 * ## Tela cheia no telefone
 *
 * Abaixo de 600px o modal ocupa a tela. Caixa flutuante com formulário em
 * telefone deixa o teclado cobrindo metade dos campos e o rodapé fora de
 * alcance.
 */
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode?: 'create' | 'edit';
    title: string;
    description?: string;
    /** Rótulo do botão principal. Sem valor, sai do `mode`. */
    submitLabel?: string;
    cancelLabel?: string;
    /** Mensagem de falha vinda do servidor. Fica no topo do corpo. */
    error?: string | null;
    /** Trava os botões e mostra o progresso enquanto salva. */
    submitting?: boolean;
    /** Há alteração não salva. Liga a confirmação de fechamento. */
    dirty?: boolean;
    /** Largura máxima no desktop. */
    width?: number | string;
  }>(),
  {
    mode: 'create',
    cancelLabel: 'Cancel',
    width: 560,
  },
);

const emit = defineEmits<{
  'update:modelValue': [open: boolean];
  submit: [];
  cancel: [];
}>();

const { smAndDown } = useDisplay();

const confirmingClose = ref(false);

// Some com a confirmação pendente ao reabrir: herdar o estado da vez anterior
// faria o modal abrir já perguntando se pode fechar.
watch(
  () => props.modelValue,
  (open) => {
    if (open) confirmingClose.value = false;
  },
);

const primaryLabel = computed(
  () => props.submitLabel ?? (props.mode === 'create' ? 'Create' : 'Save changes'),
);

const requestClose = (): void => {
  if (props.submitting) return;

  if (props.dirty) {
    confirmingClose.value = true;
    return;
  }

  close();
};

const close = (): void => {
  confirmingClose.value = false;
  emit('update:modelValue', false);
  emit('cancel');
};
</script>

<template>
  <VDialog
    :model-value="modelValue"
    :max-width="smAndDown ? undefined : width"
    :fullscreen="smAndDown"
    :persistent="dirty || submitting"
    scrollable
    @update:model-value="$event ? emit('update:modelValue', true) : requestClose()"
    @keydown.esc.prevent="requestClose"
  >
    <VCard rounded="lg" class="dl-form-dialog">
      <header class="dl-form-dialog__head">
        <div class="dl-form-dialog__heading">
          <h2 class="dl-form-dialog__title">{{ title }}</h2>
          <p v-if="description" class="dl-form-dialog__description">{{ description }}</p>
        </div>
        <VBtn
          icon="mdi-close"
          aria-label="Close"
          variant="text"
          size="small"
          density="comfortable"
          :disabled="submitting"
          @click="requestClose"
        />
      </header>

      <!-- Progresso no topo, não overlay: os campos seguem visíveis enquanto
           salva, e a pessoa vê o que está sendo enviado. -->
      <VProgressLinear
        v-if="submitting"
        color="primary"
        height="2"
        indeterminate
        class="dl-form-dialog__progress"
      />

      <div class="dl-form-dialog__body">
        <div v-if="error" class="dl-form-dialog__error" role="alert">
          <VIcon icon="mdi-alert-circle-outline" size="18" color="error" />
          <span>{{ error }}</span>
        </div>

        <slot />
      </div>

      <footer class="dl-form-dialog__foot">
        <slot name="secondary-action" />
        <VBtn variant="text" :disabled="submitting" @click="requestClose">
          {{ cancelLabel }}
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          :loading="submitting"
          @click="emit('submit')"
        >
          {{ primaryLabel }}
        </VBtn>
      </footer>
    </VCard>

    <!-- Guarda de saída. Empilha sobre o formulário, que continua intacto. -->
    <VDialog v-model="confirmingClose" :max-width="400" persistent>
      <VCard rounded="lg" class="dl-form-dialog__guard">
        <h3 class="dl-form-dialog__guard-title">Discard changes?</h3>
        <p class="dl-form-dialog__guard-text">
          What you typed has not been saved and will be lost.
        </p>
        <div class="dl-form-dialog__guard-actions">
          <VBtn variant="text" @click="confirmingClose = false">Keep editing</VBtn>
          <VBtn color="error" variant="flat" @click="close">Discard</VBtn>
        </div>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<style scoped>
.dl-form-dialog {
  background: var(--dl-surface);
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.dl-form-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 16px 14px 20px;
  border-bottom: 1px solid var(--dl-outline);
}

.dl-form-dialog__heading {
  min-width: 0;
}

.dl-form-dialog__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--dl-on-surface);
}

.dl-form-dialog__description {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
}

.dl-form-dialog__progress {
  flex-shrink: 0;
}

.dl-form-dialog__body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dl-form-dialog__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-error);
  background: rgb(var(--v-theme-error), 0.1);
  border: 1px solid rgb(var(--v-theme-error), 0.4);
  border-radius: var(--dl-radius-sm, 6px);
}

.dl-form-dialog__foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--dl-outline);
}

.dl-form-dialog__guard {
  padding: 20px;
  background: var(--dl-surface);
}

.dl-form-dialog__guard-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--dl-on-surface);
}

.dl-form-dialog__guard-text {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
}

.dl-form-dialog__guard-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}

/* Em telefone o rodapé fica colado embaixo e os botões dividem a largura:
   alvo de toque maior e nada espremido no canto. */
@media (max-width: 599px) {
  .dl-form-dialog__foot {
    padding-bottom: max(14px, env(safe-area-inset-bottom));
  }

  .dl-form-dialog__foot > * {
    flex: 1 1 auto;
  }
}
</style>
