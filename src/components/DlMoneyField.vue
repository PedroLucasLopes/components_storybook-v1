<script setup lang="ts">
/**
 * Valor em dinheiro, digitado do jeito da língua da tela.
 *
 * **O separador é da língua, não do teclado.** Em português "1.250,50" é mil
 * duzentos e cinquenta; em inglês é "1,250.50". Um `<input type="number">` só
 * entende ponto decimal, e quem digita vírgula perde o valor sem aviso. Aqui o
 * texto é lido pelas regras de `Intl.NumberFormat` da língua corrente.
 *
 * **Colar "12.50" numa tela em português continua dando doze e cinquenta.** Sem
 * o separador decimal da língua no texto, um ponto ou uma vírgula seguidos de
 * uma ou duas casas no fim são lidos como decimal: é o valor copiado de outro
 * sistema. Com três casas, são milhar.
 *
 * **O símbolo fica fora do texto**, antes ou depois do número conforme a língua
 * ("R$ 12,50", "12,50 €"). Dentro do texto ele atrapalharia a edição.
 *
 * **Formata ao sair do campo, não durante a digitação.** Reescrever o texto a
 * cada tecla move o cursor e engole o que a pessoa escreve.
 *
 * **A moeda é do negócio, não da língua.** A locadora cobra em reais com a tela
 * em inglês, por isso `currency` é obrigatório: nenhum padrão adivinha isso.
 *
 * O valor que sai é número arredondado às casas da moeda, ou `null` com o campo
 * vazio ou com texto que não é valor.
 */
import { computed, ref, useId, watch } from 'vue';
import { useLocale } from 'vuetify';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    modelValue?: number | null;
    /** Código ISO 4217: `BRL`, `USD`, `EUR`. */
    currency: string;
    label?: string;
    /** Texto de apoio, abaixo do campo. Some quando há erro. */
    hint?: string;
    /** Sem valor, o zero no formato da língua: "0,00". */
    placeholder?: string;
    /** Mensagem de erro. Presente significa campo inválido, e vence a conferência daqui. */
    error?: string | null;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    /** Aceita valor negativo, como um ajuste ou um estorno. */
    allowNegative?: boolean;
    /** Reserva a linha da mensagem para o formulário não pular. */
    reserveError?: boolean;
    density?: 'default' | 'comfortable' | 'compact';
  }>(),
  {
    modelValue: null,
    label: undefined,
    hint: undefined,
    placeholder: undefined,
    error: null,
    allowNegative: false,
    reserveError: true,
    density: 'comfortable',
  },
);

const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>();

const { t } = useDotlogText();
const locale = useLocale();

const id = useId();

const code = computed(() => locale.current.value || 'en');

/** Separadores, símbolo e casas da moeda na língua corrente. */
const shape = computed(() => {
  const money = new Intl.NumberFormat(code.value, { style: 'currency', currency: props.currency });
  const parts = money.formatToParts(1234567.5);
  const part = (type: Intl.NumberFormatPartTypes): string | undefined =>
    parts.find((item) => item.type === type)?.value;
  const symbolAt = parts.findIndex((item) => item.type === 'currency');
  const numberAt = parts.findIndex((item) => item.type === 'integer');

  return {
    decimal: part('decimal') ?? '.',
    group: part('group') ?? ',',
    symbol: part('currency') ?? props.currency,
    symbolFirst: symbolAt !== -1 && symbolAt < numberAt,
    digits: money.resolvedOptions().maximumFractionDigits ?? 2,
  };
});

const plain = computed(
  () =>
    new Intl.NumberFormat(code.value, {
      minimumFractionDigits: shape.value.digits,
      maximumFractionDigits: shape.value.digits,
    }),
);

const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Número, `null` para vazio, ou `undefined` para texto que não é valor. */
const parse = (text: string): number | null | undefined => {
  const { decimal, group, symbol, digits } = shape.value;
  let raw = text.replaceAll(symbol, '').replace(/[\s  ]/g, '');

  if (raw === '') return null;

  const negative = /^[-−]|[-−]$/.test(raw);

  raw = raw.replace(/[-−]/g, '');

  if (negative && !props.allowNegative) return undefined;

  if (raw.includes(decimal)) {
    raw = raw.replaceAll(group, '').replace(decimal, '.');
  } else {
    // Sem o decimal da língua: o outro sinal com uma ou duas casas no fim é
    // decimal colado de outro sistema; em qualquer outra posição, é milhar.
    const other = decimal === ',' ? '.' : ',';
    const pasted = raw.match(new RegExp(`^(\\d+)${escape(other)}(\\d{1,2})$`));

    raw = pasted ? `${pasted[1]}.${pasted[2]}` : raw.replaceAll(other, '').replaceAll(group, '');
  }

  if (!/^\d+(\.\d*)?$|^\.\d+$/.test(raw)) return undefined;

  const factor = 10 ** digits;
  const value = Math.round(Number(raw) * factor) / factor;

  if (!Number.isFinite(value)) return undefined;

  return negative ? -value : value;
};

const display = (value: number | null | undefined): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '' : plain.value.format(value);

const text = ref(display(props.modelValue));
const focused = ref(false);
const touched = ref(false);

// Valor vindo de fora e troca de língua reescrevem o texto, menos durante a
// digitação, quando o valor de fora é o próprio eco do que a pessoa escreve.
watch([() => props.modelValue, plain], ([value]) => {
  if (!focused.value) text.value = display(value);
});

const invalid = computed(() => parse(text.value) === undefined);

const message = computed(() => {
  if (props.error) return props.error;
  if (!touched.value || !invalid.value) return null;

  return t('money.invalid', { example: plain.value.format(1250.5) });
});

const onInput = (value: unknown): void => {
  text.value = typeof value === 'string' ? value : '';

  const parsed = parse(text.value);

  emit('update:modelValue', parsed === undefined ? null : parsed);
};

const onFocus = (isFocused: boolean): void => {
  focused.value = isFocused;

  if (isFocused) return;

  touched.value = true;

  const parsed = parse(text.value);

  if (parsed !== undefined) text.value = display(parsed);
};
</script>

<template>
  <div class="dl-money">
    <label v-if="label" class="dl-money__label" :for="id">
      {{ label }}
      <span v-if="required" class="dl-money__required" aria-hidden="true">*</span>
    </label>

    <VTextField
      :id="id"
      :model-value="text"
      :prefix="shape.symbolFirst ? shape.symbol : undefined"
      :suffix="shape.symbolFirst ? undefined : shape.symbol"
      :placeholder="placeholder ?? plain.format(0)"
      :disabled="disabled"
      :readonly="readonly"
      :error="!!message"
      :error-messages="message ?? undefined"
      :hint="message ? undefined : hint"
      :persistent-hint="!!hint"
      :density="density"
      :hide-details="reserveError ? false : 'auto'"
      :aria-required="required || undefined"
      :aria-invalid="!!message || undefined"
      class="dl-money__input"
      variant="outlined"
      inputmode="decimal"
      autocomplete="off"
      @update:model-value="onInput"
      @update:focused="onFocus"
    />
  </div>
</template>

<style scoped>
.dl-money {
  display: flex;
  flex-direction: column;
  gap: var(--dl-space-xs, 4px);
  min-width: 0;
}

.dl-money__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
  line-height: 1.3;
}

.dl-money__required {
  color: var(--dl-error);
  margin-left: 2px;
}

/* Algarismos de largura fixa: valores um abaixo do outro alinham pela casa. */
.dl-money__input :deep(input) {
  font-variant-numeric: tabular-nums;
}
</style>
