import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebHooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// Initialize external services
connectDB();
connectCloudinary();

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to ensure DB connection is ready before processing API requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Stripe Webhook (must be before express.json() raw body parsing)
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Clerk Webhook (must be before express.json() raw body parsing)
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Standard Middlewares
app.use(express.json());

app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => res.send("API is working"));
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
