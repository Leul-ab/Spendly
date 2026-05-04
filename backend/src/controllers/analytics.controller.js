import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyData,
} from "../service/analytics.service.js";

// SUMMARY
export const summary = async (req, res) => {
  try {
    const data = await getSummary(req.user.id);

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// CATEGORY
export const category = async (req, res) => {
  try {
    const data = await getCategoryBreakdown(req.user.id);

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// MONTHLY
export const monthly = async (req, res) => {
  try {
    const data = await getMonthlyData(req.user.id);

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};