"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paymentMethodLabels, paymentMethods } from "@/lib/constants";
import { ToastState, UiToast } from "@/components/ui-toast";

async function readActionError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "No fue posible actualizar el pedido.";
  }

  const text = await response.text();
  return text || "No fue posible actualizar el pedido.";
}

export function PreparationActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: "PENDING" | "READY";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"READY" | "CANCEL" | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function confirmReady() {
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/preparation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preparationStatus: currentStatus === "PENDING" ? "READY" : "PENDING",
        }),
      });

      if (!response.ok) {
        throw new Error(await readActionError(response));
      }

      setToast({
        type: "success",
        text:
          currentStatus === "PENDING"
            ? "Pedido marcado como listo."
            : "Pedido devuelto a pendiente.",
      });
      setConfirmAction(null);
      router.refresh();
    } catch (error) {
      setToast({
        type: "error",
        text:
          error instanceof Error ? error.message : "No fue posible actualizar el pedido.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function confirmCancel() {
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await readActionError(response));
      }

      setToast({
        type: "success",
        text: "Pedido cancelado correctamente.",
      });
      setConfirmAction(null);
      router.refresh();
    } catch (error) {
      setToast({
        type: "error",
        text:
          error instanceof Error ? error.message : "No fue posible cancelar el pedido.",
      });
    } finally {
      setLoading(false);
    }
  }

  const isReadyAction = confirmAction === "READY";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setConfirmAction("READY")}
          disabled={loading}
          className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {loading && isReadyAction
            ? "Guardando..."
            : currentStatus === "PENDING"
              ? "Marcar listo"
              : "Volver a pendiente"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmAction("CANCEL")}
          disabled={loading}
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
          {loading && confirmAction === "CANCEL" ? "Cancelando..." : "Cancelar"}
        </button>
      </div>

      {confirmAction ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Confirmación
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  {isReadyAction
                    ? currentStatus === "PENDING"
                      ? "Marcar pedido como listo"
                      : "Volver pedido a pendiente"
                    : "Cancelar pedido"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {isReadyAction
                    ? currentStatus === "PENDING"
                      ? "Confirma si este pedido ya está listo para entregar."
                      : "Confirma si este pedido debe volver a la cola pendiente."
                    : "Esta acción elimina el pedido del flujo actual. Confirma solo si realmente deseas cancelarlo."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
                aria-label="Cerrar confirmación"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={isReadyAction ? confirmReady : confirmCancel}
                disabled={loading}
                className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isReadyAction
                    ? "bg-stone-950 hover:bg-stone-800"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {loading
                  ? isReadyAction
                    ? "Guardando..."
                    : "Cancelando..."
                  : isReadyAction
                    ? "Confirmar"
                    : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <UiToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export function PaymentControls({
  orderId,
  currentStatus,
  currentMethod,
}: {
  orderId: string;
  currentStatus: "PENDING" | "PAID";
  currentMethod: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(currentMethod ?? "CASH");
  const [toast, setToast] = useState<ToastState | null>(null);

  async function updateStatus(nextStatus: "PENDING" | "PAID") {
    setLoading(true);
    setToast(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: nextStatus,
          paymentMethod: nextStatus === "PAID" ? paymentMethod : null,
        }),
      });

      if (!response.ok) {
        throw new Error(await readActionError(response));
      }

      setToast({
        type: "success",
        text:
          nextStatus === "PAID"
            ? "Pago registrado correctamente."
            : "Pago devuelto a pendiente.",
      });
      router.refresh();
    } catch (error) {
      setToast({
        type: "error",
        text:
          error instanceof Error ? error.message : "No fue posible actualizar el pago.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {currentStatus === "PENDING" ? (
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm outline-none"
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        ) : currentMethod ? (
          <div className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700">
            {paymentMethodLabels[currentMethod as keyof typeof paymentMethodLabels]}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => updateStatus(currentStatus === "PENDING" ? "PAID" : "PENDING")}
          disabled={loading}
          className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {loading
            ? "Guardando..."
            : currentStatus === "PENDING"
              ? "Marcar pagado"
              : "Volver a pendiente"}
        </button>
      </div>

      <UiToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
