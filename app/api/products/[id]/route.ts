import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ProductCategory } from "@/generated/prisma/enums";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL no está configurada." },
      { status: 503 },
    );
  }

  const prisma = getPrisma();
  const { id } = await context.params;
  const body = await request.json();
  const data: Record<string, string | number | boolean | ProductCategory> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();

    if (!name) {
      return NextResponse.json(
        { error: "El nombre no puede quedar vacío." },
        { status: 400 },
      );
    }

    data.name = name;
  }

  if (body.price !== undefined) {
    const price = Number(body.price);

    if (Number.isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "El precio debe ser mayor a 0." },
        { status: 400 },
      );
    }

    data.price = price;
  }

  if (body.category !== undefined) {
    const category = String(body.category);

    if (!(category in ProductCategory)) {
      return NextResponse.json(
        { error: "Categoría inválida." },
        { status: 400 },
      );
    }

    data.category = ProductCategory[category as keyof typeof ProductCategory];
  }

  if (body.icon !== undefined) {
    data.icon = String(body.icon).trim() || "🍽️";
  }

  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  revalidatePath("/pedido");
  revalidatePath("/admin/productos");

  return NextResponse.json(product);
}
