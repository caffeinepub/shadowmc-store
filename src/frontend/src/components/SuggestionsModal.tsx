import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";

const INR_PER_USD = 92;

const ALL_RANKS = [
  {
    id: "rank-1",
    name: "VIP Rank",
    inrPrice: 99,
    type: "rank" as const,
    productId: 1n,
    tier: "vip",
  },
  {
    id: "rank-2",
    name: "MVP Rank",
    inrPrice: 199,
    type: "rank" as const,
    productId: 2n,
    tier: "mvp",
  },
  {
    id: "rank-3",
    name: "Elite Rank",
    inrPrice: 349,
    type: "rank" as const,
    productId: 3n,
    tier: "elite",
  },
  {
    id: "rank-4",
    name: "Legend Rank",
    inrPrice: 599,
    type: "rank" as const,
    productId: 4n,
    tier: "legend",
  },
];

const ALL_COINS = [
  {
    id: "coins-1",
    name: "500 Coins",
    inrPrice: 49,
    coins: 500,
    type: "coins" as const,
    productId: 1n,
    label: null,
  },
  {
    id: "coins-2",
    name: "1,000 Coins",
    inrPrice: 89,
    coins: 1000,
    type: "coins" as const,
    productId: 2n,
    label: null,
  },
  {
    id: "coins-3",
    name: "2,500 Coins",
    inrPrice: 199,
    coins: 2500,
    type: "coins" as const,
    productId: 3n,
    label: "Most Popular",
  },
  {
    id: "coins-4",
    name: "5,000 Coins",
    inrPrice: 349,
    coins: 5000,
    type: "coins" as const,
    productId: 4n,
    label: "Best Value",
  },
  {
    id: "coins-5",
    name: "10,000 Coins",
    inrPrice: 599,
    coins: 10000,
    type: "coins" as const,
    productId: 5n,
    label: null,
  },
];

interface SuggestionItem {
  id: string;
  name: string;
  inrPrice: number;
  type: "rank" | "coins";
  productId: bigint;
  tier?: string;
  coins?: number;
  badge?: string;
}

function getSuggestions(
  addedItemId: string,
  addedItemType: "rank" | "coins",
): SuggestionItem[] {
  if (addedItemType === "rank") {
    return [
      { ...ALL_COINS[1], badge: undefined },
      { ...ALL_COINS[2], badge: "Most Popular" },
    ];
  }
  const suggestions: SuggestionItem[] = [];
  if (addedItemId !== "rank-1") {
    suggestions.push({ ...ALL_RANKS[0], badge: "Great Combo" });
  }
  const currentBundle = ALL_COINS.find((c) => c.id === addedItemId);
  const currentIndex = currentBundle ? ALL_COINS.indexOf(currentBundle) : 0;
  const nextBundle = ALL_COINS[currentIndex + 1];
  if (nextBundle) {
    suggestions.push({ ...nextBundle, badge: "More Value" });
  }
  return suggestions.slice(0, 2);
}

const RANK_COLORS: Record<string, string> = {
  vip: "oklch(72% 0.2 145)",
  mvp: "oklch(60% 0.22 250)",
  elite: "oklch(70% 0.22 305)",
  legend: "oklch(78% 0.22 70)",
};

interface SuggestionsModalProps {
  open: boolean;
  onClose: () => void;
  addedItemId: string;
  addedItemType: "rank" | "coins";
  addedItemName: string;
}

