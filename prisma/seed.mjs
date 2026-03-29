import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Completo Italiano", price: 6500, category: "MAIN", icon: "🌭" },
  { name: "Hamburguesa Clásica", price: 8900, category: "MAIN", icon: "🍔" },
  { name: "Papas Fritas", price: 3500, category: "SIDE", icon: "🍟" },
  { name: "Empanada de Queso", price: 2800, category: "SIDE", icon: "🥟" },
  { name: "Bebida Lata", price: 2200, category: "DRINK", icon: "🥤" },
  { name: "Jugo Natural", price: 2900, category: "DRINK", icon: "🧃" },
  { name: "Torta del Día", price: 3900, category: "DESSERT", icon: "🍰" },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: `${product.name.toLowerCase().replaceAll(" ", "-")}` },
      update: product,
      create: {
        id: `${product.name.toLowerCase().replaceAll(" ", "-")}`,
        ...product,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
