import { AppShell } from "@/components/app-shell";
import { DashboardMetric } from "@/components/dashboard-metric";
import { PaymentControls } from "@/components/order-status-actions";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import {
  orderReferenceLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  preparationStatusLabels,
} from "@/lib/constants";
import { formatCurrency, formatTime } from "@/lib/format";
import { getPaymentOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PagoPage() {
  const orders = await getPaymentOrders();
  const pendingOrders = orders.filter((order) => order.paymentStatus === "PENDING");
  const paidOrders = orders.filter((order) => order.paymentStatus === "PAID");
  const pendingTotal = pendingOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <AppShell
      title="Cola de pago"
      description="Pantalla de caja para cobrar pedidos, cambiar estados y registrar el medio de pago."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <DashboardMetric
            label="Pendientes de pago"
            value={String(pendingOrders.length)}
            detail="Pedidos que siguen abiertos en caja."
          />
          <DashboardMetric
            label="Pagados"
            value={String(paidOrders.length)}
            detail="Pedidos ya cerrados en el turno."
          />
          <DashboardMetric
            label="Monto por cobrar"
            value={formatCurrency(pendingTotal)}
            detail="Total aún pendiente de pago."
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Pendientes de pago"
            description="Prioridad principal de caja."
          >
            <div className="grid gap-4">
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-stone-600">No hay pedidos pendientes de pago.</p>
              ) : (
                pendingOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-stone-900">
                            {orderReferenceLabels[order.referenceType]} {order.referenceValue}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatTime(order.createdAt)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge
                              tone={
                                order.preparationStatus === "READY"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {preparationStatusLabels[order.preparationStatus]}
                            </StatusBadge>
                            <StatusBadge tone="warning">
                              {paymentStatusLabels[order.paymentStatus]}
                            </StatusBadge>
                          </div>
                        </div>
                        <p className="text-lg font-semibold text-amber-700">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-sm text-stone-700">
                          {order.items
                            .map((item) => `${item.quantity} x ${item.productName}`)
                            .join(", ")}
                        </p>
                        <PaymentControls
                          orderId={order.id}
                          currentStatus={order.paymentStatus}
                          currentMethod={order.paymentMethod}
                        />
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Pagados"
            description="Pedidos ya cerrados con método registrado."
          >
            <div className="grid gap-4">
              {paidOrders.length === 0 ? (
                <p className="text-sm text-stone-600">Todavía no hay pagos registrados.</p>
              ) : (
                paidOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-stone-900">
                            {orderReferenceLabels[order.referenceType]} {order.referenceValue}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatTime(order.createdAt)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge
                              tone={
                                order.preparationStatus === "READY"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {preparationStatusLabels[order.preparationStatus]}
                            </StatusBadge>
                            <StatusBadge tone="success">
                              {paymentStatusLabels[order.paymentStatus]}
                            </StatusBadge>
                            {order.paymentMethod ? (
                              <StatusBadge tone="neutral">
                                {paymentMethodLabels[order.paymentMethod]}
                              </StatusBadge>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-lg font-semibold text-amber-700">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-sm text-stone-700">
                          {order.items
                            .map((item) => `${item.quantity} x ${item.productName}`)
                            .join(", ")}
                        </p>
                        <PaymentControls
                          orderId={order.id}
                          currentStatus={order.paymentStatus}
                          currentMethod={order.paymentMethod}
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
