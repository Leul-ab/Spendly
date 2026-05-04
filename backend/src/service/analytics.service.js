import prisma from "../../prisma/client.js";

//summary income and expenses by category
export const getSummary = async (userId) =>{
    const transactions = await prisma.transaction.findMany({
        where: {userId}
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) =>{
        if(t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    return {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
    };
};

//summary by category
export const getCategoryBreakdown = async (userId) =>{
    const transaction = await prisma.transaction.findMany({
    where: {userId, type: "expense"},
    include: {category: true},
    });

    const result = {};

    transaction.forEach((t) =>{
        const name = t.category.name;

        if(!result[name]) result[name] = 0;

        result[name] += t.amount;
    });

    return result;
};


// monthly analytics
export const getMonthlyData  = async (userId) =>{
    const transactions = await prisma.transaction.findMany({
        where: {userId},
    });

    const result = {};

    transactions.forEach((t) =>{
        const month = t.date.toISOString().slice(0,7); // YYYY-MM

        if(!result[month]) result[month] = {income: 0, expense: 0};

        if(t.type === "income") result[month].income += t.amount;
        else result[month].expense += t.amount;
    });

    return result;
};