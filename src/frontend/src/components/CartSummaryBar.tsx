import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useUserInfo } from "../context/UserInfoContext";

export default function CartSummaryBar() {
  const { items, openCart } = useCart();
  const { userInfo } = useUserInfo();
  const { currency } = useCurrency();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalINR = items.reduce(
    (sum, item) => sum + (item.inrPrice ?? 0) * item.quantity,
    0,
  );
  const cartTotalUSD = cartTotalINR / 92;

  // Format total without rupee symbol — just number with currency label
  const formattedTotal =
    currency === "INR"
      ? `Rs ${Math.round(cartTotalINR).toLocaleString("en-IN")}`
      : `$${cartTotalUSD.toFixed(2)}`;

  // Resolve username: prefer context, then fall back to localStorage
  const storedUsername = (() => {
    if (userInfo.minecraftUsername) return userInfo.minecraftUsername;
    try {
      const raw = localStorage.getItem("shadowmc_user_info");
      if (raw) {
        const parsed = JSON.parse(raw) as { minecraftUsername?: string };
        return parsed.minecraftUsername || "";
      }
    } catch {
      /* ignore */
    }
    return "";
  })();

  // Show Player TAB as soon as username is registered (permanent)
  // It's always visible once the user has entered their username
  const hasUsername = !!storedUsername;

  if (!hasUsername) return null;

  return (
    <div
      className="fixed bottom-0 right-0 z-50"
      style={{
        padding: "0 20px 16px 0",
      }}
    >
      {/* Player TAB label */}
      <div
        className="text-right mb-1"
        style={{
          color: "oklch(55% 0.08 195)",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Player TAB
      </div>

      <button
        type="button"
        onClick={openCart}
        className="flex items-center gap-3 rounded-2xl px-5 py-3 cursor-pointer"
        style={{
          background: "oklch(14% 0.03 250 / 0.95)",
          border: "1px solid oklch(78% 0.18 195 / 0.5)",
          boxShadow:
            "0 0 32px oklch(78% 0.18 195 / 0.25), 0 8px 32px oklch(0% 0 0 / 0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
        }}
      >
        {/* Cart icon + count */}
        <div className="relative flex-shrink-0">
          <ShoppingCart
            className="w-5 h-5"
            style={{ color: "oklch(78% 0.18 195)" }}
          />
          {cartItemCount > 0 && (
            <span
              className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold"
              style={{
                background: "oklch(78% 0.18 195)",
                color: "oklch(10% 0.02 250)",
                fontSize: "0.55rem",
              }}
            >
              {cartItemCount}
            </span>
          )}
        </div>

        {/* Username */}
        <span
          className="text-sm font-medium max-w-[120px] truncate"
          style={{ color: "oklch(65% 0.06 250)" }}
        >
          {storedUsername}
        </span>

        {/* Divider */}
        <span
          className="w-px h-4 flex-shrink-0"
          style={{ background: "oklch(30% 0.04 250)" }}
        />

        {/* Item count */}
        <span
          className="text-xs font-medium flex-shrink-0"
          style={{ color: "oklch(55% 0.06 250)" }}
        >
          {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
        </span>

        {/* Divider */}
        <span
          className="w-px h-4 flex-shrink-0"
          style={{ background: "oklch(30% 0.04 250)" }}
        />

        {/* Total */}
        <span
          className="text-base font-bold flex-shrink-0"
          style={{ color: "white" }}
        >
          {cartItemCount > 0 ? formattedTotal : "Empty cart"}
        </span>

        {/* View Cart */}
        <span
          className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0"
          style={{
            background: "oklch(78% 0.18 195 / 0.18)",
            color: "oklch(78% 0.18 195)",
          }}
        >
          View Cart
        </span>
      </button>
    </div>
  );
}
