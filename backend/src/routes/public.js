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
    include: { products: { where: { quantity: { gt: 0 } }, orderBy: { name: "asc" } } },
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
  console.log("Order request received:", req.body);
  const { tableId, items } = req.body;
  if (!tableId || !Array.isArray(items) || items.length === 0) {
    console.log("Invalid payload:", { tableId, items });
    return res.status(400).json({ message: "Invalid payload" });
  }
  
  // Validate that the table exists
  const table = await prisma.cafeTable.findUnique({
    where: { id: tableId }
  });
  if (!table) {
    console.log("Invalid table ID:", tableId);
    return res.status(400).json({ message: "Invalid table ID" });
  }
  console.log("Table found:", table.name);
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, quantity: { gt: 0 } },
  });
  console.log("Products found:", products.length, "out of", items.length, "requested");
  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalCents = 0;
  const orderItemsData = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      console.log("Product unavailable:", item.productId);
      return res.status(400).json({ message: "Product unavailable" });
    }
    const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
    // Check if enough stock is available
    if (product.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` });
    }
    totalCents += product.priceCents * quantity;
    orderItemsData.push({ productId: product.id, quantity, priceCents: product.priceCents });
  }
  
  // Create order and update stock quantities in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        tableId,
        totalCents,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } }, table: true },
    });
    
    // Update stock quantities
    for (const item of orderItemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });
    }
    
    return newOrder;
  });
  await prisma.cafeTable.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });
  
  // WebSocket ile yeni sipariş bildirimini admin paneline gönder
  if (global.io) {
    global.io.to('admin-room').emit('new-order', {
      order,
      message: `Yeni sipariş: ${order.table.name} - ${order.totalCents / 100}₺`
    });
  }
  
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


