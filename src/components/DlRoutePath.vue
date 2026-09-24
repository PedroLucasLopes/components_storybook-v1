<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    path: string;
    base?: string;
    highlight?: string;
    size?: 'small' | 'default' | 'large';
  }>(),
  { base: '', highlight: '', size: 'default' },
);

interface Part {
  text: string;
  inherited: boolean;
  param: boolean;
  match: boolean;
}

const parts = computed<Part[]>(() => {
  const text = props.path;
  const base = props.base === '/' ? '' : props.base;
  const inheritedLength = base && (text === base || text.startsWith(`${base}/`)) ? base.length : 0;

  const param: boolean[] = Array.from({ length: text.length }, () => false);
  let offset = 0;

  for (const segment of text.split('/')) {
    if (segment.startsWith(':') || segment.includes('*')) {
      for (let index = offset; index < offset + segment.length; index += 1) param[index] = true;
    }

    offset += segment.length + 1;
  }

  const match: boolean[] = Array.from({ length: text.length }, () => false);
  const needle = props.highlight.trim().toLowerCase();

  if (needle) {
    const haystack = text.toLowerCase();
    let from = haystack.indexOf(needle);

    while (from !== -1) {
      for (let index = from; index < from + needle.length; index += 1) match[index] = true;
      from = haystack.indexOf(needle, from + needle.length);
    }
  }

  const result: Part[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const flags = {
      inherited: index < inheritedLength,
      param: param[index] ?? false,
      match: match[index] ?? false,
    };
    const last = result[result.length - 1];

    if (last && last.inherited === flags.inherited && last.param === flags.param && last.match === flags.match) {
      last.text += text.charAt(index);
    } else {
      result.push({ text: text.charAt(index), ...flags });
    }
  }

  return result;
});
</script>

<template>
  <code class="dl-rpath" :class="`dl-rpath--${size}`">
    <span
      v-for="(part, index) in parts"
      :key="index"
      :class="{ 'dl-rpath__inherited': part.inherited, 'dl-rpath__param': part.param }"
    ><mark v-if="part.match" class="dl-rpath__match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></span>
  </code>
</template>

<style scoped>
.dl-rpath {
  font-family: var(--dl-font-mono);
  color: inherit;
  background: none;
  padding: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  letter-spacing: 0.01em;
}

.dl-rpath--small {
  font-size: 12px;
}

.dl-rpath--default {
  font-size: 13px;
}

.dl-rpath--large {
  font-size: 16px;
  font-weight: 500;
}

.dl-rpath__param {
  color: var(--dl-primary);
}

.dl-rpath__inherited,
.dl-rpath__inherited.dl-rpath__param {
  color: var(--dl-on-surface-muted);
}

.dl-rpath__match {
  color: inherit;
  background: rgba(var(--v-theme-warning), 0.22);
  box-shadow: 0 0 0 1px rgba(var(--v-theme-warning), 0.4);
  border-radius: 3px;
}
</style>
