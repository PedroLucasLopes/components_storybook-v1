<script setup lang="ts">
/**
 * Campo de texto do ecossistema.
 *
 * Envolve o `VTextField` em vez de substituí-lo: acessibilidade, máscara de
 * foco e mensagem de erro do Vuetify continuam valendo. O que este componente
 * acrescenta é o que se repete em toda tela de gestão.
 *
 * - **`mono`** para identificador, chave e código. Fonte monoespaçada evita ler
 *   `l` por `1` e `O` por `0` num id que a pessoa vai copiar.
 * - **`copyable`** põe o botão de copiar no fim. Em tela de gestão, metade dos
 *   campos existe para ser copiada.
 * - **Rótulo fora do campo**, não flutuante. Formulário denso com rótulo
 *   flutuante fica ilegível quando preenchido: o rótulo some e sobra um valor
 *   sem contexto.
 * - **Espaço reservado para a mensagem**, para o formulário não pular de altura
 *   ao validar.
 */
import { computed, ref } from 'vue';
// Import explícito pelo mesmo motivo do `DlSelect`: o componente troca de
// forma em tempo de execução, e o auto-import da aplicação só vê tag estática.
import { VTextarea, VTextField } from 'vuetify/components';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    label?: string;
    /** Texto de apoio, abaixo do campo. Some quando há erro. */
    hint?: string;
    placeholder?: string;
    /** Mensagem de erro. Presente significa campo inválido. */
    error?: string | null;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
    /**
     * Linhas visíveis. Com valor, o campo vira área de texto que cresce com o
     * conteúdo: chave PEM, descrição, lista colada.
     */
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    /** Fonte monoespaçada. Para id, chave, código. */
    mono?: boolean;
    /** Mostra o botão de copiar. */
    copyable?: boolean;
    /** Ícone à esquerda, no formato `mdi-*`. */
    icon?: string;
    /**
     * Carregando o valor. Trava o campo e mostra um esqueleto no lugar do
     * conteúdo: campo vazio e destravado convida a digitar por cima do que
     * ainda vai chegar.
     */
    loading?: boolean;
    /** Reserva a linha da mensagem para o formulário não pular. */
    reserveError?: boolean;
    density?: 'default' | 'comfortable' | 'compact';
  }>(),
  {
    modelValue: '',
    type: 'text',
    density: 'comfortable',
    reserveError: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
  copied: [value: string];
}>();

const { t } = useDotlogText();

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const justCopied = ref(false);

const copy = async (): Promise<void> => {
  const text = String(props.modelValue ?? '');

  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    justCopied.value = true;
    emit('copied', text);
    // Confirmação curta: mais que isso e a pessoa duvida se copiou de novo.
    setTimeout(() => (justCopied.value = false), 1400);
  } catch {
    /* Sem área de transferência (contexto inseguro, permissão negada): o campo
       segue utilizável e a pessoa copia à mão. */
  }
};

const passwordVisible = ref(false);

const effectiveType = computed(() =>
  props.type === 'password' && passwordVisible.value ? 'text' : props.type,
);

const field = computed(() => (props.rows ? VTextarea : VTextField));
</script>

<template>
  <div class="dl-field">
    <label v-if="label" class="dl-field__label" :for="label">
      {{ label }}
      <span v-if="required" class="dl-field__required" aria-hidden="true">*</span>
    </label>

    <component
      :is="field"
      :id="label"
      v-model="value"
      :type="rows ? undefined : effectiveType"
      :rows="rows"
      :auto-grow="rows ? true : undefined"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      :readonly="readonly"
      :loading="loading"
      :error="!!error"
      :error-messages="error ?? undefined"
      :hint="error ? undefined : hint"
      :persistent-hint="!!hint"
      :prepend-inner-icon="icon"
      :density="density"
      :class="{ 'dl-field__input--mono': mono }"
      :hide-details="reserveError ? false : 'auto'"
      :aria-required="required || undefined"
      :aria-invalid="!!error || undefined"
      variant="outlined"
    >
      <template v-if="!rows && (copyable || type === 'password')" #append-inner>
        <VBtn
          v-if="type === 'password'"
          :icon="passwordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :aria-label="passwordVisible ? t('common.hide') : t('common.show')"
          variant="text"
          size="small"
          density="comfortable"
          @click="passwordVisible = !passwordVisible"
        />
        <VBtn
          v-if="copyable"
          :icon="justCopied ? 'mdi-check' : 'mdi-content-copy'"
          :aria-label="justCopied ? t('common.copied') : t('common.copy')"
          :color="justCopied ? 'success' : undefined"
          variant="text"
          size="small"
          density="comfortable"
          @click="copy"
        />
      </template>
    </component>
  </div>
</template>

<style scoped>
.dl-field {
  display: flex;
  flex-direction: column;
  gap: var(--dl-space-xs, 4px);
  min-width: 0;
}

.dl-field__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
  line-height: 1.3;
}

.dl-field__required {
  color: var(--dl-error);
  margin-left: 2px;
}

.dl-field__input--mono :deep(input),
.dl-field__input--mono :deep(textarea) {
  font-family: var(--dl-font-mono);
  font-size: 13px;
  letter-spacing: 0.01em;
}
</style>
