"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatOrderReference,
  productCategoryLabels,
  orderReferenceLabels,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { ToastState, UiToast } from "@/components/ui-toast";

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

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "No fue posible guardar el pedido.";
  }

  const text = await response.text();
  return text || "No fue posible guardar el pedido.";
}

export function OrderTakingClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [referenceType, setReferenceType] = useState<"TABLE" | "NUMBER">("TABLE");
  const [referenceValue, setReferenceValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const groupedProducts = useMemo(() => {
    return products.reduce<Record<string, Product[]>>((acc, product) => {
      acc[product.category] = [...(acc[product.category] ?? []), product];
      return acc;
    }, {});
  }, [products]);

  const items = Object.values(cart);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCartItem = selectedProduct ? cart[selectedProduct.id] ?? null : null;
  const isEditingSelectedProduct = Boolean(selectedCartItem);

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

  function openProductModal(product: Product) {
    const existing = cart[product.id];

    setSelectedProduct(product);
    setSelectedQuantity(existing?.quantity ?? 1);
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

  function closeProductModal() {
    setSelectedProduct(null);
    setSelectedQuantity(1);
  }

  function saveSelectedProduct() {
    if (!selectedProduct) {
      return;
    }

    setCart((current) => ({
      ...current,
      [selectedProduct.id]: {
        ...selectedProduct,
        quantity: selectedQuantity,
      },
    }));

    closeProductModal();
  }

  function removeSelectedProduct() {
    if (!selectedProduct) {
      return;
    }

    updateQuantity(selectedProduct.id, 0);
    closeProductModal();
  }

  function openConfirmModal() {
    if (items.length === 0) {
      setToast({
        type: "error",
        text: "Agrega al menos un producto antes de pedir.",
      });
      return;
    }

    setToast(null);
    setIsConfirmOpen(true);
  }

  async function submitOrder() {
    if (items.length === 0) {
      setToast({
        type: "error",
        text: "Agrega al menos un producto antes de pedir.",
      });
      setIsConfirmOpen(false);
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceType,
          referenceValue: referenceValue.trim(),
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      setCart({});
      setReferenceValue("");
      setReferenceType("TABLE");
      setIsConfirmOpen(false);
      setToast({
        type: "success",
        text: "Pedido guardado correctamente.",
      });
      router.refresh();
    } catch (error) {
      setToast({
        type: "error",
        text: error instanceof Error ? error.message : "Ocurrió un error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-12">
      <aside className="sticky top-4 z-20 rounded-[2rem] border border-stone-200 bg-stone-950 px-6 py-6 text-stone-50 shadow-[0_20px_45px_rgba(42,26,8,0.35)]">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div className="min-w-0">
            {items.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-stone-700 px-5 py-6 text-center text-sm text-stone-400">
                Todavía no hay productos en este pedido.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollProducts("left")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-sm text-stone-100 transition hover:border-stone-500 hover:bg-stone-800"
                  aria-label="Desplazar productos a la izquierda"
                >
                  ←
                </button>

                <div
                  ref={productsScrollRef}
                  className="min-w-0 flex-1 overflow-x-auto py-1 order-system-scrollbar-hidden"
                  style={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}
                >
                  <div className="flex min-w-max gap-3.5">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openProductModal(item)}
                        className="flex min-w-[128px] flex-col items-center rounded-[1.45rem] border border-stone-800 bg-stone-900/80 px-4 py-3.5 text-center transition hover:border-stone-600 hover:bg-stone-800/90"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-stone-100">
                            {item.quantity} x
                          </p>
                          <span className="text-xl">{item.icon}</span>
                        </div>
                        <p className="mt-2 text-xs text-stone-400">{item.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => scrollProducts("right")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-sm text-stone-100 transition hover:border-stone-500 hover:bg-stone-800"
                  aria-label="Desplazar productos a la derecha"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-2 xl:justify-self-end">
            <div className="flex items-center justify-between gap-4 rounded-[1.35rem] bg-amber-400 px-5 py-4 text-stone-950">
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Total</p>
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
              </div>
              <button
                type="button"
                onClick={openConfirmModal}
                disabled={isSubmitting}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "..." : "Pedir"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="space-y-7 pt-4">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <section key={category} className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
                {productCategoryLabels[category as keyof typeof productCategoryLabels]}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
              {categoryProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openProductModal(product)}
                  className="rounded-[1.15rem] border border-stone-200 bg-white p-2.5 text-left shadow-[0_16px_24px_rgba(120,86,45,0.06)] transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 sm:rounded-[1.6rem] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <span className="text-lg sm:text-2xl">{product.icon}</span>
                    <span className="hidden rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 sm:inline-flex">
                      {productCategoryLabels[product.category]}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-stone-900 sm:mt-4 sm:text-base sm:leading-6">
                    {product.name}
                  </h3>
                  <p className="mt-2 hidden text-xs text-stone-500 sm:block">
                    Toca para elegir cantidad.
                  </p>
                  <p className="mt-2 text-sm font-semibold text-amber-700 sm:mt-4 sm:text-lg">
                    {formatCurrency(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_16px_24px_rgba(120,86,45,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                Referencia opcional
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Puedes usar mesa, número, nombre de la persona o dejarlo para llevar.
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
                  placeholder={
                    referenceType === "TABLE" ? "Ej: 12 o Camila" : "Ej: 101 o Camila"
                  }
                  aria-label={referenceType === "TABLE" ? "Mesa o nombre" : "Número o nombre"}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      {selectedProduct ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/55 px-4 py-6 sm:py-8">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-md overflow-y-auto rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.22)] sm:max-h-[calc(100vh-4rem)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{selectedProduct.icon}</span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {isEditingSelectedProduct ? "Editar producto" : "Agregar producto"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                    {selectedProduct.name}
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    {formatCurrency(selectedProduct.price)} c/u
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeProductModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
                aria-label="Cerrar selector de cantidad"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm font-semibold text-stone-700">Cantidad</p>
              <div className="mt-4 flex items-center justify-center">
                <div className="min-w-24 rounded-[1.25rem] bg-white px-5 py-4 text-center shadow-sm">
                  <p className="text-3xl font-semibold text-stone-950">{selectedQuantity}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-xl font-semibold text-stone-700 transition hover:border-amber-400 hover:bg-white"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuantity((current) => current + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-xl font-semibold text-stone-700 transition hover:border-amber-400 hover:bg-white"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <div className="mt-5 rounded-[1.25rem] bg-white px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Subtotal
                </p>
                <p className="mt-1 text-2xl font-semibold text-amber-700">
                  {formatCurrency(selectedProduct.price * selectedQuantity)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {isEditingSelectedProduct ? (
                <button
                  type="button"
                  onClick={removeSelectedProduct}
                  className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Quitar
                </button>
              ) : null}
              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveSelectedProduct}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                {isEditingSelectedProduct ? "Actualizar" : "Agregar al pedido"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/55 px-4 py-6 sm:py-8">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.22)] sm:max-h-[calc(100vh-4rem)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Confirmación
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  Revisa el pedido antes de enviarlo
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Verifica los productos, la referencia y el total. Si está todo bien, confirma para registrar el pedido.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
                aria-label="Cerrar confirmación"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                <p className="text-sm font-semibold text-stone-900">Productos</p>
                <div className="mt-3 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-[1rem] border border-stone-200 bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">
                            {item.quantity} x {item.name}
                          </p>
                          <p className="text-xs text-stone-500">
                            {formatCurrency(item.price)} c/u
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-amber-700">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-stone-900">Referencia</p>
                  <p className="mt-2 text-sm text-stone-600">
                    {formatOrderReference({
                      referenceType,
                      referenceValue,
                    })}
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-amber-400 p-4 text-stone-950">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                    Total
                  </p>
                  <p className="mt-2 text-3xl font-semibold">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={submitOrder}
                disabled={isSubmitting}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Enviando..." : "Confirmar pedido"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <UiToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
