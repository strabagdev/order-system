import "server-only";

import { startOfDay } from "@/lib/time";
import { getPrisma } from "@/lib/prisma";

export async function getActiveProducts() {
  const prisma = getPrisma();

  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function getAllProducts() {
  const prisma = getPrisma();

  return prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { category: "asc" }, { name: "asc" }],
  });
}

export async function getPreparationOrders() {
  const prisma = getPrisma();

  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaymentOrders() {
  const prisma = getPrisma();

  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDailySummary() {
  const prisma = getPrisma();
  const today = startOfDay();

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: today } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const totalsByMethod = orders.reduce<Record<string, number>>((acc, order) => {
    if (order.paymentMethod) {
      acc[order.paymentMethod] = (acc[order.paymentMethod] ?? 0) + order.total;
    }

    return acc;
  }, {});

  return {
    orders,
    totalSales: orders.reduce((sum, order) => sum + order.total, 0),
    orderCount: orders.length,
    paidCount: orders.filter((order) => order.paymentStatus === "PAID").length,
    pendingCount: orders.filter((order) => order.paymentStatus === "PENDING").length,
    totalsByMethod,
  };
}
