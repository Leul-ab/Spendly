import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { setupSwagger } from "./swagger.js";
import transactionRoutes from "./routes/transaction.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import budgetRoutes from "./routes/budget.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Personal Finance API!");
});

export default app;