export default function SuggestionsModal({
  open,
  onClose,
  addedItemId,
  addedItemType,
  addedItemName,
}: SuggestionsModalProps) {
  const { addItem, items } = useCart();
  const { formatPrice } = useCurrency();

  const cartItemIds = new Set(items.map((i) => i.id));
  const suggestions = getSuggestions(addedItemId, addedItemType).filter(
    (s) => !cartItemIds.has(s.id),
  );

  const handleAddSuggestion = (suggestion: SuggestionItem) => {
    addItem({
      id: suggestion.id,
      name: suggestion.name,
      price: suggestion.inrPrice / INR_PER_USD,
      inrPrice: suggestion.inrPrice,
      quantity: 1,
      type: suggestion.type,
      productId: suggestion.productId,
      ...(suggestion.tier ? { tier: suggestion.tier } : {}),
      ...(suggestion.coins ? { coins: suggestion.coins } : {}),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="suggestions.modal"
        className="max-w-md w-full p-0 overflow-hidden"
        style={{
          background: "oklch(14% 0.025 250)",
          border: "1px solid oklch(25% 0.04 250)",
          boxShadow: "0 25px 80px oklch(0% 0 0 / 0.7)",
        }}
      >
        {/* Header */}
        <DialogHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(78% 0.18 195 / 0.15)" }}
                >
                  <ShoppingCart
                    className="w-3 h-3"
                    style={{ color: "oklch(78% 0.18 195)" }}
                  />
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(78% 0.18 195)" }}
                >
                  Added to cart!
                </span>
              </div>
              <DialogTitle
                className="text-base font-bold"
                style={{ color: "oklch(90% 0.04 250)" }}
              >
                Complete your setup 🎮
              </DialogTitle>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(50% 0.05 250)" }}
              >
                Players who bought{" "}
                <span style={{ color: "oklch(78% 0.18 195)" }}>
                  {addedItemName}
                </span>{" "}
                also added:
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Suggestion cards */}
        {suggestions.length > 0 ? (
          <div className="px-5 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => {
                const isRank = suggestion.type === "rank";
                const rankColor = suggestion.tier
                  ? (RANK_COLORS[suggestion.tier] ?? "oklch(78% 0.18 195)")
                  : "oklch(78% 0.18 195)";
                const accentColor = isRank ? rankColor : "oklch(78% 0.18 195)";
                const inCart = cartItemIds.has(suggestion.id);

                return (
                  <div
                    key={suggestion.id}
                    data-ocid={`suggestions.item.${index + 1}`}
                    className="relative rounded-xl border flex flex-col overflow-hidden"
                    style={{
                      borderColor: `${accentColor.slice(0, -1)} / 0.4)`.replace(
                        "oklch(",
                        "oklch(",
                      ),
                      background: "oklch(16% 0.025 250)",
                    }}
                  >
                    {suggestion.badge && (
                      <div
                        className="text-center py-0.5 text-[10px] font-pixel"
                        style={{
                          background: `${accentColor.replace(")", " / 0.15)")}`,
                          color: accentColor,
                        }}
                      >
                        <Sparkles className="w-2.5 h-2.5 inline mr-1" />
                        {suggestion.badge}
                      </div>
                    )}

                    <div className="p-3 flex flex-col flex-1">
                      <div className="mb-1">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: accentColor }}
                        >
                          {isRank ? "🛡️" : "🪙"} {suggestion.name}
                        </div>
                      </div>

                      <div
                        className="text-lg font-bold mb-3"
                        style={{ color: "white" }}
                      >
                        {formatPrice(suggestion.inrPrice)}
                      </div>

                      <Button
                        data-ocid={`suggestions.add.button.${index + 1}`}
                        size="sm"
                        disabled={inCart}
                        className="w-full text-xs font-semibold h-8 transition-all"
                        style={{
                          background: inCart
                            ? "oklch(20% 0.03 250)"
                            : `${accentColor.replace(")", " / 0.15)")}`,
                          color: inCart ? "oklch(45% 0.04 250)" : accentColor,
                          border: `1px solid ${accentColor.replace(")", " / 0.4)")}`,
                        }}
                        onClick={() =>
                          !inCart && handleAddSuggestion(suggestion)
                        }
                      >
                        {inCart ? "✓ In Cart" : "+ Add to Cart"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4">
            <p
              className="text-xs text-center"
              style={{ color: "oklch(50% 0.05 250)" }}
            >
              You&apos;ve already added the suggested items!
            </p>
          </div>
        )}

        {/* Divider + CTA */}
        <div
          className="px-5 pb-5 pt-2"
          style={{ borderTop: "1px solid oklch(20% 0.03 250)" }}
        >
          <Button
            data-ocid="suggestions.continue.button"
            className="w-full font-semibold gap-2"
            style={{
              background: "oklch(78% 0.18 195)",
              color: "oklch(10% 0.02 250)",
              boxShadow: "0 0 16px oklch(78% 0.18 195 / 0.35)",
            }}
            onClick={onClose}
          >
            <ShoppingCart className="w-4 h-4" />
            Continue to Cart →
          </Button>
          <p
            className="text-center text-xs mt-2"
            style={{ color: "oklch(40% 0.04 250)" }}
          >
            or close to keep shopping
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
