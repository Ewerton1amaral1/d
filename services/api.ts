let envUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
// Sanitize URL: Remove trailing slash and fix double /api/api
envUrl = envUrl.replace(/\/+$/, '');
if (envUrl.endsWith('/api/api')) {
  envUrl = envUrl.substring(0, envUrl.length - 4);
}
const API_URL = envUrl;

console.log("DEBUG: Current API_URL is:", API_URL);

// Helper for authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const sessionStr = localStorage.getItem('dm_session');
  let token = '';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.token;
    } catch (e) {
      console.error('Invalid session format');
    }
  }

  const headers = {
    ...options.headers as Record<string, string>,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Optional: Trigger logout if token expired
    console.warn('Unauthorized access - token may be invalid');
  }

  return response;
};

export const api = {
  // --- PRODUCTS ---
  async getProducts(storeId?: string) {
    const query = storeId ? `?storeId=${storeId}` : '';
    const res = await authFetch(`${API_URL}/products${query}`);
    return res.json();
  },
  async createProduct(storeId: string, product: any) {
    const res = await authFetch(`${API_URL}/products`, {
      method: "POST",
      body: JSON.stringify(product),
    });
    return res.json();
  },
  async updateProduct(id: string, updates: any) {
    const res = await authFetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async deleteProduct(id: string) {
    const res = await authFetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  // --- CLIENTS ---
  async getClients(storeId?: string) {
    const res = await authFetch(`${API_URL}/clients`);
    return res.json();
  },
  async createClient(storeId: string, client: any) {
    const res = await authFetch(`${API_URL}/clients`, {
      method: "POST",
      body: JSON.stringify(client),
    });
    return res.json();
  },

  // --- ORDERS ---
  async getOrders(storeId?: string) {
    const res = await authFetch(`${API_URL}/orders`);
    return res.json();
  },
  async createOrder(storeId: string, order: any) {
    const res = await authFetch(`${API_URL}/orders`, {
      method: "POST",
      body: JSON.stringify(order),
    });
    return res.json();
  },
  async updateOrder(storeId: string, orderId: string, updates: any) {
    const res = await authFetch(`${API_URL}/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // --- SETTINGS ---
  async getSettings(storeId?: string) {
    const res = await authFetch(`${API_URL}/settings`);
    return res.json();
  },
  async saveSettings(storeId: string, settings: any) {
    const res = await authFetch(`${API_URL}/settings`, {
      method: "POST",
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // --- DRIVERS ---
  async getDrivers(storeId?: string) {
    const res = await authFetch(`${API_URL}/drivers`);
    return res.json();
  },
  async createDriver(storeId: string, driver: any) {
    const res = await authFetch(`${API_URL}/drivers`, {
      method: "POST",
      body: JSON.stringify(driver),
    });
    return res.json();
  },

  // --- EMPLOYEES ---
  async getEmployees() {
    const res = await authFetch(`${API_URL}/employees`);
    return res.json();
  },

  // --- SUPPLIES ---
  async getSupplies() {
    const res = await authFetch(`${API_URL}/supplies`);
    return res.json();
  },

  // --- WHATSAPP ---
  async getWhatsappStatus() {
    const res = await authFetch(`${API_URL}/whatsapp/status`);
    return res.json();
  },
  async getChats() {
    const res = await authFetch(`${API_URL}/whatsapp/chats`);
    return res.json();
  },
  async getMessages(chatId: string) {
    const res = await authFetch(`${API_URL}/whatsapp/chats/${chatId}/messages`);
    return res.json();
  },
  async sendMessage(chatId: string, message: string) {
    const res = await authFetch(`${API_URL}/whatsapp/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return res.json();
  }
};
