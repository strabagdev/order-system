import Link from "next/link";

export function SetupNotice({
  title = "Falta `DATABASE_URL`",
  description = "La app ya está lista, pero todavía no tiene conexión a PostgreSQL. Crea un archivo `.env` a partir de `.env.example` o configura `DATABASE_URL` en Railway, luego reinicia el servidor.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-stone-800">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
        Configuración pendiente
      </p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-700">{description}</p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <code className="rounded-full bg-white px-4 py-2 text-stone-900 shadow-sm">
          DATABASE_URL=&quot;postgresql://usuario:password@HOST:5432/db&quot;
        </code>
        <Link
          href="/admin/productos"
          className="rounded-full border border-amber-300 px-4 py-2 font-medium text-amber-800"
        >
          Ver rutas del MVP
        </Link>
      </div>
    </div>
  );
}
