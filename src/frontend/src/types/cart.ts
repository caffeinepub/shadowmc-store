export interface CartItem {
  id: string;
  name: string;
  price: number; // in dollars
  inrPrice?: number; // in rupees
  quantity: number;
  type: "rank" | "coins";
  productId: bigint;
  tier?: string;
  coins?: number;
}
