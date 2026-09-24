import { computed, readonly, ref } from 'vue';

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
  duration: number | null;
  action?: ToastAction;
  createdAt: number;
}

export interface ToastOptions {
  description?: string;
  duration?: number | null;
  action?: ToastAction;
}

const DEFAULT_DURATION: Record<ToastKind, number | null> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: null,
};

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

  while (items.value.length > MAX_VISIBLE) {
    dismiss(items.value[0].id);
  }

  startTimer(toast);

  return toast.id;
};

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

export function useToasts() {
  return {
    toasts: readonly(computed(() => items.value)),
    dismiss,
    pause: (id: number) => clearTimer(id),
    resume: (id: number) => {
      const found = items.value.find((item) => item.id === id);

      if (found) startTimer(found);
    },
  };
}
