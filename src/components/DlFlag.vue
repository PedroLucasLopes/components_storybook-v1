<script setup lang="ts">
/**
 * Bandeira de país, desenhada aqui em SVG.
 *
 * **Emoji de bandeira não serve.** O Windows não tem desenho para ele e mostra
 * as duas letras do país no lugar, justamente no sistema de boa parte de quem
 * usa um console de gestão.
 *
 * **País, não língua.** Bandeira é de país. Quem diz qual país representa cada
 * língua é `languageRegion`: `en` vira Estados Unidos, `pt-BR` vira Brasil.
 *
 * **Decorativa.** O nome da língua vai sempre ao lado, então a bandeira fica
 * fora do leitor de tela e nunca é a única pista. País sem desenho aqui aparece
 * como o próprio código, numa etiqueta do mesmo tamanho.
 *
 * Proporção única, 3:2, para uma lista de bandeiras alinhar. As cores são as
 * oficiais, e não tokens: bandeira não muda com o tema.
 */
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** País em ISO 3166-1 alfa-2: `BR`, `US`, `ES`. */
    region?: string | null;
    /** Largura em pixels. A altura é dois terços dela. */
    width?: number;
  }>(),
  { region: null, width: 21 },
);

const code = computed(() => (props.region ?? '').toUpperCase());

/* Estados Unidos: treze listras e cinquenta estrelas, na grade oficial. */
const STRIPE = 20 / 13;
const US_WHITE_STRIPES = [1, 3, 5, 7, 9, 11].map((index) => index * STRIPE);
const US_CANTON_HEIGHT = STRIPE * 7;
const US_STARS = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: row % 2 === 0 ? 6 : 5 }, (__, column) => ({
    x: row % 2 === 0 ? 2 * column + 1 : 2 * column + 2,
    y: (US_CANTON_HEIGHT / 10) * (row + 1),
  })),
).flat();
</script>

<template>
  <span class="dl-flag" :style="{ width: `${width}px`, height: `${(width * 2) / 3}px` }" aria-hidden="true">
    <svg v-if="code === 'BR'" class="dl-flag__svg" viewBox="0 0 30 20">
      <rect width="30" height="20" fill="#009C3B" />
      <path d="M15 2.4 27.4 10 15 17.6 2.6 10Z" fill="#FFDF00" />
      <circle cx="15" cy="10" r="4.9" fill="#002776" />
      <path
        d="M10.13 9.53A12.8 12.8 0 0 1 19.77 11.14A4.9 4.9 0 0 1 19.51 11.92A12 12 0 0 0 10.12 10.35A4.9 4.9 0 0 1 10.13 9.53Z"
        fill="#FFFFFF"
      />
    </svg>

    <svg v-else-if="code === 'US'" class="dl-flag__svg" viewBox="0 0 30 20">
      <rect width="30" height="20" fill="#B22234" />
      <rect v-for="y in US_WHITE_STRIPES" :key="y" :y="y" width="30" :height="STRIPE" fill="#FFFFFF" />
      <rect width="12" :height="US_CANTON_HEIGHT" fill="#3C3B6E" />
      <circle v-for="(star, index) in US_STARS" :key="index" :cx="star.x" :cy="star.y" r="0.42" fill="#FFFFFF" />
    </svg>

    <svg v-else-if="code === 'ES'" class="dl-flag__svg" viewBox="0 0 30 20">
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </svg>

    <span v-else class="dl-flag__code">{{ code || '?' }}</span>
  </span>
</template>

<style scoped>
.dl-flag {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 2px;
  vertical-align: middle;
}

/* Contorno por cima do desenho: separa o branco da bandeira do branco da
   superfície, e inverte com o tema. */
.dl-flag::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-on-surface), 0.16);
  pointer-events: none;
}

.dl-flag__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.dl-flag__code {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--dl-on-surface-muted);
  background: var(--dl-surface-variant);
}
</style>
