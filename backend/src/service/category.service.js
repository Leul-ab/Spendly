import prisma from '../../prisma/client.js';


//create
export const createCategory = async (name, userId) =>{
    return await prisma.category.create({
        data:{
            name,
            userId
        },
    });
};


//get all categories
export const getCategories = async (userId) =>{
    return await prisma.category.findMany({
        where:{
            OR:[
                {userId: userId}, // user-specific categories
                {userId: null} // global categories
            ],
        },
        orderBy:{
            name: 'asc'
        },
    });
};

//update category (user-owned only)
export const updateCategory = async (id, name, userId) =>{
    const idNum = Number(id);
    const updated = await prisma.category.updateMany({
        where:{
            id: idNum,
            userId: userId,
        },
        data:{
            name
        }
    });
    if (updated.count === 0) {
        throw new Error("Category not found or cannot be modified");
    }
    return prisma.category.findUnique({
        where: { id: idNum },
    });
};


//delete category (user-owned only)
export const deleteCategory = async (id, userId) =>{
    const idNum = Number(id);
    const existing = await prisma.category.findFirst({
        where:{
            id: idNum,
            userId: userId,
        },
    });
    if (!existing) {
        throw new Error("Category not found or cannot be deleted");
    }
    await prisma.category.delete({
        where: { id: idNum },
    });
    return existing;
};