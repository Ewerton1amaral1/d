import { Client, LocalAuth, Message as WpMessage } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import prisma from '../lib/prisma';

export class WhatsappManager {
    private sessions: Map<string, Client> = new Map();
    private qrCodes: Map<string, string> = new Map();
    private statuses: Map<string, 'DISCONNECTED' | 'CONNECTED' | 'QR_READY'> = new Map();

    constructor() {
        console.log('[WhatsappManager] Started.');
    }

    public async getSession(storeId: string): Promise<Client | undefined> {
        return this.sessions.get(storeId);
    }

    public getStatus(storeId: string) {
        return {
            status: this.statuses.get(storeId) || 'DISCONNECTED',
            qrCode: this.qrCodes.get(storeId) || null
        };
    }

    public async initializeStore(storeId: string) {
        if (this.sessions.has(storeId)) {
            return this.sessions.get(storeId);
        }

        console.log(`[WhatsappManager] Initializing session for store: ${storeId}`);
        console.log(`[WhatsappManager] Using Executable Path: ${process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'}`);

        this.statuses.set(storeId, 'DISCONNECTED');

        const client = new Client({
            authStrategy: new LocalAuth({ clientId: storeId }), // Saves to .wwebjs_auth/session-<storeId>
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
            }
        });

        this.sessions.set(storeId, client);

        client.on('qr', async (qr) => {
            console.log(`[Store ${storeId}] QR RECEIVED`);
            try {
                const url = await qrcode.toDataURL(qr);
                this.qrCodes.set(storeId, url);
                this.statuses.set(storeId, 'QR_READY');
            } catch (err) {
                console.error('Error generating QR', err);
            }
        });

        client.on('ready', async () => {
            console.log(`[Store ${storeId}] Client is ready!`);
            this.statuses.set(storeId, 'CONNECTED');
            this.qrCodes.delete(storeId);

            // Save status to DB
            await prisma.store.update({
                where: { id: storeId },
                data: { whatsappStatus: 'CONNECTED' }
            });
        });

        client.on('message', async (msg) => {
            console.log(`[Store ${storeId}] Raw message received from ${msg.from}: ${msg.body}`);
            if (msg.from === 'status@broadcast') return;
            if (msg.fromMe) return;
            this.handleMessage(storeId, msg, client);
        });

        client.on('disconnected', async (reason) => {
            console.log(`[Store ${storeId}] Disconnected:`, reason);
            this.statuses.set(storeId, 'DISCONNECTED');
            await prisma.store.update({
                where: { id: storeId },
                data: { whatsappStatus: 'DISCONNECTED' }
            });
            this.sessions.delete(storeId);
            this.qrCodes.delete(storeId);
        });

        try {
            await client.initialize();
        } catch (error) {
            console.error(`[Store ${storeId}] Failed to initialize client`, error);
            this.sessions.delete(storeId); // Allow retry
            this.statuses.set(storeId, 'DISCONNECTED');
        }

        return client;
    }

    public async initializeAllSessions() {
        console.log('[WhatsappManager] Restoring all sessions...');
        const stores = await prisma.store.findMany({
            where: { whatsappStatus: 'CONNECTED' }
        });

        for (const store of stores) {
            console.log(`[WhatsappManager] Restoring session for store: ${store.id}`);
            this.initializeStore(store.id).catch(err => {
                console.error(`[WhatsappManager] Failed to restore session for ${store.id}`, err);
            });
        }
    }

    public async resetStore(storeId: string) {
        console.log(`[WhatsappManager] Resetting store ${storeId}...`);
        const client = this.sessions.get(storeId);
        if (client) {
            try {
                await client.destroy();
            } catch (e) {
                console.error(`[WhatsappManager] Error destroying client for ${storeId}`, e);
            }
        }
        this.sessions.delete(storeId);
        this.qrCodes.delete(storeId);
        this.statuses.set(storeId, 'DISCONNECTED');
        await prisma.store.update({ where: { id: storeId }, data: { whatsappStatus: 'DISCONNECTED' } });

        // Re-init immediately
        this.initializeStore(storeId);
    }

    private async handleMessage(storeId: string, msg: WpMessage, client: Client) {
        try {
            console.log(`[Store ${storeId}] Message from ${msg.from}: ${msg.body}`);

            // 1. Find or Create Chat
            const contact = await msg.getContact();
            const fromJid = msg.from;
            const contactName = contact.pushname || contact.name || fromJid.split('@')[0];

            let chat = await prisma.chat.findFirst({
                where: { storeId, remoteJid: fromJid }
            });

            if (!chat) {
                chat = await prisma.chat.create({
                    data: {
                        storeId,
                        remoteJid: fromJid,
                        contactName: contactName,
                        botStatus: 'ACTIVE'
                    }
                });
            }

            // 2. Save Incoming Message
            await prisma.message.create({
                data: {
                    chatId: chat.id,
                    body: msg.body,
                    fromMe: false,
                    timestamp: new Date()
                }
            });

            // Update chat timestamp
            await prisma.chat.update({
                where: { id: chat.id },
                data: { lastMessageAt: new Date() }
            });

            // 3. Bot Logic
            if (chat.botStatus === 'ACTIVE') {
                let response = '';

                const lowerBody = msg.body.toLowerCase().trim();

                if (lowerBody.includes('oi') || lowerBody.includes('olá') || lowerBody.includes('ola') || lowerBody.includes('bot') || lowerBody.includes('menu') || lowerBody.includes('cardapio')) {
                    response = `👋 Olá, *${contactName}*! Bem-vindo(a) ao atendimento automático.\n\nEscolha uma opção:\n\n1️⃣ *Ver Cardápio Digital*\n2️⃣ *Falar com Atendente*\n3️⃣ *Saber Horários*`;
                } else if (lowerBody === '1' || lowerBody.includes('cardapio') || lowerBody.includes('pedido')) {
                    // TODO: Replace with real dynamic link if possible, or generic
                    response = `🍔 *Nosso Cardápio*: https://delivery-master-v2.vercel.app/menu?store=${storeId}\n\nFaça seu pedido por lá!`;
                } else if (lowerBody === '2' || lowerBody.includes('atendente') || lowerBody.includes('humano')) {
                    response = `🔔 Chamei um atendente para falar com você. Aguarde um instante!`;
                    await prisma.chat.update({ where: { id: chat.id }, data: { botStatus: 'PAUSED' } });
                } else if (lowerBody === '3' || lowerBody.includes('horario') || lowerBody.includes('horas')) {
                    response = `🕒 Funcionamos todos os dias das 18h às 23h!`;
                } else {
                    response = `Desculpe, não entendi.\nDigite *Oi* para ver as opções.`;
                }

                if (response) {
                    // Send
                    await client.sendMessage(fromJid, response);

                    // Save Outgoing Message
                    await prisma.message.create({
                        data: {
                            chatId: chat.id,
                            body: response,
                            fromMe: true,
                            timestamp: new Date()
                        }
                    });
                }
            }

        } catch (error) {
            console.error(`[Store ${storeId}] Handle Message Error:`, error);
        }
    }
}

export const whatsappManager = new WhatsappManager();
