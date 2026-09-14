<script setup lang="ts">
/**
 * Estado vazio, de erro ou de bloqueio, com a mesma forma em toda tela.
 *
 * **Diz o que aconteceu e o que fazer.** Um "Nada aqui" sozinho deixa a pessoa
 * sem saber se falhou, se não há dado ou se ela não pode ver. O título traz o
 * fato, a descrição traz a saída, e a ação vem no slot.
 *
 * **O tom muda o ícone, não a página.** Tela inteira vermelha lê como alarme, e
 * falta de permissão não é emergência. A cor fica restrita ao selo do ícone.
 */
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    /** Ícone `mdi-*`. */
    icon?: string;
    tone?: 'neutral' | 'info' | 'warning' | 'error' | 'success';
    /** Menos respiro, para dentro de cartão ou de painel. */
    compact?: boolean;
  }>(),
  { icon: 'mdi-tray-remove', tone: 'neutral', compact: false },
);
</script>

<template>
  <section class="dl-empty" :class="[`dl-empty--${tone}`, { 'dl-empty--compact': compact }]">
    <span class="dl-empty__badge" aria-hidden="true">
      <VIcon :icon="icon" :size="compact ? 24 : 30" />
    </span>
    <h2 class="dl-empty__title">{{ title }}</h2>
    <p v-if="description" class="dl-empty__description">{{ description }}</p>
    <div v-if="$slots.default" class="dl-empty__actions">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.dl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
  animation: dl-empty-in var(--dl-motion-slow, 320ms) var(--dl-easing) both;

  /* Cada tom repassa a cor do tema como `r,g,b`, e o selo compõe as camadas. */
  --dl-empty-rgb: var(--v-theme-on-surface-variant);
}

.dl-empty--info { --dl-empty-rgb: var(--v-theme-info); }
.dl-empty--warning { --dl-empty-rgb: var(--v-theme-warning); }
.dl-empty--error { --dl-empty-rgb: var(--v-theme-error); }
.dl-empty--success { --dl-empty-rgb: var(--v-theme-success); }

.dl-empty--compact {
  padding: 28px 16px;
}

.dl-empty__badge {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: rgb(var(--dl-empty-rgb));
  background: rgba(var(--dl-empty-rgb), 0.12);
  border: 1px solid rgba(var(--dl-empty-rgb), 0.28);
  margin-bottom: 16px;
}

.dl-empty--compact .dl-empty__badge {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.dl-empty__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.dl-empty--compact .dl-empty__title {
  font-size: 15px;
}

.dl-empty__description {
  margin: 6px 0 0;
  max-width: 48ch;
  font-size: 14px;
  line-height: 1.55;
  color: var(--dl-on-surface-muted);
}

.dl-empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

@keyframes dl-empty-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl-empty {
    animation: none;
  }
}
</style>
