import { PrismaClient } from '@prisma/client';

console.log('[Prisma] Initializing Client...');
console.log('[Prisma] CWD:', process.cwd());

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
