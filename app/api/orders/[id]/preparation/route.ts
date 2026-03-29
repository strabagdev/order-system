import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PreparationStatus } from "@/generated/prisma/enums";
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
  const status = String(body.preparationStatus ?? "");

  if (!(status in PreparationStatus)) {
    return NextResponse.json(
      { error: "Estado de preparación inválido." },
      { status: 400 },
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      preparationStatus:
        PreparationStatus[status as keyof typeof PreparationStatus],
    },
  });

  revalidatePath("/preparacion");
  revalidatePath("/resumen");
  revalidatePath("/");

  return NextResponse.json(order);
}
