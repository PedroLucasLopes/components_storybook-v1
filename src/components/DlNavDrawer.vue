<script setup lang="ts">
/**
 * Navegação lateral, a mesma nas duas aplicações.
 *
 * ## O menu vem do backend
 *
 * O componente não sabe o que é "equipamento" nem "projeto". Ele recebe grupos
 * e itens e desenha. É isso que permite o KRLoc ter as abas dele e o SSO ter as
 * dele, com o mesmo código: quem responde o manifesto é cada backend.
 *
 * ## O que a pessoa não pode, ela não vê
 *
 * Item com `permission` declarada só aparece se `usePermissions` deixar. Grupo
 * que ficou sem nenhum item some junto, com o título: cabeçalho de seção vazia
 * é pior que seção ausente, porque promete algo que não vem.
 *
 * ## Três formas, um componente
 *
 * No desktop é gaveta fixa; recolhida vira trilho só de ícone, para devolver
 * largura à tabela. No telefone é gaveta temporária, aberta pelo botão de
 * hambúrguer e fechada ao escolher, porque ela cobre o conteúdo e ninguém quer
 * fechar duas vezes.
 */
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { usePermissions } from '../access/usePermissions';

export interface NavItem {
  key: string;
  label: string;
  /** Ícone `mdi-*`. No trilho recolhido é a única coisa visível. */
  icon: string;
  /** Rota do front. Quem navega é a aplicação, pelo evento `navigate`. */
  to: string;
  /** Método e caminho da API que liberam este item. Sem isto, sempre aparece. */
  permission?: { method: string; path: string };
  /** Contador, como número de pendências. */
  badge?: string | number;
}

export interface NavGroup {
  key: string;
  /** Sem título, o grupo vira apenas um bloco separado por linha. */
  title?: string;
  items: NavItem[];
}

const props = withDefaults(
  defineProps<{
    /** Aberta no telefone, recolhível no desktop. Use `v-model:open`. */
    open?: boolean;
    /** Trilho só de ícone. Só vale no desktop. */
    collapsed?: boolean;
    groups: NavGroup[];
    /** `key` do item ativo. */
    active?: string;
    /** Nome da aplicação, no topo. */
    title?: string;
    subtitle?: string;
  }>(),
  { open: false, collapsed: false },
);

const emit = defineEmits<{
  'update:open': [open: boolean];
  'update:collapsed': [collapsed: boolean];
  navigate: [item: NavItem];
}>();

const { can } = usePermissions();
const { mdAndDown } = useDisplay();

/** Grupos e itens que esta pessoa alcança. Grupo vazio não sobra. */
const visibleGroups = computed(() =>
  props.groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || can(item.permission.method, item.permission.path),
      ),
    }))
    .filter((group) => group.items.length > 0),
);

const rail = computed(() => props.collapsed && !mdAndDown.value);

const choose = (item: NavItem): void => {
  emit('navigate', item);

  // No telefone a gaveta cobre o conteúdo: escolher e continuar vendo o menu
  // obrigaria a fechar de novo.
  if (mdAndDown.value) emit('update:open', false);
};
</script>

<template>
  <VNavigationDrawer
    :model-value="mdAndDown ? open : true"
    :rail="rail"
    :temporary="mdAndDown"
    :permanent="!mdAndDown"
    :width="264"
    :rail-width="68"
    color="surface"
    border="end"
    @update:model-value="emit('update:open', $event)"
  >
    <header class="dl-nav__brand" :class="{ 'dl-nav__brand--rail': rail }">
      <VIcon icon="mdi-shield-key-outline" size="22" color="primary" />
      <div v-if="!rail" class="dl-nav__brand-text">
        <strong class="dl-nav__title">{{ title }}</strong>
        <span v-if="subtitle" class="dl-nav__subtitle">{{ subtitle }}</span>
      </div>
    </header>

    <nav class="dl-nav__body" :aria-label="title ?? 'Main navigation'">
      <div v-for="group in visibleGroups" :key="group.key" class="dl-nav__group">
        <p v-if="group.title && !rail" class="dl-nav__group-title">{{ group.title }}</p>

        <VList density="compact" nav class="dl-nav__list">
          <VListItem
            v-for="item in group.items"
            :key="item.key"
            :active="item.key === active"
            :prepend-icon="item.icon"
            :title="rail ? undefined : item.label"
            :aria-label="item.label"
            :aria-current="item.key === active ? 'page' : undefined"
            rounded="md"
            color="primary"
            @click="choose(item)"
          >
            <template v-if="item.badge !== undefined && !rail" #append>
              <span class="dl-nav__badge">{{ item.badge }}</span>
            </template>
          </VListItem>
        </VList>
      </div>

      <p v-if="visibleGroups.length === 0" class="dl-nav__empty">
        Your role does not unlock any area of this application.
      </p>
    </nav>

    <template #append>
      <div class="dl-nav__footer">
        <slot name="footer" />
        <VBtn
          v-if="!mdAndDown"
          :icon="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          :aria-label="collapsed ? 'Expand menu' : 'Collapse menu'"
          :title="collapsed ? 'Expand menu' : 'Collapse menu'"
          variant="text"
          size="small"
          density="comfortable"
          @click="emit('update:collapsed', !collapsed)"
        />
      </div>
    </template>
  </VNavigationDrawer>
</template>

<style scoped>
.dl-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--dl-outline);
  min-height: 64px;
}

.dl-nav__brand--rail {
  justify-content: center;
  padding: 16px 0;
}

.dl-nav__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dl-nav__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dl-on-surface);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dl-nav__subtitle {
  font-size: 11px;
  color: var(--dl-on-surface-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dl-nav__body {
  padding: 8px 0;
}

.dl-nav__group + .dl-nav__group {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--dl-outline);
}

.dl-nav__group-title {
  margin: 10px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dl-on-surface-muted);
}

.dl-nav__list {
  padding: 0 8px;
  background: transparent;
}

.dl-nav__badge {
  background: var(--dl-surface-variant);
  color: var(--dl-on-surface-muted);
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: var(--dl-radius-pill, 999px);
}

.dl-nav__empty {
  margin: 24px 16px;
  font-size: 13px;
  color: var(--dl-on-surface-muted);
  line-height: 1.5;
}

.dl-nav__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--dl-outline);
}
</style>
