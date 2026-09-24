<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { splitAround, useDotlogText } from '../i18n/useDotlogText';
import DlButton from './DlButton.vue';
import DlSkeleton from './DlSkeleton.vue';

export interface SignInProvider {
  id: string;
  label: string;
  icon?: string;
}

export interface SignInError {
  title: string;
  description?: string;
}

withDefaults(
  defineProps<{
    state: 'loading' | 'ready' | 'blocked';
    application?: string | null;
    providers?: SignInProvider[];
    error?: SignInError | null;
    pendingProvider?: string | null;
    brand?: string;
    logo?: string;
    heading?: string | null;
    description?: string | null;
  }>(),
  {
    application: null,
    providers: () => [],
    error: null,
    pendingProvider: null,
    brand: 'SSO',
    logo: 'mdi-shield-key-outline',
    heading: null,
    description: null,
  },
);

const slots = useSlots();

const hasForm = computed(() => !!slots.default);

const emit = defineEmits<{ select: [provider: SignInProvider] }>();

const { t } = useDotlogText();

const continueTo = computed(() => splitAround((marker) => t('signIn.continueTo', { application: marker })));
</script>

<template>
  <main class="dl-signin">
    <section class="dl-signin__card" aria-labelledby="dl-signin-title" :aria-busy="state === 'loading'">
      <header class="dl-signin__brand">
        <span class="dl-signin__logo" aria-hidden="true">
          <VIcon :icon="logo" size="24" />
        </span>
        <span class="dl-signin__brand-name">{{ brand }}</span>
      </header>

      <div v-if="state === 'loading'" class="dl-signin__loading">
        <h1 id="dl-signin-title" class="dl-signin__sr">{{ t('signIn.loading') }}</h1>
        <DlSkeleton height="26px" width="46%" />
        <DlSkeleton height="14px" width="72%" />
        <DlSkeleton height="46px" variant="block" />
      </div>

      <div v-else-if="state === 'blocked'" class="dl-signin__blocked">
        <span class="dl-signin__blocked-icon" aria-hidden="true">
          <VIcon icon="mdi-link-variant-off" size="26" />
        </span>
        <h1 id="dl-signin-title" class="dl-signin__title">{{ t('signIn.blockedTitle') }}</h1>
        <p class="dl-signin__text">{{ t('signIn.blockedText') }}</p>

        <div v-if="error" class="dl-signin__error" role="alert">
          <VIcon icon="mdi-alert-circle-outline" size="18" class="dl-signin__error-icon" />
          <div>
            <strong class="dl-signin__error-title">{{ error.title }}</strong>
            <p v-if="error.description" class="dl-signin__error-text">{{ error.description }}</p>
          </div>
        </div>
      </div>

      <div v-else class="dl-signin__ready">
        <h1 id="dl-signin-title" class="dl-signin__title">{{ heading ?? t('signIn.title') }}</h1>
        <p class="dl-signin__text">
          <template v-if="description">{{ description }}</template>
          <template v-else-if="application">
            {{ continueTo[0] }}<strong class="dl-signin__app">{{ application }}</strong>{{ continueTo[1] }}
          </template>
          <template v-else>{{ t('signIn.continue') }}</template>
        </p>

        <div v-if="error" class="dl-signin__error" role="alert">
          <VIcon icon="mdi-alert-circle-outline" size="18" class="dl-signin__error-icon" />
          <div>
            <strong class="dl-signin__error-title">{{ error.title }}</strong>
            <p v-if="error.description" class="dl-signin__error-text">{{ error.description }}</p>
          </div>
        </div>

        <div v-if="hasForm" class="dl-signin__form">
          <slot />
        </div>

        <div v-if="hasForm && providers.length > 0" class="dl-signin__divider">
          <span>{{ t('signIn.or') }}</span>
        </div>

        <div v-if="providers.length > 0" class="dl-signin__providers">
          <DlButton
            v-for="provider in providers"
            :key="provider.id"
            block
            size="large"
            variant="outlined"
            color="on-surface"
            :icon="provider.icon"
            :loading="pendingProvider === provider.id"
            :disabled="!!pendingProvider && pendingProvider !== provider.id"
            class="dl-signin__provider"
            @click="emit('select', provider)"
          >
            {{ t('signIn.continueWith', { provider: provider.label }) }}
          </DlButton>
        </div>
      </div>

      <footer class="dl-signin__foot">
        <slot name="footer">{{ t('signIn.footer') }}</slot>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.dl-signin {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
  background:
    radial-gradient(56rem 36rem at 12% -12%, rgba(var(--v-theme-primary), 0.1), transparent 62%),
    radial-gradient(44rem 30rem at 108% 112%, rgba(var(--v-theme-info), 0.08), transparent 60%),
    var(--dl-background);
}

.dl-signin__card {
  width: 100%;
  max-width: 400px;
  padding: 32px 28px 24px;
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-lg, 16px);
  animation: dl-signin-in var(--dl-motion-slow, 320ms) var(--dl-easing) both;
}

.dl-signin__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.dl-signin__logo {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--dl-radius-md, 10px);
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}

.dl-signin__brand-name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.dl-signin__loading,
.dl-signin__ready,
.dl-signin__blocked {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dl-signin__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
}

.dl-signin__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--dl-on-surface-muted);
}

.dl-signin__app {
  color: var(--dl-on-surface);
  font-weight: 600;
}

.dl-signin__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.dl-signin__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 12px;
  color: var(--dl-on-surface-muted);
}

.dl-signin__divider::before,
.dl-signin__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--dl-outline);
}

.dl-signin__providers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.dl-signin__provider :deep(.v-btn__content) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.dl-signin__blocked-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.12);
  border: 1px solid rgba(var(--v-theme-warning), 0.3);
  margin-bottom: 4px;
}

.dl-signin__error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--dl-radius-sm, 6px);
  color: var(--dl-on-surface);
  background: rgba(var(--v-theme-error), 0.1);
  border: 1px solid rgba(var(--v-theme-error), 0.4);
  animation: dl-signin-in var(--dl-motion-normal, 200ms) var(--dl-easing) both;
}

.dl-signin__error-icon {
  color: rgb(var(--v-theme-error));
  flex-shrink: 0;
  margin-top: 1px;
}

.dl-signin__error-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.dl-signin__error-text {
  margin: 2px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
}

.dl-signin__foot {
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--dl-outline);
  font-size: 12px;
  line-height: 1.55;
  color: var(--dl-on-surface-muted);
}

.dl-signin__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@keyframes dl-signin-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
  }
}

@media (max-width: 480px) {
  .dl-signin__card {
    padding: 24px 20px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl-signin__card,
  .dl-signin__error {
    animation: none;
  }
}
</style>
