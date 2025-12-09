const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    try {
        console.log('--- DIAGNOSTIC START ---');

        // 1. Check Admin User
        const admin = await prisma.user.findUnique({
            where: { username: 'admin' }
        });

        if (!admin) {
            console.log('CRITICAL: User "admin" NOT FOUND!');
            return;
        }

        console.log(`User: ${admin.username}`);
        console.log(`Role: ${admin.role}`);
        console.log(`StoreId: ${admin.storeId}`); // THIS IS THE KEY

        if (!admin.storeId) {
            console.log('WARNING: Admin user has NO StoreId. This prevents creating clients/products.');

            // 2. Check if ANY store exists
            const stores = await prisma.store.findMany();
            console.log(`Total Stores in DB: ${stores.length}`);

            if (stores.length > 0) {
                console.log(`Suggestion: Link admin to store ID: ${stores[0].id}`);
            } else {
                console.log('Suggestion: Create a new Store and link admin to it.');
            }
        } else {
            console.log('OK: Admin has a StoreId.');
        }

        console.log('--- DIAGNOSTIC END ---');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
