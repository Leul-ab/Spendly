/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

import express from "express";
import {
  create,
  getAll,
  remove,
  update,
} from "../controllers/category.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories (global + user)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", authMiddleware, getAll);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Food
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/", authMiddleware, create);

/**
 * @swagger
 * /api/categories/{id}:
 *  put:summary: Update a category (only user's own)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Food
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put("/:id", authMiddleware, update);


/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (only user's own)
 *     tags: [Categories]
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
 *         description: Category deleted
 */
router.delete("/:id", authMiddleware, remove);

export default router;