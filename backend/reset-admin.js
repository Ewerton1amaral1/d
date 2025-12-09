const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = process.argv[2] || 'admin123';
    console.log(`Setting admin password to: ${password}`);

    // Hash manually to ensure bcrypt dependency is working
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert admin user
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Super Admin',
            isActive: true,
        },
    });

    console.log('Successfully reset admin credentials (via JS script).');
    console.log('Username: admin');
    console.log('Password:', password);
    console.log('User ID:', admin.id);
    console.log('Role:', admin.role);
}

main()
    .catch((e) => {
        console.error('Error resetting admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
