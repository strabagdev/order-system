import { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(120,86,45,0.08)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
