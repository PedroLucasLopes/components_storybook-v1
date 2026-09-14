<script setup lang="ts">
/**
 * Casca das aplicações: menu lateral, barra superior e área de conteúdo.
 *
 * **O conteúdo tem largura máxima.** Tabela esticada num monitor de 2560px
 * afasta o nome do registro das ações dele por um palmo. Acima de `maxWidth`
 * sobra margem, não linha comprida.
 *
 * **Pular para o conteúdo vem antes do menu.** Quem navega por teclado não
 * deveria atravessar todos os itens do menu a cada troca de tela. O link só
 * aparece ao receber foco.
 *
 * **A barra de carregamento é da casca**, não de cada tela. Troca de rota é
 * assunto da aplicação inteira, e uma barra por tela piscaria em lugares
 * diferentes a cada navegação.
 *
 * **O hambúrguer mora na barra superior.** No telefone o menu está fechado, e o
 * botão que o abre precisa estar sempre à vista, qualquer que seja a tela. Quem
 * usa esta casca passa `with-menu="false"` ao `DlPageHeader`.
 */
import { useDisplay } from 'vuetify';
import DlLoader from './DlLoader.vue';
import DlNavDrawer, { type NavGroup, type NavItem } from './DlNavDrawer.vue';

withDefaults(
  defineProps<{
    groups: NavGroup[];
    /** `key` do item ativo no menu. */
    active?: string;
    /** Nome da aplicação. */
    title: string;
    subtitle?: string;
    /** Menu aberto no telefone. Use `v-model:open`. */
    open?: boolean;
    /** Trilho só de ícone no desktop. Use `v-model:collapsed`. */
    collapsed?: boolean;
    /** Liga a barra de carregamento do topo. */
    loading?: boolean;
    /** Largura máxima do conteúdo. */
    maxWidth?: number | string;
  }>(),
  { open: false, collapsed: false, loading: false, maxWidth: 1280 },
);

const emit = defineEmits<{
  'update:open': [open: boolean];
  'update:collapsed': [collapsed: boolean];
  navigate: [item: NavItem];
}>();

const { mdAndDown } = useDisplay();

const focusContent = (): void => {
  document.getElementById('dl-shell-content')?.focus();
};
</script>

<template>
  <VLayout class="dl-shell">
    <a href="#dl-shell-content" class="dl-shell__skip" @click.prevent="focusContent">
      Skip to content
    </a>

    <DlLoader :active="loading" variant="bar" message="Loading page" />

    <DlNavDrawer
      :open="open"
      :collapsed="collapsed"
      :groups="groups"
      :active="active"
      :title="title"
      :subtitle="subtitle"
      @update:open="emit('update:open', $event)"
      @update:collapsed="emit('update:collapsed', $event)"
      @navigate="emit('navigate', $event)"
    >
      <template v-if="$slots['nav-footer']" #footer>
        <slot name="nav-footer" />
      </template>
    </DlNavDrawer>

    <VAppBar flat height="60" color="surface" border="b" class="dl-shell__bar">
      <div class="dl-shell__bar-inner">
        <VBtn
          v-if="mdAndDown"
          icon="mdi-menu"
          aria-label="Open menu"
          variant="text"
          density="comfortable"
          @click="emit('update:open', true)"
        />
        <span v-if="mdAndDown" class="dl-shell__bar-title">{{ title }}</span>

        <div class="dl-shell__bar-start">
          <slot name="top-start" />
        </div>

        <div class="dl-shell__bar-end">
          <slot name="top-actions" />
        </div>
      </div>
    </VAppBar>

    <VMain class="dl-shell__main">
      <div
        id="dl-shell-content"
        class="dl-shell__content"
        tabindex="-1"
        :style="{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }"
      >
        <slot />
      </div>
    </VMain>
  </VLayout>
</template>

<style scoped>
.dl-shell {
  min-height: 100%;
  font-family: var(--dl-font);
}

.dl-shell__skip {
  position: absolute;
  left: 12px;
  top: -48px;
  z-index: 3000;
  padding: 8px 14px;
  border-radius: var(--dl-radius-sm, 6px);
  background: var(--dl-primary);
  color: var(--dl-on-primary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: top var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-shell__skip:focus {
  top: 12px;
}

.dl-shell__bar-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 16px;
}

.dl-shell__bar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--dl-on-surface);
  white-space: nowrap;
}

.dl-shell__bar-start {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
}

.dl-shell__bar-end {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dl-shell__main {
  background: var(--dl-background);
}

.dl-shell__content {
  margin: 0 auto;
  padding: 24px;
  outline: none;
}

@media (max-width: 599px) {
  .dl-shell__content {
    padding: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl-shell__skip {
    transition: none;
  }
}
</style>
