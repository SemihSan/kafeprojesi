import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../auth.js";

const prisma = new PrismaClient();
export const adminRouter = Router();

// Require owner or staff for all
adminRouter.use(authMiddleware(["OWNER", "WAITER", "KITCHEN"]));

// Me
adminRouter.get("/me", (req, res) => {
  res.json({ user: req.user });
});

// Orders live list
adminRouter.get("/orders", async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, table: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ orders });
});

// Update order status
adminRouter.patch("/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: { include: { product: true } }, table: true },
  });
  if (status === "SERVED") {
    // Optionally free the table if no other active orders
    await prisma.cafeTable.update({ where: { id: order.tableId }, data: { status: "EMPTY" } });
  }
  res.json({ order });
});

// Products CRUD (OWNER only for write)
adminRouter.get("/products", async (req, res) => {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  res.json({ products });
});

adminRouter.post("/products", authMiddleware(["OWNER"]), async (req, res) => {
  const { name, priceCents, inStock = true, categoryId } = req.body;
  const product = await prisma.product.create({ data: { name, priceCents, inStock, categoryId } });
  res.status(201).json({ product });
});

adminRouter.patch("/products/:id", authMiddleware(["OWNER"]), async (req, res) => {
  const { name, priceCents, inStock, categoryId } = req.body;
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { name, priceCents, inStock, categoryId } });
  res.json({ product });
});

adminRouter.delete("/products/:id", authMiddleware(["OWNER"]), async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// Tables: list, merge, split
adminRouter.get("/tables", async (req, res) => {
  const tables = await prisma.cafeTable.findMany({ orderBy: { name: "asc" } });
  res.json({ tables });
});

adminRouter.post("/tables/merge", authMiddleware(["OWNER"]), async (req, res) => {
  const { mainTableId, tableIds } = req.body; // tableIds to merge into main
  if (!mainTableId || !Array.isArray(tableIds) || tableIds.length === 0) return res.status(400).json({ message: "Invalid payload" });
  await prisma.$transaction(async (tx) => {
    await tx.cafeTable.update({ where: { id: mainTableId }, data: { status: "MERGED", mergedIntoId: null } });
    for (const tId of tableIds) {
      if (tId === mainTableId) continue;
      await tx.cafeTable.update({ where: { id: tId }, data: { status: "MERGED", mergedIntoId: mainTableId } });
    }
  });
  const tables = await prisma.cafeTable.findMany();
  res.json({ tables });
});

adminRouter.post("/tables/split", authMiddleware(["OWNER"]), async (req, res) => {
  const { tableIds } = req.body;
  if (!Array.isArray(tableIds) || tableIds.length === 0) return res.status(400).json({ message: "Invalid payload" });
  await prisma.cafeTable.updateMany({ where: { id: { in: tableIds } }, data: { status: "EMPTY", mergedIntoId: null } });
  const tables = await prisma.cafeTable.findMany();
  res.json({ tables });
});

// Simple reports
adminRouter.get("/reports/summary", authMiddleware(["OWNER"]), async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({ where: { createdAt: { gte: since }, status: { in: ["CONFIRMED", "PREPARING", "READY", "SERVED"] } }, include: { items: true } });
  const revenue = orders.reduce((sum, o) => sum + o.totalCents, 0);
  // Top products
  const productCounts = new Map();
  for (const order of orders) {
    for (const item of order.items) {
      productCounts.set(item.productId, (productCounts.get(item.productId) || 0) + item.quantity);
    }
  }
  const top = [...productCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  res.json({ revenueCents: revenue, topProducts: top.map(([productId, qty]) => ({ productId, qty })) });
});


