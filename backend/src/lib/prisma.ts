import { PrismaClient } from '@prisma/client';

console.log('[Prisma] Initializing Client...');
console.log('[Prisma] CWD:', process.cwd());
console.log('[Prisma] ENV Keys:', Object.keys(process.env).join(', '));
console.log('[Prisma] DATABASE_URL (env):', process.env.DATABASE_URL);
console.log('[Prisma] NODE_ENV:', process.env.NODE_ENV);

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
