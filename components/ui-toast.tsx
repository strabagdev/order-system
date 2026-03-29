"use client";

import { useEffect } from "react";

export type ToastState = {
  type: "success" | "error";
  text: string;
};

export function UiToast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm">
      <div
        className={`rounded-[1.5rem] border px-4 py-3 shadow-[0_18px_40px_rgba(28,25,23,0.18)] ${
          toast.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-rose-200 bg-rose-50 text-rose-900"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
              toast.type === "success"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {toast.type === "success" ? "Éxito" : "Atención"}
            </p>
            <p className="mt-1 text-sm leading-6">{toast.text}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm opacity-70 transition hover:opacity-100"
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
