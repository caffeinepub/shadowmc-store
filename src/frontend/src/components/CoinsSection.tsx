import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useStoreInfo } from "../hooks/useQueries";
import SuggestionsModal from "./SuggestionsModal";

const INR_PER_USD = 92;

const FALLBACK_BUNDLES = [
  {
    id: "coins-1",
    productId: 1n,
    coins: 500,
    price: 49 / INR_PER_USD,
    inrPrice: 49,
    label: null,
    bonus: null,
  },
  {
    id: "coins-2",
    productId: 2n,
    coins: 1000,
    price: 89 / INR_PER_USD,
    inrPrice: 89,
    label: null,
    bonus: "+100 bonus",
  },
  {
    id: "coins-3",
    productId: 3n,
    coins: 2500,
    price: 199 / INR_PER_USD,
    inrPrice: 199,
    label: "Most Popular",
    bonus: "+400 bonus",
  },
  {
    id: "coins-4",
    productId: 4n,
    coins: 5000,
    price: 349 / INR_PER_USD,
    inrPrice: 349,
    label: "Best Value",
    bonus: "+1,000 bonus",
  },
  {
    id: "coins-5",
    productId: 5n,
    coins: 10000,
    price: 599 / INR_PER_USD,
    inrPrice: 599,
    label: null,
    bonus: "+2,500 bonus",
  },
];

