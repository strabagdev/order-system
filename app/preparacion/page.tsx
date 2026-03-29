import { AppShell } from "@/components/app-shell";
import { PreparationToggle } from "@/components/order-status-actions";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import {
  orderReferenceLabels,
  preparationStatusLabels,
} from "@/lib/constants";
import { formatCurrency, formatTime } from "@/lib/format";
import { getPreparationOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PreparacionPage() {
  const orders = await getPreparationOrders();

  return (
    <AppShell
      title="Cola de preparación"
      description="Lista operacional para cocina o despacho, con actualización simple del estado de preparación."
    >
      <SectionCard
        title="Pedidos en cola"
        description="El estado de preparación es independiente del pago."
      >
        <div className="grid gap-4">
          {orders.length === 0 ? (
            <p className="text-sm text-stone-600">No hay pedidos registrados todavía.</p>
          ) : (
            orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-stone-900">
                        {orderReferenceLabels[order.referenceType]} {order.referenceValue}
                      </p>
                      <StatusBadge
                        tone={order.preparationStatus === "READY" ? "success" : "warning"}
                      >
                        {preparationStatusLabels[order.preparationStatus]}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-stone-500">
                      Ingresado a las {formatTime(order.createdAt)}
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-stone-700">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity} x {item.productName}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className="text-lg font-semibold text-amber-700">
                      {formatCurrency(order.total)}
                    </p>
                    <PreparationToggle
                      orderId={order.id}
                      currentStatus={order.preparationStatus}
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>
    </AppShell>
  );
}
