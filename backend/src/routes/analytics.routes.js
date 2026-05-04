/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Financial analytics & dashboard
 */

import express from "express";
import {
  summary,
  category,
  monthly,
} from "../controllers/analytics.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get financial summary (income, expense, balance)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data
 */
router.get("/summary", authMiddleware, summary);

/**
 * @swagger
 * /api/analytics/category:
 *   get:
 *     summary: Get expense breakdown by category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get("/category", authMiddleware, category);

/**
 * @swagger
 * /api/analytics/monthly:
 *   get:
 *     summary: Get monthly income vs expense trends
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly analytics data
 */
router.get("/monthly", authMiddleware, monthly);

export default router;