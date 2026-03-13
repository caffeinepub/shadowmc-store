import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExternalLink, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCheckoutSession } from "../hooks/useQueries";

export default function CartDrawer() {
  const { items, removeItem, clearCart, total, isOpen, setIsOpen } = useCart();
  const { mutateAsync: createSession, isPending } = useCreateCheckoutSession();
  const { login, identity } = useInternetIdentity();

  const handleCheckout = async () => {
    if (!identity) {
      toast.error("Please login to checkout");
      login();
      return;
    }

    try {
      const shoppingItems = items.map((item) => ({
        productName: item.name,
        currency: "usd",
        quantity: BigInt(item.quantity),
        priceInCents: BigInt(Math.round(item.price * 100)),
        productDescription:
          item.type === "rank"
            ? `${item.name} - Minecraft Rank`
            : `${item.name} - In-game Currency`,
      }));

      const successUrl = `${window.location.origin}?checkout=success`;
      const cancelUrl = `${window.location.origin}?checkout=cancelled`;

      const checkoutUrl = await createSession({
        items: shoppingItems,
        successUrl,
        cancelUrl,
      });
      window.location.href = checkoutUrl;
    } catch (_err) {
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        data-ocid="cart.sheet"
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
        style={{
          background: "oklch(13% 0.025 250)",
          borderLeft: "1px solid oklch(25% 0.04 250)",
        }}
      >
        <SheetHeader
          className="px-6 py-4 border-b"
          style={{ borderColor: "oklch(25% 0.04 250)" }}
        >
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart
              className="w-5 h-5"
              style={{ color: "oklch(78% 0.18 195)" }}
            />
            Your Cart
            {items.length > 0 && (
              <span className="ml-auto text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence>
            {items.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center h-48 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  Add some ranks or coins!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{
                      borderColor: "oklch(25% 0.04 250)",
                      background: "oklch(16% 0.025 250)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs capitalize">
                        {item.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-muted-foreground text-xs">
                          ×{item.quantity}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <div
            className="px-6 py-4 border-t"
            style={{ borderColor: "oklch(25% 0.04 250)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-xl font-bold text-foreground">
                ${total.toFixed(2)}
              </span>
            </div>
            <Button
              data-ocid="cart.checkout.primary_button"
              className="w-full font-semibold text-base gap-2"
              style={{
                background: "oklch(78% 0.18 195)",
                color: "oklch(10% 0.02 250)",
                boxShadow: "0 0 16px oklch(78% 0.18 195 / 0.4)",
              }}
              onClick={handleCheckout}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" /> Checkout — $
                  {total.toFixed(2)}
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full mt-2 text-muted-foreground hover:text-destructive text-sm"
              onClick={clearCart}
            >
              Clear cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
