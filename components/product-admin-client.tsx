"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { productCategories, productCategoryLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { ToastState, UiToast } from "@/components/ui-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  category: keyof typeof productCategoryLabels;
  icon: string;
  isActive: boolean;
};

const emptyForm = {
  name: "",
  price: "",
  category: "OTHER",
  icon: "🍽️",
  isActive: true,
};

export function ProductAdminClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setToast(null);

    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          category: form.category,
          icon: form.icon,
          isActive: form.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "No fue posible guardar el producto.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setToast({
        type: "success",
        text: editingId ? "Producto actualizado." : "Producto creado.",
      });
      router.refresh();
    } catch (error) {
      setToast({
        type: "error",
        text: error instanceof Error ? error.message : "Ocurrió un error.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleProduct(product: Product) {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "No fue posible actualizar el producto.");
      }

      setToast({
        type: "success",
        text: product.isActive ? "Producto desactivado." : "Producto activado.",
      });
      router.refresh();
    } catch (error) {
      setToast({
        type: "error",
        text: error instanceof Error ? error.message : "Ocurrió un error.",
      });
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      icon: product.icon,
      isActive: product.isActive,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_18px_40px_rgba(120,86,45,0.08)]"
      >
        <h2 className="text-xl font-semibold text-stone-900">
          {editingId ? "Editar producto" : "Nuevo producto"}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Carga los productos que estarán disponibles en la carta visual.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Nombre</span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Precio</span>
            <input
              required
              min="1"
              type="number"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Categoría</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
            >
              {productCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Ícono</span>
            <input
              value={form.icon}
              onChange={(event) =>
                setForm((current) => ({ ...current, icon: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Producto activo
          </label>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : editingId ? "Actualizar" : "Crear producto"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_16px_35px_rgba(120,86,45,0.08)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                  {product.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">{product.name}</h3>
                  <p className="text-sm text-stone-500">
                    {productCategoryLabels[product.category]}
                  </p>
                  <p className="mt-2 text-base font-semibold text-amber-700">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleProduct(product)}
                  className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                >
                  {product.isActive ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <UiToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
