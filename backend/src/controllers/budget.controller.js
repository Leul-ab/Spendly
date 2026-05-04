import {
  setBudget,
  getBudgets,
  deleteBudget,
} from "../service/budget.service.js";

// CREATE / UPDATE
export const createOrUpdate = async (req, res) => {
  try {
    const budget = await setBudget(req.body, req.user.id);

    res.status(200).json({
      message: "Budget saved",
      data: budget,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET
export const getAll = async (req, res) => {
  try {
    const budgets = await getBudgets(req.user.id);

    res.status(200).json({ data: budgets });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const remove = async (req, res) => {
  try {
    const deleted = await deleteBudget(req.params.id, req.user.id);

    res.status(200).json({ message: "Budget deleted", data: deleted });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};