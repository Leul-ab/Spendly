import prisma from "../../prisma/client.js";

// CREATE OR UPDATE BUDGET
export const setBudget = async (data, userId) => {
  const { amount, categoryId, month } = data;

  return await prisma.budget.upsert({
    where: {
      userId_categoryId_month: {
        userId,
        categoryId,
        month,
      },
    },
    update: {
      amount,
    },
    create: {
      amount,
      categoryId,
      month,
      userId,
    },
  });
};

// GET ALL BUDGETS
export const getBudgets = async (userId) => {
  return await prisma.budget.findMany({
    where: { userId },
    include: {
      category: true,
    },
  });
};

// DELETE BUDGET
export const deleteBudget = async (id, userId) => {
  const idNum = Number(id);
  const existing = await prisma.budget.findFirst({
    where: {
      id: idNum,
      userId,
    },
  });
  if (!existing) {
    throw new Error("Budget not found");
  }
  await prisma.budget.delete({
    where: { id: idNum },
  });
  return existing;
};