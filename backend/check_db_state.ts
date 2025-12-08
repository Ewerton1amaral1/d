import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STORE SETTINGS (Store) ---');
    const settings = await prisma.store.findFirst();
    // @ts-ignore
    console.dir(settings, { depth: null });

    console.log('\n--- RECENT ORDERS ---');
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });
    console.dir(orders, { depth: null });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
