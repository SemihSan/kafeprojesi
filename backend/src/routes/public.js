import { Router } from "express";
import QRCode from "qrcode";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const publicRouter = Router();

// Health
publicRouter.get("/health", (req, res) => res.json({ ok: true }));

// Get menu (categories and products)
publicRouter.get("/menu", async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { products: { where: { inStock: true }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
  res.json({ categories });
});

// Get table info (from QR: ?tableId=...)
publicRouter.get("/table/:id", async (req, res) => {
  const table = await prisma.cafeTable.findUnique({ where: { id: req.params.id } });
  if (!table) return res.status(404).json({ message: "Table not found" });
  res.json({ table });
});

// Create order for a table
publicRouter.post("/orders", async (req, res) => {
  const { tableId, items } = req.body;
  if (!tableId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, inStock: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalCents = 0;
  const orderItemsData = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) return res.status(400).json({ message: "Product unavailable" });
    const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
    totalCents += product.priceCents * quantity;
    orderItemsData.push({ productId: product.id, quantity, priceCents: product.priceCents });
  }
  const order = await prisma.order.create({
    data: {
      tableId,
      totalCents,
      items: { create: orderItemsData },
    },
    include: { items: { include: { product: true } }, table: true },
  });
  await prisma.cafeTable.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });
  res.status(201).json({ order });
});

// Get single order (for status page)
publicRouter.get("/orders/:id", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, table: true },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
});

// Generate QR for a given table id
publicRouter.get("/tables/:id/qr", async (req, res) => {
  const table = await prisma.cafeTable.findUnique({ where: { id: req.params.id } });
  if (!table) return res.status(404).json({ message: "Table not found" });
  const baseUrl = (req.headers["x-public-base-url"] || `${req.protocol}://${req.get("host")}`).toString();
  const url = `${baseUrl}/?tableId=${table.id}`;
  const dataUrl = await QRCode.toDataURL(url);
  res.json({ tableId: table.id, name: table.name, url, qrDataUrl: dataUrl });
});


