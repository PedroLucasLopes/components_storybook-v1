<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue';
import { useLocale } from 'vuetify';
import { splitAround, useDotlogText } from '../i18n/useDotlogText';

export type FileRejection = 'type' | 'size' | 'count';

const props = withDefaults(
  defineProps<{
    modelValue?: File | null;
    label?: string;
    hint?: string;
    accept?: string;
    maxSize?: number;
    error?: string | null;
    required?: boolean;
    disabled?: boolean;
    icon?: string;
  }>(),
  {
    modelValue: null,
    label: undefined,
    hint: undefined,
    accept: undefined,
    maxSize: undefined,
    error: null,
    icon: 'mdi-file-upload-outline',
  },
);

const emit = defineEmits<{
  'update:modelValue': [file: File | null];
  rejected: [reason: FileRejection, file: File | null];
}>();

const { t } = useDotlogText();
const locale = useLocale();

const labelId = useId();
const messageId = useId();

const input = ref<HTMLInputElement | null>(null);
const browseButton = ref<HTMLButtonElement | null>(null);

const depth = ref(0);
const dragging = computed(() => depth.value > 0 && !props.disabled);

const rejection = ref<{ reason: FileRejection; name: string } | null>(null);

const tokens = computed(() =>
  (props.accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean),
);

const accepts = (file: File): boolean => {
  if (tokens.value.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return tokens.value.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));

    return type === token;
  });
};

const typesLabel = computed(() => {
  const extensions = tokens.value.filter((token) => token.startsWith('.'));
  const names = extensions.length
    ? extensions.map((token) => token.slice(1))
    : tokens.value.map((token) => (token.endsWith('/*') ? token.slice(0, -2) : (token.split('/')[1] ?? token)));

  return [...new Set(names.map((name) => name.toUpperCase()))].join(', ');
});

const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

const formatSize = (bytes: number): string => {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return new Intl.NumberFormat(locale.current.value || 'en', {
    style: 'unit',
    unit: UNITS[unit],
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
};

const constraints = computed(() =>
  [
    typesLabel.value ? t('fileDrop.accepts', { types: typesLabel.value }) : '',
    props.maxSize === undefined ? '' : t('fileDrop.upTo', { size: formatSize(props.maxSize) }),
  ]
    .filter(Boolean)
    .join(' · '),
);

const prompt = computed(() => splitAround((marker) => t('fileDrop.prompt', { browse: marker })));

const message = computed(() => {
  if (props.error) return props.error;

  const current = rejection.value;

  if (!current) return null;
  if (current.reason === 'count') return t('fileDrop.oneFile');
  if (current.reason === 'type') return t('fileDrop.wrongType', { name: current.name, types: typesLabel.value });

  return t('fileDrop.tooLarge', { name: current.name, size: formatSize(props.maxSize ?? 0) });
});

const reject = (reason: FileRejection, file: File | null): void => {
  rejection.value = { reason, name: file?.name ?? '' };
  emit('rejected', reason, file);
};

const choose = (files: FileList | null | undefined): void => {
  const list = files ? Array.from(files) : [];

  if (list.length === 0) return;

  if (list.length > 1) {
    reject('count', null);
    return;
  }

  const [file] = list;

  if (!accepts(file)) {
    reject('type', file);
    return;
  }

  if (props.maxSize !== undefined && file.size > props.maxSize) {
    reject('size', file);
    return;
  }

  rejection.value = null;
  emit('update:modelValue', file);
};

const browse = (): void => {
  if (!props.disabled) input.value?.click();
};

const onChange = (): void => {
  choose(input.value?.files);

  if (input.value) input.value.value = '';
};

const clear = async (): Promise<void> => {
  rejection.value = null;
  emit('update:modelValue', null);

  await nextTick();
  browseButton.value?.focus();
};

const carriesFiles = (event: DragEvent): boolean =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');

const onDragEnter = (event: DragEvent): void => {
  if (carriesFiles(event)) depth.value += 1;
};

const onDragLeave = (): void => {
  depth.value = Math.max(0, depth.value - 1);
};

const onDragOver = (event: DragEvent): void => {
  event.preventDefault();

  if (event.dataTransfer) event.dataTransfer.dropEffect = props.disabled ? 'none' : 'copy';
};

const onDrop = (event: DragEvent): void => {
  event.preventDefault();
  depth.value = 0;

  if (!props.disabled) choose(event.dataTransfer?.files);
};
</script>

<template>
  <div class="dl-file" :class="{ 'dl-file--disabled': disabled }">
    <span v-if="label" :id="labelId" class="dl-file__label">
      {{ label }}
      <span v-if="required" class="dl-file__required" aria-hidden="true">*</span>
    </span>

    <div
      class="dl-file__zone"
      :class="{
        'dl-file__zone--over': dragging,
        'dl-file__zone--error': !!message,
        'dl-file__zone--filled': !!modelValue,
      }"
      role="group"
      :aria-labelledby="label ? labelId : undefined"
      :aria-describedby="message || hint ? messageId : undefined"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
    >
      <input
        ref="input"
        class="dl-file__input"
        type="file"
        :accept="accept"
        :disabled="disabled"
        tabindex="-1"
        aria-hidden="true"
        @change="onChange"
      />

      <template v-if="modelValue">
        <VIcon icon="mdi-file-document-outline" size="28" class="dl-file__file-icon" />

        <div class="dl-file__file">
          <span class="dl-file__name">{{ modelValue.name }}</span>
          <span class="dl-file__size">{{ formatSize(modelValue.size) }}</span>
        </div>

        <VBtn
          icon="mdi-close"
          :aria-label="t('fileDrop.remove', { name: modelValue.name })"
          :title="t('fileDrop.remove', { name: modelValue.name })"
          :disabled="disabled"
          variant="text"
          size="small"
          density="comfortable"
          @click="clear"
        />
      </template>

      <template v-else>
        <VIcon :icon="icon" size="32" class="dl-file__icon" />

        <p class="dl-file__prompt">
          <template v-if="dragging">{{ t('fileDrop.dropNow') }}</template>
          <template v-else>
            {{ prompt[0] }}<button
              ref="browseButton"
              type="button"
              class="dl-file__browse"
              :disabled="disabled"
              @click="browse"
            >{{ t('fileDrop.browse') }}</button>{{ prompt[1] }}
          </template>
        </p>

        <p v-if="constraints" class="dl-file__constraints">{{ constraints }}</p>
      </template>
    </div>

    <p v-if="message" :id="messageId" class="dl-file__message dl-file__message--error" role="alert">
      {{ message }}
    </p>
    <p v-else-if="hint" :id="messageId" class="dl-file__message">{{ hint }}</p>

    <span class="dl-file__sr" aria-live="polite">
      {{ modelValue ? t('fileDrop.selected', { name: modelValue.name }) : '' }}
    </span>
  </div>
</template>

<style scoped>
.dl-file {
  display: flex;
  flex-direction: column;
  gap: var(--dl-space-xs, 4px);
  min-width: 0;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
}

.dl-file__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
  line-height: 1.3;
}

