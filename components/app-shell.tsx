"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/pedido", label: "Toma de pedido" },
  { href: "/preparacion", label: "Preparación" },
  { href: "/pago", label: "Pago" },
  { href: "/resumen", label: "Resumen diario" },
  { href: "/admin/productos", label: "Productos" },
];

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff8e8,transparent_35%),linear-gradient(180deg,#fffaf1_0%,#f6efe1_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6">
        <header className="mb-6 rounded-[2rem] border border-stone-200/80 bg-white/85 p-5 shadow-[0_20px_50px_rgba(120,86,45,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Order System MVP
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  {description}
                </p>
              </div>

              <div className="flex items-start justify-end">
                <button
                  type="button"
                  onClick={() => setMenuOpen((current) => !current)}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-2xl font-medium text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  aria-expanded={menuOpen}
                  aria-label="Abrir navegación"
                >
                  <span>{menuOpen ? "×" : "☰"}</span>
                </button>
              </div>
            </div>

            {menuOpen ? (
              <nav className="grid gap-2 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-3 sm:grid-cols-2 xl:grid-cols-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
