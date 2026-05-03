import { Order, Settings, COMPANY_DETAILS } from "@/src/types";

const STORAGE_KEY_ORDERS = "qr_grand_mart_orders";
const STORAGE_KEY_SETTINGS = "qr_grand_mart_settings";

export const storage = {
  // Orders
  getOrders: (): Order[] => {
    const ordersStr = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!ordersStr) return [];
    try {
      return JSON.parse(ordersStr);
    } catch (e) {
      console.error("Failed to parse orders", e);
      return [];
    }
  },
  saveOrder: (order: Order) => {
    const orders = storage.getOrders();
    // Use the ID from order or generate one
    const id = order.id || Math.random().toString(36).substr(2, 9);
    const newOrder = { 
      ...order, 
      id,
      // Ensure createdAt is valid for local storage
      createdAt: order.createdAt || new Date().toISOString()
    };
    
    // Check if it's an update or new
    const existingIndex = orders.findIndex(o => o.id === id);
    if (existingIndex > -1) {
      orders[existingIndex] = newOrder;
    } else {
      orders.unshift(newOrder);
    }
    
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    return id;
  },
  deleteOrder: (id: string) => {
    const orders = storage.getOrders().filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  },
  getOrder: (id: string): Order | null => {
    return storage.getOrders().find(o => o.id === id) || null;
  },

  // Settings
  getSettings: (): Settings => {
    const settingsStr = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!settingsStr) return COMPANY_DETAILS;
    try {
      return JSON.parse(settingsStr);
    } catch (e) {
      console.error("Failed to parse settings", e);
      return COMPANY_DETAILS;
    }
  },
  saveSettings: (settings: Settings) => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }
};
