"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { productCategoryLabels, orderReferenceLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  price: number;
  category: keyof typeof productCategoryLabels;
  icon: string;
};

type CartItem = Product & {
  quantity: number;
};

export function OrderTakingClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [referenceType, setReferenceType] = useState<"TABLE" | "NUMBER">("TABLE");
  const [referenceValue, setReferenceValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const groupedProducts = useMemo(() => {
    return products.reduce<Record<string, Product[]>>((acc, product) => {
      acc[product.category] = [...(acc[product.category] ?? []), product];
      return acc;
    }, {});
  }, [products]);

  const items = Object.values(cart);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function scrollProducts(direction: "left" | "right") {
    const container = productsScrollRef.current;

    if (!container) {
      return;
    }

    const amount = Math.max(container.clientWidth * 0.75, 220);

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current[product.id];

      return {
        ...current,
        [product.id]: {
          ...product,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  }

  function updateQuantity(productId: string, nextQuantity: number) {
    setCart((current) => {
      if (nextQuantity <= 0) {
        const rest = { ...current };
        delete rest[productId];
        return rest;
      }

      const item = current[productId];
      if (!item) {
        return current;
      }

      return {
        ...current,
        [productId]: {
          ...item,
          quantity: nextQuantity,
        },
      };
    });
  }

  async function submitOrder() {
    if (!referenceValue.trim() || items.length === 0) {
      setMessage("Completa la referencia y agrega al menos un producto.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceType,
          referenceValue,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "No fue posible guardar el pedido.");
      }

      setCart({});
      setReferenceValue("");
      setMessage("Pedido guardado correctamente.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <aside className="sticky top-4 z-20 rounded-[2rem] border border-stone-200 bg-stone-950 p-5 text-stone-50 shadow-[0_20px_45px_rgba(42,26,8,0.35)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
          <div className="min-w-0">
            {items.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-stone-700 px-4 py-5 text-center text-sm text-stone-400">
                Todavía no hay productos en este pedido.
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollProducts("left")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-sm text-stone-100 transition hover:border-stone-500 hover:bg-stone-800"
                  aria-label="Desplazar productos a la izquierda"
                >
                  ←
                </button>

                <div
                  ref={productsScrollRef}
                  className="min-w-0 flex-1 overflow-x-auto pb-2 order-system-scrollbar-hidden"
                  style={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}
                >
                  <div className="flex min-w-max gap-2.5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2.5 rounded-[1.35rem] border border-stone-800 bg-stone-900/80 px-3 py-2.5"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-stone-100">
                            {item.quantity} x
                          </p>
                          <p className="text-xs text-stone-400">{item.name}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-700 text-xs"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-700 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => scrollProducts("right")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-sm text-stone-100 transition hover:border-stone-500 hover:bg-stone-800"
                  aria-label="Desplazar productos a la derecha"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-2 xl:justify-self-end">
            <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-amber-400 px-4 py-3 text-stone-950">
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Total</p>
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
              </div>
              <button
                type="button"
                onClick={submitOrder}
                disabled={isSubmitting}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "..." : "Pedir"}
              </button>
            </div>

            {message ? (
              <p className="text-sm text-stone-200 xl:text-right">{message}</p>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="space-y-5">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <section key={category} className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
                {productCategoryLabels[category as keyof typeof productCategoryLabels]}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="rounded-[1.5rem] border border-stone-200 bg-white p-4 text-left shadow-[0_16px_24px_rgba(120,86,45,0.06)] transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl">{product.icon}</span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                      {productCategoryLabels[product.category]}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-stone-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Toca para agregar.
                  </p>
                  <p className="mt-3 text-lg font-semibold text-amber-700">
                    {formatCurrency(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-[0_16px_24px_rgba(120,86,45,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                Referencia opcional
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Úsala si necesitas asociar el pedido a una mesa o a un número.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,220px)]">
              <label className="space-y-0">
                <select
                  value={referenceType}
                  onChange={(event) =>
                    setReferenceType(event.target.value as "TABLE" | "NUMBER")
                  }
                  aria-label="Tipo de referencia"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                >
                  {Object.entries(orderReferenceLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-0">
                <input
                  value={referenceValue}
                  onChange={(event) => setReferenceValue(event.target.value)}
                  placeholder={referenceType === "TABLE" ? "Ej: 12" : "Ej: 101"}
                  aria-label={referenceType === "TABLE" ? "Mesa" : "Número"}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
