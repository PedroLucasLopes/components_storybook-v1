<script setup lang="ts">
/**
 * Lista de rótulo e valor, para a ficha de um registro.
 *
 * **É `<dl>`, não tabela nem grade de `<div>`.** O leitor de tela anuncia o par
 * "Client ID: 3f9a…", que é exatamente o que a pessoa procura numa ficha.
 *
 * **Copiar mora ao lado do valor.** Em ficha técnica, metade dos campos existe
 * para ser colada em outro lugar: client ID, redirect URI, e-mail.
 *
 * **Valor ausente é travessão, não vazio.** Espaço em branco parece campo que
 * não carregou; o travessão diz "não há".
 */
import { ref } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';

export interface DescriptionItem {
  key: string;
  label: string;
  value?: string | number | null;
  /** Fonte monoespaçada: id, chave, URI. */
  mono?: boolean;
  copyable?: boolean;
  /** Texto de apoio, abaixo do valor. */
  hint?: string;
}

withDefaults(
  defineProps<{
    items: DescriptionItem[];
    /** Colunas no desktop. No telefone é sempre uma. */
    columns?: 1 | 2 | 3;
  }>(),
  { columns: 2 },
);

const { t } = useDotlogText();

const copiedKey = ref<string | null>(null);

let timer: ReturnType<typeof setTimeout> | undefined;

const copy = async (item: DescriptionItem): Promise<void> => {
  const text = item.value === null || item.value === undefined ? '' : String(item.value);

  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copiedKey.value = item.key;
    clearTimeout(timer);
    timer = setTimeout(() => (copiedKey.value = null), 1400);
  } catch {
    /* Sem área de transferência a ficha continua legível e selecionável. */
  }
};
</script>

<template>
  <dl class="dl-desc" :style="{ '--dl-desc-columns': columns }">
    <div v-for="item in items" :key="item.key" class="dl-desc__item">
      <dt class="dl-desc__label">{{ item.label }}</dt>
      <dd class="dl-desc__value">
        <span class="dl-desc__content" :class="{ 'dl-desc__content--mono': item.mono }">
          <slot :name="`item-${item.key}`" :item="item">
            {{ item.value === null || item.value === undefined || item.value === '' ? '—' : item.value }}
          </slot>
        </span>
        <VBtn
          v-if="item.copyable && item.value"
          :icon="copiedKey === item.key ? 'mdi-check' : 'mdi-content-copy'"
          :aria-label="copiedKey === item.key ? t('description.copied', { label: item.label }) : t('description.copy', { label: item.label })"
          :title="copiedKey === item.key ? t('common.copied') : t('common.copy')"
          :color="copiedKey === item.key ? 'success' : undefined"
          variant="text"
          size="x-small"
          density="comfortable"
          class="dl-desc__copy"
          @click="copy(item)"
        />
      </dd>
      <p v-if="item.hint" class="dl-desc__hint">{{ item.hint }}</p>
    </div>
  </dl>
</template>

<style scoped>
.dl-desc {
  display: grid;
  grid-template-columns: repeat(var(--dl-desc-columns, 2), minmax(0, 1fr));
  gap: 18px 24px;
  margin: 0;
  font-family: var(--dl-font);
}

.dl-desc__item {
  min-width: 0;
}

.dl-desc__label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--dl-on-surface-muted);
  margin-bottom: 4px;
}

.dl-desc__value {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  min-width: 0;
  font-size: 14px;
  color: var(--dl-on-surface);
}

.dl-desc__content {
  min-width: 0;
  overflow-wrap: anywhere;
}

.dl-desc__content--mono {
  font-family: var(--dl-font-mono);
  font-size: 13px;
}

.dl-desc__copy {
  flex-shrink: 0;
}

.dl-desc__hint {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--dl-on-surface-muted);
}

@media (max-width: 599px) {
  .dl-desc {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
