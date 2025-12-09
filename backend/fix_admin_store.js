const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    try {
        console.log('--- FIX START ---');

        // 1. Find Admin
        const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
        if (!admin) {
            console.log('Admin not found!');
            return;
        }

        // 2. Check/Create Store
        let store = await prisma.store.findFirst();
        if (!store) {
            console.log('Creating Default Store...');
            store = await prisma.store.create({
                data: {
                    name: 'Minha Loja Delivery',
                    slug: 'minha-loja',
                    contactPhone: '00000000000',
                    address: 'Endereço Principal',
                    isActive: true,
                    isStoreOpen: true
                }
            });
            console.log(`Store Created: ${store.id}`);
        } else {
            console.log(`Using existing store: ${store.id}`);
        }

        // 3. Link Admin to Store
        await prisma.user.update({
            where: { id: admin.id },
            data: { storeId: store.id }
        });

        console.log('SUCCESS: Admin linked to Store!');
        console.log('--- FIX END ---');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
