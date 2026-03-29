import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
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
  const paymentStatus = String(body.paymentStatus ?? "");
  const paymentMethod = body.paymentMethod ? String(body.paymentMethod) : null;

  if (!(paymentStatus in PaymentStatus)) {
    return NextResponse.json(
      { error: "Estado de pago inválido." },
      { status: 400 },
    );
  }

  if (paymentMethod && !(paymentMethod in PaymentMethod)) {
    return NextResponse.json(
      { error: "Forma de pago inválida." },
      { status: 400 },
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: PaymentStatus[paymentStatus as keyof typeof PaymentStatus],
      paymentMethod: paymentMethod
        ? PaymentMethod[paymentMethod as keyof typeof PaymentMethod]
        : null,
    },
  });

  revalidatePath("/pago");
  revalidatePath("/resumen");
  revalidatePath("/");

  return NextResponse.json(order);
}
