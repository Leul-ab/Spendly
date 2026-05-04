/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management
 */

import express from "express";
import {
  createOrUpdate,
  getAll,
  remove,
} from "../controllers/budget.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 */
router.get("/", authMiddleware, getAll);

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create or update a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, categoryId, month]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 300
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               month:
 *                 type: string
 *                 example: "2026-04"
 *     responses:
 *       200:
 *         description: Budget saved
 */
router.post("/", authMiddleware, createOrUpdate);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget deleted
 */
router.delete("/:id", authMiddleware, remove);

export default router;