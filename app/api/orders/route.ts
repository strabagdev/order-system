import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { OrderReferenceType } from "@/generated/prisma/enums";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL no está configurada." },
      { status: 503 },
    );
  }

  const prisma = getPrisma();
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
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
  const referenceType = String(body.referenceType ?? "TABLE");
  const referenceValue = String(body.referenceValue ?? "").trim();
  const items: Array<{ productId: string; quantity: number }> = Array.isArray(body.items)
    ? body.items
    : [];

  if (!(referenceType in OrderReferenceType) || !referenceValue || items.length === 0) {
    return NextResponse.json(
      { error: "Referencia e items son obligatorios." },
      { status: 400 },
    );
  }

  const productIds = items.map((item: { productId: string; quantity: number }) =>
    String(item.productId),
  );
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const orderItems = items.map((item: { productId: string; quantity: number }) => {
    const product = productMap.get(String(item.productId));
    const quantity = Number(item.quantity);

    if (!product || Number.isNaN(quantity) || quantity <= 0) {
      throw new Error("Item inválido.");
    }

    return {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    };
  });

  const total = orderItems.reduce(
    (sum: number, item: { lineTotal: number }) => sum + item.lineTotal,
    0,
  );

  const order = await prisma.order.create({
    data: {
      referenceType: OrderReferenceType[referenceType as keyof typeof OrderReferenceType],
      referenceValue,
      total,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  revalidatePath("/pedido");
  revalidatePath("/preparacion");
  revalidatePath("/pago");
  revalidatePath("/resumen");
  revalidatePath("/");

  return NextResponse.json(order, { status: 201 });
}
