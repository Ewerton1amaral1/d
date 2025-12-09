import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = process.argv[2] || 'admin123';
    console.log(`Setting admin password to: ${password}`);

    const hashedPassword = await bcrypt.hash(password, 10);

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

    console.log('Successfully reset admin credentials.');
    console.log('Username: admin');
    console.log('Password:', password);
}

main()
    .catch((e) => {
        console.error('Error resetting admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
