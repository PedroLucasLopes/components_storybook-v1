<script setup lang="ts">
/**
 * Menu de quem entrou: identidade, tema, língua e saída.
 *
 * **O tema tem três escolhas, não um interruptor.** "Seguir o sistema" é uma
 * preferência própria, e é a padrão. Um interruptor claro/escuro obrigaria a
 * pessoa a abrir mão dela para mudar uma vez. Ver `useThemePreferences`.
 *
 * **As línguas são as que a aplicação registrou.** A lista sai de
 * `useLanguages`: cada JSON de tradução da aplicação vira uma opção, com o nome
 * na própria língua e a bandeira do país. Com uma língua só a seção nem
 * aparece, porque uma opção não é escolha.
 *
 * **Sair fica por último, separado e em vermelho.** É a única ação do menu que
 * tira a pessoa do que ela estava fazendo, e não pode ser clicada por engano
 * no lugar de trocar o tema.
 *
 * **Iniciais no lugar de foto.** O SSO não guarda foto, e buscar a do provedor
 * a cada tela avisaria o Google de cada uso do console.
 */
import { computed, useId } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';
import { useLanguages } from '../i18n/useLanguages';
import type { ThemeMode } from '../theme/useTheme';
import DlButton from './DlButton.vue';
import DlFlag from './DlFlag.vue';

const props = withDefaults(
  defineProps<{
    name: string;
    email: string;
    /** Papel na aplicação, mostrado sob o nome. */
    role?: string;
    themeMode: ThemeMode;
    signingOut?: boolean;
    /** Só o avatar no gatilho, para barra estreita. */
    compact?: boolean;
  }>(),
  { signingOut: false, compact: false },
);

/** Menu aberto. Com `v-model:open`, quem usa abre e fecha por fora. */
const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  'update:themeMode': [mode: ThemeMode];
  /** Depois da troca, para quem quiser guardar a escolha também em outro lugar. */
  'update:locale': [code: string];
  signOut: [];
}>();

const { t } = useDotlogText();
const { locale, languages, setLocale } = useLanguages();

const themeOptions = computed<{ value: ThemeMode; label: string; icon: string }[]>(() => [
  { value: 'light', label: t('userMenu.themeLight'), icon: 'mdi-white-balance-sunny' },
  { value: 'dark', label: t('userMenu.themeDark'), icon: 'mdi-weather-night' },
  { value: 'system', label: t('userMenu.themeSystem'), icon: 'mdi-monitor' },
]);

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';

  return `${first}${last}`.toUpperCase() || '?';
});

const themeLabelId = useId();
const languageLabelId = useId();

const chooseTheme = (value: unknown): void => {
  if (value === 'light' || value === 'dark' || value === 'system') {
    emit('update:themeMode', value);
  }
};

const chooseLanguage = (code: string): void => {
  if (code === locale.value) return;

  setLocale(code);
  emit('update:locale', code);
};
</script>

<template>
  <VMenu v-model="open" location="bottom end" :offset="8" :close-on-content-click="false">
    <template #activator="{ props: activator }">
      <button
        type="button"
        class="dl-user__trigger"
        :class="{ 'dl-user__trigger--compact': compact }"
        v-bind="activator"
        :aria-label="t('userMenu.accountMenu', { name })"
      >
        <span class="dl-user__avatar" aria-hidden="true">{{ initials }}</span>
        <span v-if="!compact" class="dl-user__trigger-text">
          <span class="dl-user__trigger-name">{{ name }}</span>
          <span v-if="role" class="dl-user__trigger-role">{{ role }}</span>
        </span>
        <VIcon v-if="!compact" icon="mdi-chevron-down" size="18" class="dl-user__chevron" />
      </button>
    </template>

    <VCard rounded="lg" class="dl-user__card" :width="296">
      <header class="dl-user__head">
        <span class="dl-user__avatar dl-user__avatar--large" aria-hidden="true">{{ initials }}</span>
        <div class="dl-user__identity">
          <strong class="dl-user__name">{{ name }}</strong>
          <span class="dl-user__email">{{ email }}</span>
          <span v-if="role" class="dl-user__role">{{ role }}</span>
        </div>
      </header>

      <div class="dl-user__section">
        <p :id="themeLabelId" class="dl-user__section-title">{{ t('userMenu.theme') }}</p>
        <VBtnToggle
          :model-value="themeMode"
          :aria-labelledby="themeLabelId"
          mandatory
          divided
          variant="outlined"
          density="comfortable"
          class="dl-user__theme"
          @update:model-value="chooseTheme"
        >
          <VBtn
            v-for="option in themeOptions"
            :key="option.value"
            :value="option.value"
            :prepend-icon="option.icon"
            size="small"
          >
            {{ option.label }}
          </VBtn>
        </VBtnToggle>
      </div>

      <div v-if="languages.length > 1" class="dl-user__section dl-user__section--languages">
        <p :id="languageLabelId" class="dl-user__section-title">{{ t('userMenu.language') }}</p>
        <div role="group" :aria-labelledby="languageLabelId" class="dl-user__languages">
          <button
            v-for="language in languages"
            :key="language.code"
            type="button"
            class="dl-user__language"
            :class="{ 'dl-user__language--active': language.code === locale }"
            :aria-pressed="language.code === locale"
            @click="chooseLanguage(language.code)"
          >
            <DlFlag :region="language.region" />
            <span class="dl-user__language-name" :lang="language.code">{{ language.name }}</span>
            <VIcon
              v-if="language.code === locale"
              icon="mdi-check"
              size="18"
              class="dl-user__language-check"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <footer class="dl-user__foot">
        <DlButton
          block
          variant="text"
          color="error"
          icon="mdi-logout"
          :loading="signingOut"
          @click="emit('signOut')"
        >
          {{ t('userMenu.signOut') }}
        </DlButton>
      </footer>
    </VCard>
  </VMenu>
