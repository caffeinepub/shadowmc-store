import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Crown, Shield, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { useStoreInfo } from "../hooks/useQueries";

const FALLBACK_RANKS = [
  {
    id: "rank-1",
    productId: 1n,
    name: "VIP",
    tier: "vip",
    price: 4.99,
    colorClass: "rank-vip",
    glowClass: "glow-vip",
    icon: Shield,
    perks: ["/fly", "/kit vip", "Color chat", "Reserved slot"],
    popular: false,
  },
  {
    id: "rank-2",
    productId: 2n,
    name: "MVP",
    tier: "mvp",
    price: 9.99,
    colorClass: "rank-mvp",
    glowClass: "glow-mvp",
    icon: Star,
    perks: [
      "All VIP perks",
      "/nick",
      "/hat",
      "Particle effects",
      "Custom join message",
    ],
    popular: true,
  },
  {
    id: "rank-3",
    productId: 3n,
    name: "Elite",
    tier: "elite",
    price: 19.99,
    colorClass: "rank-elite",
    glowClass: "glow-elite",
    icon: Zap,
    perks: [
      "All MVP perks",
      "/speed",
      "/god",
      "Custom prefix",
      "VIP gamemode access",
    ],
    popular: false,
  },
  {
    id: "rank-4",
    productId: 4n,
    name: "Legend",
    tier: "legend",
    price: 34.99,
    colorClass: "rank-legend",
    glowClass: "glow-legend",
    icon: Crown,
    perks: [
      "All Elite perks",
      "/tp anywhere",
      "VIP lounge access",
      "Exclusive cosmetics",
      "Priority support",
    ],
    popular: false,
  },
];

const RANK_STYLES: Record<
  string,
  { border: string; text: string; bg: string; glow: string }
> = {
  vip: {
    border: "oklch(72% 0.2 145 / 0.6)",
    text: "oklch(72% 0.2 145)",
    bg: "oklch(72% 0.2 145 / 0.08)",
    glow: "0 0 24px oklch(72% 0.2 145 / 0.4)",
  },
  mvp: {
    border: "oklch(60% 0.22 250 / 0.6)",
    text: "oklch(60% 0.22 250)",
    bg: "oklch(60% 0.22 250 / 0.08)",
    glow: "0 0 24px oklch(60% 0.22 250 / 0.4)",
  },
  elite: {
    border: "oklch(70% 0.22 305 / 0.6)",
    text: "oklch(70% 0.22 305)",
    bg: "oklch(70% 0.22 305 / 0.08)",
    glow: "0 0 24px oklch(70% 0.22 305 / 0.4)",
  },
  legend: {
    border: "oklch(78% 0.22 70 / 0.6)",
    text: "oklch(78% 0.22 70)",
    bg: "oklch(78% 0.22 70 / 0.08)",
    glow: "0 0 24px oklch(78% 0.22 70 / 0.4)",
  },
};

export default function RanksSection() {
  const { addItem } = useCart();
  const { data: storeInfo } = useStoreInfo();

  const ranks = storeInfo?.ranks?.length
    ? storeInfo.ranks.map((r, i) => ({
        ...(FALLBACK_RANKS[i] || FALLBACK_RANKS[0]),
        id: `rank-${Number(r.product.id)}`,
        productId: r.product.id,
        name: r.product.name,
        tier: r.tier.toLowerCase(),
        price: Number(r.product.priceCents) / 100,
      }))
    : FALLBACK_RANKS;

  return (
    <section id="ranks" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
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
              color: "oklch(78% 0.18 195)",
            }}
          >
            Server Ranks
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-display">
            Unlock exclusive perks and rise above the rest. Choose the rank that
            fits your playstyle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ranks.map((rank, index) => {
            const style = RANK_STYLES[rank.tier] || RANK_STYLES.vip;
            const Icon = rank.icon || Shield;
            return (
              <motion.div
                key={rank.id}
                data-ocid={`ranks.item.${index + 1}`}
                className="relative rounded-xl border overflow-hidden flex flex-col"
                style={{
                  borderColor: style.border,
                  background: "oklch(14% 0.025 250)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: style.glow }}
              >
                {rank.popular && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center py-1 text-xs font-pixel"
                    style={{ background: style.bg, color: style.text }}
                  >
                    ★ Most Popular
                  </div>
                )}

                <div
                  className="p-6 flex flex-col flex-1"
                  style={{ paddingTop: rank.popular ? "2.5rem" : "1.5rem" }}
                >
                  {/* Rank header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: style.text }} />
                    </div>
                    <div>
                      <h3
                        className="font-pixel text-sm"
                        style={{ color: style.text }}
                      >
                        {rank.name}
                      </h3>
                      <div className="text-muted-foreground text-xs">Rank</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <span className="font-display text-3xl font-bold text-foreground">
                      ${rank.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      one-time
                    </span>
                  </div>

                  {/* Perks */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {rank.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: style.text }}
                        />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {/* Buy button */}
                  <Button
                    data-ocid={`ranks.buy.button.${index + 1}`}
                    className="w-full font-semibold transition-all"
                    style={{
                      background: style.bg,
                      color: style.text,
                      border: `1px solid ${style.border}`,
                    }}
                    onClick={() =>
                      addItem({
                        id: rank.id,
                        name: `${rank.name} Rank`,
                        price: rank.price,
                        quantity: 1,
                        type: "rank",
                        productId: rank.productId,
                        tier: rank.tier,
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
