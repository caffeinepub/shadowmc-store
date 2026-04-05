import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUserInfo } from "../context/UserInfoContext";

export default function CartSummaryBar() {
  const { items, openCart } = useCart();
  const { userInfo } = useUserInfo();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + (item.inrPrice ?? 0) * item.quantity,
    0,
  );
  const hasCartItems = items.length > 0;
  const username = userInfo.minecraftUsername;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50"
      style={{
        transform: `translateX(-50%) translateY(${hasCartItems ? "0" : "80px"})`,
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: hasCartItems ? 1 : 0,
        pointerEvents: hasCartItems ? "auto" : "none",
      }}
    >
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
        {username ? (
          <span
            className="text-sm font-medium max-w-[120px] truncate"
            style={{ color: "oklch(65% 0.06 250)" }}
          >
            {username}
          </span>
        ) : (
          <span
            className="text-sm font-medium"
            style={{ color: "oklch(55% 0.04 250)" }}
          >
            Guest
          </span>
        )}

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
          &#x20B9;{cartTotal.toLocaleString("en-IN")}
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