</template>

<style scoped>
.dl-user__trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 4px;
  border: 1px solid transparent;
  border-radius: var(--dl-radius-pill, 999px);
  background: transparent;
  color: var(--dl-on-surface);
  font: inherit;
  cursor: pointer;
  transition:
    background var(--dl-motion-fast, 120ms) var(--dl-easing),
    border-color var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-user__trigger:hover {
  background: var(--dl-surface-variant);
}

.dl-user__trigger:focus-visible {
  outline: 2px solid var(--dl-primary);
  outline-offset: 2px;
}

.dl-user__trigger--compact {
  padding: 4px;
}

.dl-user__avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.14);
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
  flex-shrink: 0;
}

.dl-user__avatar--large {
  width: 44px;
  height: 44px;
  font-size: 15px;
}

.dl-user__trigger-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  line-height: 1.2;
}

.dl-user__trigger-name {
  font-size: 13px;
  font-weight: 500;
  max-width: 16ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dl-user__trigger-role {
  font-size: 11px;
  color: var(--dl-on-surface-muted);
}

.dl-user__chevron {
  color: var(--dl-on-surface-muted);
}

.dl-user__card {
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
}

.dl-user__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--dl-outline);
}

.dl-user__identity {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dl-user__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--dl-on-surface);
}

.dl-user__email {
  font-size: 12px;
  color: var(--dl-on-surface-muted);
  overflow-wrap: anywhere;
}

.dl-user__role {
  align-self: flex-start;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0 7px;
  border-radius: var(--dl-radius-sm, 6px);
  color: var(--dl-on-surface-muted);
  background: var(--dl-surface-variant);
}

.dl-user__section {
  padding: 14px 16px;
}

.dl-user__section-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
}

.dl-user__theme {
  width: 100%;
}

.dl-user__theme :deep(.v-btn) {
  flex: 1 1 0;
  text-transform: none;
  letter-spacing: 0;
}

/* Sem linha entre tema e língua: são preferências da mesma família. */
.dl-user__section--languages {
  padding-top: 0;
}

.dl-user__languages {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dl-user__language {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: var(--dl-radius-md, 8px);
  background: transparent;
  color: var(--dl-on-surface);
  font: inherit;
  font-size: 13px;
  text-align: start;
  cursor: pointer;
  transition:
    background var(--dl-motion-fast, 120ms) var(--dl-easing),
    border-color var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-user__language:hover {
  background: var(--dl-surface-variant);
}

.dl-user__language:focus-visible {
  outline: 2px solid var(--dl-primary);
  outline-offset: 2px;
}

/* A escolhida não depende só de cor: tem marca de conferido e peso maior. */
.dl-user__language--active {
  font-weight: 600;
  border-color: rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.08);
}

.dl-user__language-name {
  flex: 1 1 auto;
  min-width: 0;
}

.dl-user__language-check {
  color: rgb(var(--v-theme-primary));
}

.dl-user__foot {
  padding: 8px;
  border-top: 1px solid var(--dl-outline);
}

@media (prefers-reduced-motion: reduce) {
  .dl-user__trigger,
  .dl-user__language {
    transition: none;
  }
}
</style>
