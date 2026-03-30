import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: Context) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL no está configurada." },
      { status: 503 },
    );
  }

  try {
    const prisma = getPrisma();
    const { id } = await context.params;

    await prisma.order.delete({
      where: { id },
    });

    revalidatePath("/preparacion");
    revalidatePath("/pago");
    revalidatePath("/resumen");
    revalidatePath("/pedido");
    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No fue posible cancelar el pedido.",
      },
      { status: 500 },
    );
  }
}
