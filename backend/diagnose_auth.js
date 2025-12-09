const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC START ---');
    console.log('Checking database connection...');

    try {
        const userCount = await prisma.user.count();
        console.log(`Total users in DB: ${userCount}`);

        const admin = await prisma.user.findUnique({
            where: { username: 'admin' }
        });

        if (!admin) {
            console.error('CRITICAL: User "admin" NOT FOUND in database!');
        } else {
            console.log('User "admin" found.');
            console.log(`ID: ${admin.id}`);
            console.log(`Role: ${admin.role}`);
            console.log(`Active: ${admin.isActive}`);
            console.log(`Stored Password Hash: ${admin.password.substring(0, 10)}...`);

            const isMatch = await bcrypt.compare('admin123', admin.password);
            console.log(`Test validation with "admin123": ${isMatch ? 'PASSED (Password is correct)' : 'FAILED (Hash mismatch)'}`);
        }

    } catch (error) {
        console.error('Database connection error:', error);
    }
    console.log('--- DIAGNOSTIC END ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
