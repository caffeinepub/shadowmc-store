export interface CartItem {
  id: string;
  name: string;
  price: number; // in dollars
  quantity: number;
  type: "rank" | "coins";
  productId: bigint;
  tier?: string;
  coins?: number;
}
