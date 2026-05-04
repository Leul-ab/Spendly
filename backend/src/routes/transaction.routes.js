/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction API
 */

import express from "express";
import {
  create,
  getAll,
  remove,
  update,
} from "../controllers/transaction.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, getAll);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, create);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Transactions]
 */
router.delete("/:id", authMiddleware, remove);


/**
 * @swagger
 * /api/transactions/{id}:
 *   patch:
 *     summary: Update transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, update);

export default router;