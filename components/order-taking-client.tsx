"use client";

import { useMemo, useState } from "react";
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
    <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
      <div className="space-y-5">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <section key={category} className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
                {productCategoryLabels[category as keyof typeof productCategoryLabels]}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="rounded-[1.75rem] border border-stone-200 bg-white p-5 text-left shadow-[0_18px_30px_rgba(120,86,45,0.06)] transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl">{product.icon}</span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                      {productCategoryLabels[product.category]}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    Toca para agregar al pedido actual.
                  </p>
                  <p className="mt-4 text-xl font-semibold text-amber-700">
                    {formatCurrency(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="rounded-[2rem] border border-stone-200 bg-stone-950 p-5 text-stone-50 shadow-[0_20px_45px_rgba(42,26,8,0.35)]">
        <h2 className="text-xl font-semibold">Pedido actual</h2>
        <p className="mt-1 text-sm text-stone-300">
          Agrega productos desde el catálogo y confirma la referencia antes de guardar.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-200">Tipo de referencia</span>
            <select
              value={referenceType}
              onChange={(event) =>
                setReferenceType(event.target.value as "TABLE" | "NUMBER")
              }
              className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
            >
              {Object.entries(orderReferenceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-200">
              {referenceType === "TABLE" ? "Mesa" : "Número"}
            </span>
            <input
              value={referenceValue}
              onChange={(event) => setReferenceValue(event.target.value)}
              placeholder={referenceType === "TABLE" ? "Ej: 12" : "Ej: 101"}
              className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
            />
          </label>
        </div>

        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-stone-700 px-4 py-8 text-center text-sm text-stone-400">
              Todavía no hay productos en este pedido.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.5rem] border border-stone-800 bg-stone-900/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-stone-400">
                      {formatCurrency(item.price)} c/u
                    </p>
                  </div>
                  <p className="font-semibold text-amber-300">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-9 w-9 rounded-full border border-stone-700 text-lg"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-9 w-9 rounded-full border border-stone-700 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-amber-400 px-4 py-4 text-stone-950">
          <p className="text-sm font-medium">Total del pedido</p>
          <p className="mt-1 text-3xl font-semibold">{formatCurrency(total)}</p>
        </div>

        {message ? <p className="mt-4 text-sm text-stone-200">{message}</p> : null}

        <button
          type="button"
          onClick={submitOrder}
          disabled={isSubmitting}
          className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar pedido"}
        </button>
      </aside>
    </div>
  );
}
