import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../auth.js";
import qrcode from "qrcode";

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
  
  // WebSocket ile sipariş durumu güncellemesini ilgili masaya ve admin paneline gönder
  if (global.io) {
    const statusMessages = {
      'CONFIRMED': 'Siparişiniz onaylandı',
      'PREPARING': 'Siparişiniz hazırlanıyor',
      'READY': 'Siparişiniz hazır!',
      'SERVED': 'Siparişiniz teslim edildi'
    };
    
    // Masaya bildirim gönder
    global.io.to(`table-${order.tableId}`).emit('order-status-update', {
      orderId: order.id,
      status: status,
      message: statusMessages[status] || 'Sipariş durumu güncellendi'
    });
    
    // Admin paneline bildirim gönder
    global.io.to('admin-room').emit('order-updated', {
      order,
      message: `${order.table.name} - Sipariş durumu: ${status}`
    });
  }
  
  res.json({ order });
});

// Products CRUD (OWNER only for write)
adminRouter.get("/products", async (req, res) => {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  res.json({ products });
});

adminRouter.post("/products", authMiddleware(["OWNER"]), async (req, res) => {
  const { name, priceCents, quantity = 0, minStock = 5, categoryId } = req.body;
  const product = await prisma.product.create({ data: { name, priceCents, quantity, minStock, categoryId } });
  res.status(201).json({ product });
});

adminRouter.patch("/products/:id", authMiddleware(["OWNER"]), async (req, res) => {
  const { name, priceCents, quantity, minStock, categoryId } = req.body;
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { name, priceCents, quantity, minStock, categoryId } });
  res.json({ product });
});

adminRouter.delete("/products/:id", authMiddleware(["OWNER"]), async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// Stock management endpoints
adminRouter.patch("/products/:id/stock", authMiddleware(["OWNER"]), async (req, res) => {
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { quantity },
    include: { category: true }
  });
  res.json({ product });
});

adminRouter.post("/products/:id/stock/add", authMiddleware(["OWNER"]), async (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { quantity: { increment: amount } },
    include: { category: true }
  });
  res.json({ product });
});

adminRouter.get("/products/low-stock", authMiddleware(["OWNER"]), async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { quantity: 0 }, // Out of stock
        { quantity: { lte: prisma.product.fields.minStock } } // Low stock (quantity <= minStock)
      ]
    },
    include: { category: true },
    orderBy: { quantity: "asc" }
  });
  res.json({ products });
});

// New endpoint for checking low stock alerts
adminRouter.get("/products/stock-alerts", authMiddleware(["OWNER"]), async (req, res) => {
  const products = await prisma.$queryRaw`
    SELECT p.*, c.name as categoryName 
    FROM Product p 
    LEFT JOIN Category c ON p.categoryId = c.id 
    WHERE p.quantity <= p.minStock
    ORDER BY p.quantity ASC
  `;
  res.json({ products });
});

// Tables: list, merge, split
adminRouter.get("/tables", async (req, res) => {
  const tables = await prisma.cafeTable.findMany({
    orderBy: { name: "asc" },
    include: { orders: { where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] } } } }
  });

  // Add QR code URL for each table
  const tablesWithQR = tables.map(table => ({
    ...table,
    qrUrl: `${req.protocol}://${req.get('host')}/?tableId=${table.id}`,
    activeOrdersCount: table.orders.length
  }));

  res.json({ tables: tablesWithQR });
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

// Gelişmiş raporlama endpoint'leri
adminRouter.get("/reports/sales", authMiddleware(["OWNER"]), async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else {
      switch (period) {
        case 'daily':
          dateFilter = {
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          };
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          dateFilter = {
            createdAt: { gte: weekStart }
          };
          break;
        case 'monthly':
          dateFilter = {
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1)
            }
          };
          break;
        case 'yearly':
          dateFilter = {
            createdAt: {
              gte: new Date(now.getFullYear(), 0, 1)
            }
          };
          break;
      }
    }

    const orders = await prisma.order.findMany({
      where: {
        ...dateFilter,
        status: { in: ["CONFIRMED", "PREPARING", "READY", "SERVED"] }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Toplam gelir
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalCents, 0);
    
    // Sipariş sayısı
    const totalOrders = orders.length;
    
    // Ortalama sipariş değeri
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // En çok satılan ürünler
    const productSales = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId;
        if (!productSales.has(key)) {
          productSales.set(key, {
            productId: item.productId,
            productName: item.product.name,
            quantity: 0,
            revenue: 0
          });
        }
        const product = productSales.get(key);
        product.quantity += item.quantity;
        product.revenue += item.priceCents * item.quantity;
      });
    });
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Günlük satış trendi (son 30 gün)
    const dailySales = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = orders.filter(order => 
        order.createdAt >= date && order.createdAt < nextDate
      );
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalCents, 0);
      
      dailySales.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue,
        orderCount: dayOrders.length
      });
    }

    res.json({
      period,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      dailySales,
      orders: orders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        totalCents: order.totalCents,
        status: order.status,
        tableNumber: order.table.number,
        itemCount: order.items.length
      }))
    });
  } catch (error) {
    console.error('Raporlama hatası:', error);
    res.status(500).json({ error: 'Rapor oluşturulurken hata oluştu' });
  }
});

// Ürün performans raporu
adminRouter.get("/reports/products", authMiddleware(["OWNER"]), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'daily':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = {
          createdAt: { gte: weekStart }
        };
        break;
      case 'monthly':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        ...dateFilter,
        status: { in: ["CONFIRMED", "PREPARING", "READY", "SERVED"] }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    // Ürün performansı
    const productPerformance = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId;
        if (!productPerformance.has(key)) {
          productPerformance.set(key, {
            productId: item.productId,
            productName: item.product.name,
            categoryName: item.product.category.name,
            quantity: 0,
            revenue: 0,
            orderCount: 0
          });
        }
        const product = productPerformance.get(key);
        product.quantity += item.quantity;
        product.revenue += item.priceCents * item.quantity;
        product.orderCount += 1;
      });
    });

    const products = Array.from(productPerformance.values())
      .sort((a, b) => b.revenue - a.revenue);

    // Kategori performansı
    const categoryPerformance = new Map();
    products.forEach(product => {
      const key = product.categoryName;
      if (!categoryPerformance.has(key)) {
        categoryPerformance.set(key, {
          categoryName: key,
          quantity: 0,
          revenue: 0,
          productCount: 0
        });
      }
      const category = categoryPerformance.get(key);
      category.quantity += product.quantity;
      category.revenue += product.revenue;
      category.productCount += 1;
    });

    const categories = Array.from(categoryPerformance.values())
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      period,
      products,
      categories,
      totalProducts: products.length,
      totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0)
    });
  } catch (error) {
    console.error('Ürün raporu hatası:', error);
    res.status(500).json({ error: 'Ürün raporu oluşturulurken hata oluştu' });
  }
});