export default function CoinsSection() {
  const { addItem, openCart } = useCart();
  const { data: storeInfo } = useStoreInfo();
  const { formatPriceWithINR } = useCurrency();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [suggestionState, setSuggestionState] = useState<{
    open: boolean;
    itemId: string;
    itemName: string;
  }>({
    open: false,
    itemId: "",
    itemName: "",
  });

  const bundles = storeInfo?.coinBundles?.length
    ? storeInfo.coinBundles.map((b, i) => ({
        ...(FALLBACK_BUNDLES[i] || FALLBACK_BUNDLES[0]),
        id: `coins-${Number(b.product.id)}`,
        productId: b.product.id,
        coins: Number(b.coins),
        price: Number(b.product.priceCents) / 100,
      }))
    : FALLBACK_BUNDLES;

  const handleBuyNow = (
    bundle: (typeof FALLBACK_BUNDLES)[0] & {
      id: string;
      productId: bigint;
      coins: number;
      price: number;
      inrPrice: number;
    },
  ) => {
    addItem({
      id: bundle.id,
      name: `${bundle.coins.toLocaleString()} Coins`,
      price: bundle.price,
      inrPrice: bundle.inrPrice,
      quantity: 1,
      type: "coins",
      productId: bundle.productId,
      coins: bundle.coins,
    });
    setSuggestionState({
      open: true,
      itemId: bundle.id,
      itemName: `${bundle.coins.toLocaleString()} Coins`,
    });
  };

  const handleAddToCart = (
    bundle: (typeof FALLBACK_BUNDLES)[0] & {
      id: string;
      productId: bigint;
      coins: number;
      price: number;
      inrPrice: number;
    },
  ) => {
    addItem({
      id: bundle.id,
      name: `${bundle.coins.toLocaleString()} Coins`,
      price: bundle.price,
      inrPrice: bundle.inrPrice,
      quantity: 1,
      type: "coins",
      productId: bundle.productId,
      coins: bundle.coins,
    });
    openCart();
  };

  const handleSuggestionsClose = () => {
    setSuggestionState((prev) => ({ ...prev, open: false }));
    openCart();
  };

  return (
    <section
      id="coins"
      className="py-24 px-4"
      style={{ background: "oklch(11% 0.02 250)" }}
    >
      <SuggestionsModal
        open={suggestionState.open}
        onClose={handleSuggestionsClose}
        addedItemId={suggestionState.itemId}
        addedItemType="coins"
        addedItemName={suggestionState.itemName}
      />

      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {bundles.map((bundle, index) => {
            const isPopular = bundle.label === "Most Popular";
            const isBestValue = bundle.label === "Best Value";
            const highlight = isPopular
              ? {
                  border: "oklch(78% 0.18 195 / 0.6)",
                  text: "oklch(78% 0.18 195)",
                  bg: "oklch(78% 0.18 195 / 0.1)",
                  glow: "0 0 28px oklch(78% 0.18 195 / 0.4)",
                }
              : isBestValue
                ? {
                    border: "oklch(78% 0.22 70 / 0.6)",
                    text: "oklch(78% 0.22 70)",
                    bg: "oklch(78% 0.22 70 / 0.1)",
                    glow: "0 0 28px oklch(78% 0.22 70 / 0.4)",
                  }
                : {
                    border: "oklch(25% 0.04 250)",
                    text: "oklch(80% 0.01 240)",
                    bg: "oklch(18% 0.03 250)",
                    glow: "0 0 16px oklch(78% 0.22 70 / 0.2)",
                  };
            const isHovered = hoveredId === bundle.id;

            return (
              <div
                key={bundle.id}
                data-ocid={`coins.item.${index + 1}`}
                className="relative rounded-xl border overflow-hidden flex flex-col transition-all duration-200"
                style={{
                  borderColor: highlight.border,
                  background: "oklch(14% 0.025 250)",
                  transform: isHovered ? "translateY(-4px)" : "none",
                  boxShadow: isHovered ? highlight.glow : "none",
                }}
                onMouseEnter={() => setHoveredId(bundle.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {bundle.label && (
                  <div
                    className="text-center py-1.5 text-xs font-pixel"
                    style={{ background: highlight.bg, color: highlight.text }}
                  >
                    {isPopular ? "★ " : "💎 "}
                    {bundle.label}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Coin count — prominent */}
                  <div
                    className="flex flex-col items-center justify-center py-4 mb-3 rounded-lg"
                    style={{
                      background: "oklch(78% 0.22 70 / 0.06)",
                      border: "1px solid oklch(78% 0.22 70 / 0.15)",
                    }}
                  >
                    <span className="text-4xl mb-1">🪙</span>
                    <span
                      className="font-pixel text-xl leading-none"
                      style={{ color: "oklch(78% 0.22 70)" }}
                    >
                      {bundle.coins.toLocaleString()}
                    </span>
                    <span
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(55% 0.08 70)" }}
                    >
                      coins
                    </span>
                  </div>

                  {/* Bonus badge */}
                  {bundle.bonus ? (
                    <div className="flex justify-center mb-3">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "oklch(78% 0.22 70 / 0.12)",
                          border: "1px solid oklch(78% 0.22 70 / 0.3)",
                          color: "oklch(78% 0.22 70)",
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        {bundle.bonus}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-3 h-6" />
                  )}

                  {/* Price */}
                  <div className="text-center mb-5">
                    <span
                      className="font-display text-2xl font-bold"
                      style={{ color: "white" }}
                    >
                      {formatPriceWithINR(bundle.inrPrice)}
                    </span>
                  </div>

                  {/* Buy Now */}
                  <Button
                    data-ocid={`coins.buy.button.${index + 1}`}
                    className="w-full font-semibold transition-all mb-2 hover:brightness-110"
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
                    onClick={() => handleBuyNow(bundle)}
                  >
                    Buy Now
                  </Button>

                  {/* Add to Cart — quick add, no suggestions */}
                  <button
                    type="button"
                    data-ocid={`coins.add_to_cart.button.${index + 1}`}
                    className="w-full text-xs rounded-md px-3 py-1.5 border flex items-center justify-center gap-1.5 transition-all duration-200"
                    style={{
                      background: "transparent",
                      color: "oklch(55% 0.06 250)",
                      borderColor: "oklch(30% 0.04 250)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.color = highlight.text;
                      el.style.borderColor = highlight.border;
                      el.style.background = highlight.bg;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.color = "oklch(55% 0.06 250)";
                      el.style.borderColor = "oklch(30% 0.04 250)";
                      el.style.background = "transparent";
                    }}
                    onClick={() => handleAddToCart(bundle)}
                  >
                    <Plus className="w-3 h-3" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
