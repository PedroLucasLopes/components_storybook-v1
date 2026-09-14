import { computed, readonly, ref } from 'vue';

/**
 * Avisos efêmeros: confirmação do que deu certo, alerta do que precisa de
 * atenção, erro do que falhou.
 *
 * ## Erro não some sozinho
 *
 * Sucesso pode desaparecer: a pessoa acabou de agir e já viu o resultado na
 * tela. Erro, não. Um aviso de falha que sai antes de ser lido é pior que
 * nenhum, porque a pessoa fica com a sensação de que algo passou e não sabe o
 * quê. Por isso `error` fica até ser fechado, e os demais têm prazo.
 *
 * ## O relógio para quando alguém está lendo
 *
 * Passar o mouse ou dar foco no aviso pausa a contagem. Sem isso, o texto some
 * no meio da leitura de quem lê devagar, e quem usa teclado nunca alcança o
 * botão de ação a tempo.
 *
 * ## A pilha tem teto
 *
 * Uma rajada de falhas, que é o que acontece quando a rede cai no meio de um
 * lote, cobriria a tela inteira. Acima do teto os mais antigos saem, e o mais
 * recente sempre aparece.
 *
 * ## Não depende de Pinia
 *
 * O estado vive num módulo, como o tema. A biblioteca não impõe store à
 * aplicação que a consome; quem quiser embrulhar isto num store da aplicação
 * pode, mas não precisa.
 */

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  /** Detalhe opcional. Para erro, é onde mora o que a pessoa pode fazer. */
  description?: string;
  /** Milissegundos até sumir. `null` significa "fica até fechar". */
  duration: number | null;
  /** Um botão só. Dois competem, e o segundo nunca é clicado. */
  action?: ToastAction;
  createdAt: number;
}

export interface ToastOptions {
  description?: string;
  /** Sobrescreve o prazo padrão do tipo. `null` deixa fixo. */
  duration?: number | null;
  action?: ToastAction;
}

/** Prazos por tipo. Erro não tem: ver a nota no topo. */
const DEFAULT_DURATION: Record<ToastKind, number | null> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: null,
};

/** Acima disso os mais antigos saem. Ver a nota sobre rajada. */
const MAX_VISIBLE = 4;

const items = ref<Toast[]>([]);
const timers = new Map<number, ReturnType<typeof setTimeout>>();

let nextId = 1;

const clearTimer = (id: number): void => {
  const timer = timers.get(id);

  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
};

const dismiss = (id: number): void => {
  clearTimer(id);
  items.value = items.value.filter((toast) => toast.id !== id);
};

const startTimer = (toast: Toast): void => {
  if (toast.duration === null) return;

  clearTimer(toast.id);
  timers.set(
    toast.id,
    setTimeout(() => dismiss(toast.id), toast.duration),
  );
};

const push = (kind: ToastKind, title: string, options: ToastOptions = {}): number => {
  const toast: Toast = {
    id: nextId++,
    kind,
    title,
    description: options.description,
    duration: options.duration === undefined ? DEFAULT_DURATION[kind] : options.duration,
    action: options.action,
    createdAt: Date.now(),
  };

  items.value = [...items.value, toast];

  // Estoura o teto: derruba os mais antigos, nunca o que acabou de chegar.
  while (items.value.length > MAX_VISIBLE) {
    dismiss(items.value[0].id);
  }

  startTimer(toast);

  return toast.id;
};

/**
 * API de notificação. Pode ser chamada de qualquer lugar, inclusive de fora de
 * um componente: interceptor de HTTP, tratador de erro global, store.
 */
export const toast = {
  success: (title: string, options?: ToastOptions) => push('success', title, options),
  info: (title: string, options?: ToastOptions) => push('info', title, options),
  warning: (title: string, options?: ToastOptions) => push('warning', title, options),
  error: (title: string, options?: ToastOptions) => push('error', title, options),

  dismiss,
  dismissAll: (): void => {
    for (const item of items.value) clearTimer(item.id);
    items.value = [];
  },
};

/** Consumido pelo `DlToastHost`. A aplicação normalmente usa só `toast`. */
export function useToasts() {
  return {
    toasts: readonly(computed(() => items.value)),
    dismiss,
    /** Chamado ao entrar com o mouse ou o foco. */
    pause: (id: number) => clearTimer(id),
    /** Chamado ao sair. Reinicia o prazo inteiro, não o que sobrava. */
    resume: (id: number) => {
      const found = items.value.find((item) => item.id === id);

      if (found) startTimer(found);
    },
  };
}
