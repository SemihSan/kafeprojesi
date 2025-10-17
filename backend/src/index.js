import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config.js";
import { publicRouter } from "./routes/public.js";
import { adminRouter } from "./routes/admin.js";
import { PrismaClient } from "@prisma/client";
import { signJwt, comparePassword } from "./auth.js";

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit(config.rateLimit));

// Socket.io bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);
  
  // Admin paneline katılma
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin paneline katıldı:', socket.id);
  });
  
  // Masa odasına katılma
  socket.on('join-table', (tableId) => {
    socket.join(`table-${tableId}`);
    console.log(`Masa ${tableId} odasına katıldı:`, socket.id);
  });
  
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

// Socket.io instance'ını global olarak erişilebilir yap
global.io = io;

// Public routes
app.use("/api", publicRouter);

// Auth endpoints (admin login)
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signJwt({ id: user.id, role: user.role, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, role: user.role, email: user.email, name: user.name } });
});

// Admin routes
app.use("/api/admin", adminRouter);

// Vercel serverless için
export default app;

// Lokal development için
if (process.env.NODE_ENV !== 'production') {
  server.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}`);
  });
}


