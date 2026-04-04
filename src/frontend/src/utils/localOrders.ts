// Local storage key for storing manual UPI orders for the current player's purchase history
export const LOCAL_ORDERS_KEY = "shadowmc_local_orders";

export interface LocalOrder {
  id: string;
  timestamp: number; // ms epoch
  items: Array<{ name: string; quantity: number; priceINR: number }>;
  totalINR: number;
  paymentMethod: string;
  username: string;
  email: string;
  verified: boolean;
  backendId?: number; // Optional: ID returned by submitManualOrder (Nat as number)
}

export function loadLocalOrders(): LocalOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: LocalOrder): void {
  try {
    const existing = loadLocalOrders();
    existing.push(order);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(existing));
  } catch {
    // ignore storage errors
  }
}

export function updateLocalOrderBackendId(
  orderId: string,
  backendId: number,
): void {
  try {
    const existing = loadLocalOrders();
    const updated = existing.map((o) =>
      o.id === orderId ? { ...o, backendId } : o,
    );
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}
