"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type Variant = "success" | "error" | "info";
interface Toast {
  id: string;
  variant: Variant;
  message: string;
}

interface ToastContextValue {
  show: (message: string, variant?: Variant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<Variant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const STYLES: Record<Variant, string> = {
  success: "bg-green-950/90 border-green-700/60 text-green-100",
  error: "bg-red-950/90 border-red-700/60 text-red-100",
  info: "bg-gray-900/90 border-gray-700/60 text-gray-100",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, variant: Variant = "info") => {
    const id = `t-${++counter.current}`;
    setToasts((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5_000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ show }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]"
        aria-live="polite"
        aria-atomic="true"
        data-testid="toast-region"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <div
              key={t.id}
              data-testid={`toast-${t.variant}`}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur transition ${STYLES[t.variant]}`}
              role={t.variant === "error" ? "alert" : "status"}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1 text-sm leading-relaxed">{t.message}</div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-current/70 hover:text-current shrink-0"
                aria-label="Schlie\u00dfen"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}

/**
 * Tiny helper for mutation-fn use sites. Wraps any async action; toasts on result.
 */
export async function withToast<T>(
  toast: ToastContextValue,
  promise: Promise<T>,
  opts: { success?: string; error?: string },
): Promise<T | null> {
  try {
    const result = await promise;
    if (opts.success) toast.show(opts.success, "success");
    return result;
  } catch (err) {
    const msg = opts.error ?? (err instanceof Error ? err.message : "Unbekannter Fehler");
    toast.show(msg, "error");
    return null;
  }
}
