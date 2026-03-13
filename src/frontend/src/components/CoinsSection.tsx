import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { useStoreInfo } from "../hooks/useQueries";

const FALLBACK_BUNDLES = [
  {
    id: "coins-1",
    productId: 1n,
    coins: 500,
    price: 1.99,
    label: null,
    bonus: null,
  },
  {
    id: "coins-2",
    productId: 2n,
    coins: 1000,
    price: 3.49,
    label: null,
    bonus: "+50 bonus",
  },
  {
    id: "coins-3",
    productId: 3n,
    coins: 2500,
    price: 7.99,
    label: "Most Popular",
    bonus: "+250 bonus",
  },
  {
    id: "coins-4",
    productId: 4n,
    coins: 5000,
    price: 14.99,
    label: "Best Value",
    bonus: "+750 bonus",
  },
];

export default function CoinsSection() {
  const { addItem } = useCart();
  const { data: storeInfo } = useStoreInfo();

  const bundles = storeInfo?.coinBundles?.length
    ? storeInfo.coinBundles.map((b, i) => ({
        ...(FALLBACK_BUNDLES[i] || FALLBACK_BUNDLES[0]),
        id: `coins-${Number(b.product.id)}`,
        productId: b.product.id,
        coins: Number(b.coins),
        price: Number(b.product.priceCents) / 100,
      }))
    : FALLBACK_BUNDLES;

  return (
    <section
      id="coins"
      className="py-24 px-4"
      style={{ background: "oklch(11% 0.02 250)" }}
    >
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-pixel mb-4"
            style={{
              fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)",
              color: "oklch(78% 0.22 70)",
            }}
          >
            Coin Bundles
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-display">
            Spend coins on cosmetics, items, and in-game perks. More coins =
            more fun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((bundle, index) => {
            const isPopular = bundle.label === "Most Popular";
            const isBestValue = bundle.label === "Best Value";
            const highlight = isPopular
              ? {
                  border: "oklch(78% 0.18 195 / 0.6)",
                  text: "oklch(78% 0.18 195)",
                  bg: "oklch(78% 0.18 195 / 0.1)",
                  glow: "0 0 24px oklch(78% 0.18 195 / 0.4)",
                }
              : isBestValue
                ? {
                    border: "oklch(78% 0.22 70 / 0.6)",
                    text: "oklch(78% 0.22 70)",
                    bg: "oklch(78% 0.22 70 / 0.1)",
                    glow: "0 0 24px oklch(78% 0.22 70 / 0.4)",
                  }
                : {
                    border: "oklch(25% 0.04 250)",
                    text: "oklch(80% 0.01 240)",
                    bg: "oklch(18% 0.03 250)",
                    glow: "none",
                  };
            return (
              <motion.div
                key={bundle.id}
                data-ocid={`coins.item.${index + 1}`}
                className="relative rounded-xl border overflow-hidden flex flex-col"
                style={{
                  borderColor: highlight.border,
                  background: "oklch(14% 0.025 250)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: highlight.glow }}
              >
                {bundle.label && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center py-1 text-xs font-pixel"
                    style={{ background: highlight.bg, color: highlight.text }}
                  >
                    {isPopular ? "★ " : "💎 "}
                    {bundle.label}
                  </div>
                )}

                <div
                  className="p-6 flex flex-col flex-1"
                  style={{ paddingTop: bundle.label ? "2.5rem" : "1.5rem" }}
                >
                  {/* Coin icon + amount */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl animate-float">🪙</div>
                    <div>
                      <div
                        className="font-pixel text-lg"
                        style={{ color: "oklch(78% 0.22 70)" }}
                      >
                        {bundle.coins.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground text-xs">Coins</div>
                    </div>
                  </div>

                  {bundle.bonus && (
                    <div className="flex items-center gap-1 mb-3">
                      <Sparkles
                        className="w-3 h-3"
                        style={{ color: "oklch(78% 0.22 70)" }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "oklch(78% 0.22 70)" }}
                      >
                        {bundle.bonus}
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-6 flex-1">
                    <span className="font-display text-3xl font-bold text-foreground">
                      ${bundle.price.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    data-ocid={`coins.buy.button.${index + 1}`}
                    className="w-full font-semibold transition-all"
                    style={{
                      background:
                        isPopular || isBestValue
                          ? highlight.bg
                          : "oklch(20% 0.03 250)",
                      color:
                        isPopular || isBestValue
                          ? highlight.text
                          : "oklch(80% 0.01 240)",
                      border: `1px solid ${highlight.border}`,
                    }}
                    onClick={() =>
                      addItem({
                        id: bundle.id,
                        name: `${bundle.coins.toLocaleString()} Coins`,
                        price: bundle.price,
                        quantity: 1,
                        type: "coins",
                        productId: bundle.productId,
                        coins: bundle.coins,
                      })
                    }
                  >
                    Buy Now
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
