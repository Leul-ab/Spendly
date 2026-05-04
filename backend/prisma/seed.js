import prisma from "./client.js";

async function main(){
    const categories =[
        {name: "Food"},
        {name: "Transport"},
        {name: "Entertainment"},
        {name: "Utilities"},
        {name: "Health"},
        {name: "Education"},
    ]
    for (const cat of categories) {
        await prisma.category.create({
            data: {
                name: cat.name,
                userId: null, // global category
            },
        });
    }

    console.log("Default categories seeded");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());