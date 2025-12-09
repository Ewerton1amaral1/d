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
  // --- AUTH ---
  async login(credentials: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },
  async register(data: any) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Registration failed');
    return resData;
  },

  // --- PRODUCTS ---
  async getProducts(storeId?: string) {
    const query = storeId ? `?storeId=${storeId}` : '';
    const res = await authFetch(`${API_URL}/products${query}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
  async createProduct(storeId: string, product: any) {
    const res = await authFetch(`${API_URL}/products`, {
      method: "POST",
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },
  async updateProduct(id: string, updates: any) {
    const res = await authFetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },
  async deleteProduct(id: string) {
    const res = await authFetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // --- CLIENTS ---
  async getClients(storeId?: string) {
    const res = await authFetch(`${API_URL}/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },
  async createClient(storeId: string, client: any) {
    const res = await authFetch(`${API_URL}/clients`, {
      method: "POST",
      body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error('Failed to create client');
    return res.json();
  },
  async updateClient(id: string, updates: any) {
    const res = await authFetch(`${API_URL}/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update client');
    return res.json();
  },
  async deleteClient(id: string) {
    const res = await authFetch(`${API_URL}/clients/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error('Failed to delete client');
    return res.json();
  },

  // --- ORDERS ---
  async getOrders(storeId?: string) {
    const res = await authFetch(`${API_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },
  async createOrder(storeId: string, order: any) {
    const res = await authFetch(`${API_URL}/orders`, {
      method: "POST",
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },
  async updateOrder(storeId: string, orderId: string, updates: any) {
    const res = await authFetch(`${API_URL}/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },
  // Added specific status update just in case, but updateOrder covers it
  async updateOrderStatus(orderId: string, status: string) {
    const res = await authFetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // --- SETTINGS ---
  async getSettings(storeId?: string) {
    const res = await authFetch(`${API_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
  async saveSettings(storeId: string, settings: any) {
    const res = await authFetch(`${API_URL}/settings`, {
      method: "POST",
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },

  // --- DRIVERS ---
  async getDrivers(storeId?: string) {
    const res = await authFetch(`${API_URL}/drivers`);
    if (!res.ok) throw new Error('Failed to fetch drivers');
    return res.json();
  },
  async createDriver(storeId: string, driver: any) {
    const res = await authFetch(`${API_URL}/drivers`, {
      method: "POST",
      body: JSON.stringify(driver),
    });
    if (!res.ok) throw new Error('Failed to create driver');
    return res.json();
  },
  async updateDriver(id: string, updates: any) {
    const res = await authFetch(`${API_URL}/drivers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update driver');
    return res.json();
  },
  async deleteDriver(id: string) {
    const res = await authFetch(`${API_URL}/drivers/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error('Failed to delete driver');
    return res.json();
  },

  // --- EMPLOYEES ---
  async getEmployees() {
    const res = await authFetch(`${API_URL}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },
  async createEmployee(employee: any) {
    const res = await authFetch(`${API_URL}/employees`, {
      method: "POST",
      body: JSON.stringify(employee),
    });
    if (!res.ok) throw new Error('Failed to create employee');
    return res.json();
  },
  async updateEmployee(id: string, updates: any) {
    const res = await authFetch(`${API_URL}/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return res.json();
  },
  async deleteEmployee(id: string) {
    const res = await authFetch(`${API_URL}/employees/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error('Failed to delete employee');
    return res.json();
  },
  async addEmployeeAdvance(employeeId: string, advance: any) {
    const res = await authFetch(`${API_URL}/employees/${employeeId}/advances`, {
      method: "POST",
      body: JSON.stringify(advance),
    });
    if (!res.ok) throw new Error('Failed to add advance');
    return res.json();
  },

  // --- SUPPLIES ---
  async getSupplies() {
    const res = await authFetch(`${API_URL}/supplies`);
    if (!res.ok) throw new Error('Failed to fetch supplies');
    return res.json();
  },
  async createSupply(supply: any) {
    const res = await authFetch(`${API_URL}/supplies`, {
      method: "POST",
      body: JSON.stringify(supply),
    });
    if (!res.ok) throw new Error('Failed to create supply');
    return res.json();
  },
  async updateSupply(id: string, updates: any) {
    const res = await authFetch(`${API_URL}/supplies/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update supply');
    return res.json();
  },
  async deleteSupply(id: string) {
    const res = await authFetch(`${API_URL}/supplies/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error('Failed to delete supply');
    return res.json();
  },

  // --- WHATSAPP ---
  async getWhatsappStatus() {
    const res = await authFetch(`${API_URL}/whatsapp/status`);
    if (!res.ok) throw new Error('Failed to fetch whatsapp status');
    return res.json();
  },
  async getChats() {
    const res = await authFetch(`${API_URL}/whatsapp/chats`);
    if (!res.ok) throw new Error('Failed to fetch chats');
    return res.json();
  },
  async getMessages(chatId: string) {
    const res = await authFetch(`${API_URL}/whatsapp/chats/${chatId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },
  async sendMessage(chatId: string, message: string) {
    const res = await authFetch(`${API_URL}/whatsapp/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },
  async deleteMessage(messageId: string) {
    const res = await authFetch(`${API_URL}/whatsapp/messages/${messageId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error('Failed to delete message');
    return res.json();
  },

  // --- ADMIN ---
  async getAdminStores() {
    const res = await authFetch(`${API_URL}/admin/stores`);
    if (!res.ok) throw new Error('Failed to fetch stores');
    return res.json();
  },
  async toggleStoreStatus(storeId: string, isActive: boolean) {
    const res = await authFetch(`${API_URL}/admin/stores/${storeId}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error('Failed to toggle store status');
    return res.json();
  }
};
