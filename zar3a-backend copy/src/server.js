import "dotenv/config";
import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import trackingRoutes from "./routes/tracking.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();
const PORT = process.env.PORT || 5002;

// ── Global middlewares ────────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));

// Important: Parse raw body for Stripe webhook verification
app.use('/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/marketplace", marketplaceRoutes);
app.use("/admin", adminRoutes);
app.use("/notifications", notificationRoutes);
app.use("/chat", chatRoutes);
app.use("/tracking", trackingRoutes);
app.use("/orders", ordersRoutes);
app.use("/payments", paymentRoutes);
app.use("/cart", cartRoutes);

app.get("/", (_req, res) =>
  res.json({ status: "ok", project: "Zar3a API 🌱", version: "2.0.0 (Refactored)" })
);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// ── Boot & Database Sync ──────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // We synchronize tables but avoid alter: true on MySQL to prevent key/index bloat (ER_TOO_MANY_KEYS)
    await sequelize.sync();
    console.log("✅ Database connected & synced");

    app.listen(PORT, () => {
      console.log(`\n🌱 Zar3a API is running (Refactored v2.0.0)`);
      console.log(`    Local  →  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};
startServer();
// Nodemon reload trigger 2