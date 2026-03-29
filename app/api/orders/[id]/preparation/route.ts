import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PreparationStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
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