.dl-file__required {
  color: var(--dl-error);
  margin-left: 2px;
}

.dl-file__zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 136px;
  padding: 20px 16px;
  text-align: center;
  background: var(--dl-surface);
  border: 1.5px dashed var(--dl-outline);
  border-radius: var(--dl-radius-lg, 16px);
  transition:
    border-color var(--dl-motion-fast, 120ms) var(--dl-easing),
    background var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-file__zone--filled {
  flex-direction: row;
  justify-content: flex-start;
  gap: 12px;
  min-height: 0;
  padding: 12px 12px 12px 16px;
  text-align: start;
  border-style: solid;
}

.dl-file__zone--over {
  border-color: var(--dl-primary);
  background: rgba(var(--v-theme-primary), 0.06);
}

.dl-file__zone--error {
  border-color: var(--dl-error);
}

.dl-file__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.dl-file__icon {
  color: var(--dl-on-surface-muted);
}

.dl-file__zone--over .dl-file__icon {
  color: var(--dl-primary);
}

.dl-file__prompt {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.dl-file__browse {
  padding: 0;
  font: inherit;
  font-weight: 500;
  color: var(--dl-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  background: none;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.dl-file__browse:disabled {
  cursor: default;
}

.dl-file__browse:focus-visible {
  outline: 2px solid var(--dl-primary);
  outline-offset: 2px;
}

.dl-file__constraints {
  margin: 0;
  font-size: 12px;
  color: var(--dl-on-surface-muted);
}

.dl-file__file-icon {
  flex-shrink: 0;
  color: var(--dl-primary);
}

.dl-file__file {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.dl-file__name {
  font-size: 14px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.dl-file__size {
  font-size: 12px;
  color: var(--dl-on-surface-muted);
  font-variant-numeric: tabular-nums;
}

.dl-file__message {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--dl-on-surface-muted);
}

.dl-file__message--error {
  color: var(--dl-error);
}

.dl-file--disabled .dl-file__zone {
  opacity: 0.6;
}

.dl-file__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .dl-file__zone {
    transition: none;
  }
}
</style>
