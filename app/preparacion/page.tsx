import { AppShell } from "@/components/app-shell";
import { DashboardMetric } from "@/components/dashboard-metric";
import { PreparationActions } from "@/components/order-status-actions";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import {
  formatOrderReference,
  preparationStatusLabels,
} from "@/lib/constants";
import { formatCurrency, formatTime } from "@/lib/format";
import { getPreparationOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PreparacionPage() {
  const orders = await getPreparationOrders();
  const pendingOrders = orders.filter((order) => order.preparationStatus === "PENDING");
  const readyOrders = orders.filter((order) => order.preparationStatus === "READY");
  const pendingItems = pendingOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return (
    <AppShell
      title="Cola de preparación"
      description="Vista pensada para cocina o despacho, separando lo pendiente de lo ya resuelto."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <DashboardMetric
            label="Pendientes"
            value={String(pendingOrders.length)}
            detail="Pedidos que todavía están en cocina."
          />
          <DashboardMetric
            label="Listos"
            value={String(readyOrders.length)}
            detail="Pedidos ya marcados como listos."
          />
          <DashboardMetric
            label="Items por preparar"
            value={String(pendingItems)}
            detail="Suma de unidades pendientes en cola."
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Pendientes de preparación"
            description="Aquí debería vivir la atención principal del turno."
          >
            <div className="grid gap-4">
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-stone-600">No hay pedidos pendientes ahora.</p>
              ) : (
                pendingOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-stone-900">
                            {formatOrderReference({
                              referenceType: order.referenceType,
                              referenceValue: order.referenceValue,
                            })}
                          </p>
                          <StatusBadge tone="warning">
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
                        <PreparationActions
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

          <SectionCard
            title="Ya listos"
            description="Historial corto del turno para seguimiento de entrega."
          >
            <div className="grid gap-4">
              {readyOrders.length === 0 ? (
                <p className="text-sm text-stone-600">Todavía no hay pedidos listos.</p>
              ) : (
                readyOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-stone-900">
                            {formatOrderReference({
                              referenceType: order.referenceType,
                              referenceValue: order.referenceValue,
                            })}
                          </p>
                          <StatusBadge tone="success">
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
                        <PreparationActions
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
        </div>
      </div>
    </AppShell>
  );
}
