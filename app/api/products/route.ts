import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ProductCategory } from "@/generated/prisma/enums";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL no está configurada." },
      { status: 503 },
    );
  }

  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL no está configurada." },
      { status: 503 },
    );
  }

  const prisma = getPrisma();
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const category = String(body.category ?? "OTHER");
  const icon = String(body.icon ?? "🍽️").trim() || "🍽️";

  if (!name || Number.isNaN(price) || price <= 0) {
    return NextResponse.json(
      { error: "Nombre y precio válido son obligatorios." },
      { status: 400 },
    );
  }

  if (!(category in ProductCategory)) {
    return NextResponse.json(
      { error: "Categoría inválida." },
      { status: 400 },
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      price,
      category: ProductCategory[category as keyof typeof ProductCategory],
      icon,
      isActive: Boolean(body.isActive ?? true),
    },
  });

  revalidatePath("/pedido");
  revalidatePath("/admin/productos");

  return NextResponse.json(product, { status: 201 });
}
