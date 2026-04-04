import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import PaymentModal from "./PaymentModal";

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    isOpen,
    setIsOpen,
  } = useCart();
  const { currency } = useCurrency();
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Compute display total based on currency
  const displayTotal =
    currency === "INR"
      ? items.reduce((sum, item) => {
          const inr = item.inrPrice ?? Math.round(item.price * 83.5);
          return sum + inr * item.quantity;
        }, 0)
      : total;

  const displayTotalLabel =
    currency === "INR"
      ? `₹${displayTotal.toLocaleString("en-IN")}`
      : `$${displayTotal.toFixed(2)}`;

  const handleCheckout = () => {
    setPaymentOpen(true);
  };

  return (
    <>
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
                  {items.reduce((s, i) => s + i.quantity, 0)} item
                  {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <AnimatePresence>
              {items.length === 0 ? (
                <motion.div
                  data-ocid="cart.empty_state"
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
                  {items.map((item, index) => {
                    const unitInr =
                      item.inrPrice ?? Math.round(item.price * 83.5);
                    const lineTotal =
                      currency === "INR"
                        ? `₹${(unitInr * item.quantity).toLocaleString("en-IN")}`
                        : `$${(item.price * item.quantity).toFixed(2)}`;
                    const unitLabel =
                      currency === "INR"
                        ? `₹${unitInr.toLocaleString("en-IN")} each`
                        : `$${item.price.toFixed(2)} each`;

                    return (
                      <motion.div
                        key={item.id}
                        data-ocid={`cart.item.${index + 1}`}
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
                            {item.type} · {unitLabel}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            data-ocid={`cart.item.button.${index + 1}`}
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 rounded"
                            style={{ color: "oklch(70% 0.04 250)" }}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-foreground text-sm font-semibold w-5 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 rounded"
                            style={{ color: "oklch(78% 0.18 195)" }}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[3.5rem]">
                          <p className="font-semibold text-sm text-foreground">
                            {lineTotal}
                          </p>
                        </div>

                        <Button
                          data-ocid={`cart.delete_button.${index + 1}`}
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    );
                  })}
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
                  {displayTotalLabel}
                </span>
              </div>
              <Button
                data-ocid="cart.checkout.primary_button"
                className="w-full font-semibold text-base gap-2"
                style={{
                  background: "oklch(78% 0.18 195)",
                  color: "white",
                  boxShadow: "0 0 16px oklch(78% 0.18 195 / 0.4)",
                }}
                onClick={handleCheckout}
              >
                Checkout — {displayTotalLabel}
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

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={total}
      />
    </>
  );
}
