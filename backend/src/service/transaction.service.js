import prisma from '../../prisma/client.js';


//create transaction
export const createTransaction = async (data, userId) =>{
    const {amount, type, categoryId, description, date} = data;

    return await prisma.transaction.create({
        data:{
            amount: parseFloat(amount),
            type,
            categoryId,
            description,
            date: new Date(date),
            userId,
        },
        include: { category: true },
    });
};


//get all transactions
export const getTransaction = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    type,
    categoryId,
    startDate,
    endDate,
    sort = "date_desc",
  } = query;

  const skip = (page - 1) * limit;

  // FILTERS
  const where = {
    userId,
  };

  if (type) where.type = type;
  if (categoryId) where.categoryId = Number(categoryId);

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  // SORTING
  let orderBy = { date: "desc" };

  if (sort === "amount_asc") orderBy = { amount: "asc" };
  if (sort === "amount_desc") orderBy = { amount: "desc" };

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    skip: Number(skip),
    take: Number(limit),
    orderBy,
  });

  const total = await prisma.transaction.count({ where });

  return {
    data: transactions,
    meta: {
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    },
  };
};


//update transaction
export const updateTransaction = async (id, data, userId) =>{
    const idNum = Number(id);
    const updated = await prisma.transaction.updateMany({
        where: {
            id: idNum,
            userId,
        },
      data:{
          amount: parseFloat(data.amount),
          type: data.type,
          categoryId: data.categoryId,
          description: data.description,
          date: new Date(data.date),
      },
  });
    if (updated.count === 0) {
        throw new Error("Transaction not found");
    }
    return prisma.transaction.findUnique({
        where: { id: idNum },
        include: { category: true },
    });
};

//delete transaction
export const deleteTransaction = async (id, userId) =>{
    const idNum = Number(id);
    const existing = await prisma.transaction.findFirst({
        where: {
            id: idNum,
            userId,
        },
        include: { category: true },
    });
    if (!existing) {
        throw new Error("Transaction not found");
    }
    await prisma.transaction.delete({ where: { id: idNum } });
    return existing;
};