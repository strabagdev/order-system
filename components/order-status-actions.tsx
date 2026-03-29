"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paymentMethods } from "@/lib/constants";

export function PreparationToggle({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: "PENDING" | "READY";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);

    await fetch(`/api/orders/${orderId}/preparation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preparationStatus: currentStatus === "PENDING" ? "READY" : "PENDING",
      }),
    });

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
    >
      {loading
        ? "Guardando..."
        : currentStatus === "PENDING"
          ? "Marcar listo"
          : "Volver a pendiente"}
    </button>
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

  async function updateStatus(nextStatus: "PENDING" | "PAID") {
    setLoading(true);

    await fetch(`/api/orders/${orderId}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus: nextStatus,
        paymentMethod: nextStatus === "PAID" ? paymentMethod : null,
      }),
    });

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
  );
}
