import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth.js";

const prisma = new PrismaClient();

async function main() {
  const ownerPass = await hashPassword("admin123");
  const owner = await prisma.user.upsert({
    where: { email: "owner@cafe.local" },
    update: {},
    create: { email: "owner@cafe.local", password: ownerPass, role: "OWNER", name: "Kafe Sahibi" },
  });

  // Tables
  const tables = await Promise.all(
    ["Masa 1", "Masa 2", "Masa 3", "Masa 4"].map((name) =>
      prisma.cafeTable.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // Categories and products
  const drinks = await prisma.category.upsert({ where: { name: "İçecekler" }, update: {}, create: { name: "İçecekler" } });
  const foods = await prisma.category.upsert({ where: { name: "Yiyecekler" }, update: {}, create: { name: "Yiyecekler" } });

  await prisma.product.upsert({
    where: { id: "seed-espresso" },
    update: {},
    create: { id: "seed-espresso", name: "Espresso", priceCents: 4500, quantity: 50, minStock: 10, categoryId: drinks.id },
  });
  await prisma.product.upsert({
    where: { id: "seed-latte" },
    update: {},
    create: { id: "seed-latte", name: "Latte", priceCents: 5500, quantity: 30, minStock: 8, categoryId: drinks.id },
  });
  await prisma.product.upsert({
    where: { id: "seed-cheesecake" },
    update: {},
    create: { id: "seed-cheesecake", name: "Cheesecake", priceCents: 7500, quantity: 15, minStock: 3, categoryId: foods.id },
  });

  console.log("Seeded:", { owner: owner.email, tables: tables.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


