import { AppShell } from "@/components/app-shell";
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

  return (
    <AppShell
      title="Cola de pago"
      description="Gestiona el cobro sin depender del estado de preparación del pedido."
    >
      <SectionCard
        title="Pedidos para caja"
        description="Puedes marcar pagado o pendiente y registrar la forma de pago."
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
                            order.preparationStatus === "READY" ? "success" : "warning"
                          }
                        >
                          {preparationStatusLabels[order.preparationStatus]}
                        </StatusBadge>
                        <StatusBadge
                          tone={order.paymentStatus === "PAID" ? "success" : "warning"}
                        >
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
    </AppShell>
  );
}
