import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const listStores = async (req: Request, res: Response) => {
    try {
        const stores = await prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
            include: { users: { select: { username: true, role: true } } }
        });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
};

export const toggleStoreStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body; // Expect boolean

    try {
        const store = await prisma.store.update({
            where: { id },
            data: { isActive }
        });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update store status' });
    }
};
