import { Button } from "@/components/ui/button";
import { Check, Crown, Shield, Star, Youtube, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useStoreInfo } from "../hooks/useQueries";

const INR_PER_USD = 92;

const RANK_IMAGES: Record<string, string> = {
  vip: "/assets/generated/rank-vip-transparent.dim_200x200.png",
  mvp: "/assets/generated/rank-mvp-transparent.dim_200x200.png",
  elite: "/assets/generated/rank-elite-transparent.dim_200x200.png",
  legend: "/assets/generated/rank-legend-transparent.dim_200x200.png",
};

const FALLBACK_RANKS = [
  {
    id: "rank-1",
    productId: 1n,
    name: "VIP",
    tier: "vip",
    price: 99,
    icon: Shield,
    perks: ["/fly", "/kit vip", "Color chat", "Reserved slot"],
    popular: false,
    description: "",
  },
  {
    id: "rank-2",
    productId: 2n,
    name: "MVP",
    tier: "mvp",
    price: 199,
    icon: Star,
    perks: [
      "All VIP perks",
      "/nick",
      "/hat",
      "Particle effects",
      "Custom join message",
    ],
    popular: true,
    description: "",
  },
  {
    id: "rank-3",
    productId: 3n,
    name: "Elite",
    tier: "elite",
    price: 349,
    icon: Zap,
    perks: [
      "All MVP perks",
      "/speed",
      "/god",
      "Custom prefix",
      "VIP gamemode access",
    ],
    popular: false,
    description: "",
  },
  {
    id: "rank-4",
    productId: 4n,
    name: "Legend",
    tier: "legend",
    price: 599,
    icon: Crown,
    perks: [
      "All Elite perks",
      "/tp anywhere",
      "VIP lounge access",
      "Exclusive cosmetics",
      "Priority support",
    ],
    popular: false,
    description: "",
  },
  {
    id: "rank-5",
    productId: 5n,
    name: "Media",
    tier: "media",
    price: 1999,
    icon: Youtube,
    perks: [
      "Custom [Media] prefix",
      "Exclusive media lounge",
      "Priority support",
      "Special cosmetics",
      "Recognition badge",
    ],
    popular: false,
    description:
      "Get this rank FREE by uploading YouTube videos about the server with good views!",
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
  media: {
    border: "oklch(80% 0.22 85 / 0.6)",
    text: "oklch(80% 0.22 85)",
    bg: "oklch(80% 0.22 85 / 0.08)",
    glow: "0 0 24px oklch(80% 0.22 85 / 0.4)",
  },
};

export default function RanksSection() {
  const { addItem } = useCart();
  const { data: storeInfo } = useStoreInfo();
  const { formatPrice } = useCurrency();

  const ranks = storeInfo?.ranks?.length
    ? [
        ...storeInfo.ranks.map((r, i) => ({
          ...(FALLBACK_RANKS[i] || FALLBACK_RANKS[0]),
          id: `rank-${Number(r.product.id)}`,
          productId: r.product.id,
          name: r.product.name,
          tier: r.tier.toLowerCase(),
          price: Number(r.product.priceCents) / 100,
        })),
        // Always append the Media rank locally
        FALLBACK_RANKS[4],
      ]
    : FALLBACK_RANKS;

  return (
    <section
      id="ranks"
      className="py-24 px-4"
      style={{ background: "oklch(12% 0.02 250)" }}
    >
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {ranks.map((rank, index) => {
            const style = RANK_STYLES[rank.tier] || RANK_STYLES.vip;
            const Icon = rank.icon || Shield;
            const rankImage = RANK_IMAGES[rank.tier];
            const isMedia = rank.tier === "media";
            return (
              <motion.div
                key={rank.id}
                data-ocid={`ranks.item.${index + 1}`}
                className="relative rounded-xl border overflow-hidden flex flex-col"
                style={{
                  borderColor: style.border,
                  background: "oklch(14% 0.025 250)",
                  boxShadow: isMedia ? style.glow : undefined,
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: style.glow }}
              >
                {rank.popular && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center py-1 text-xs font-pixel z-10"
                    style={{ background: style.bg, color: style.text }}
                  >
                    ★ Most Popular
                  </div>
                )}

                {isMedia && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center py-1 text-xs font-pixel z-10"
                    style={{
                      background: "oklch(45% 0.25 25 / 0.9)",
                      color: "white",
                    }}
                  >
                    🎬 FREE via YouTube!
                  </div>
                )}

                {rankImage && (
                  <div
                    className="relative flex items-center justify-center pb-2"
                    style={{
                      paddingTop: rank.popular ? "2.5rem" : "1.5rem",
                      background: `radial-gradient(ellipse at center, ${style.bg} 0%, transparent 70%)`,
                    }}
                  >
                    <motion.img
                      src={rankImage}
                      alt={`${rank.name} rank`}
                      className="w-24 h-24 object-contain"
                      style={{ filter: `drop-shadow(0 0 12px ${style.text})` }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                <div
                  className="p-5 flex flex-col flex-1"
                  style={{
                    paddingTop: isMedia
                      ? "2.5rem"
                      : rankImage
                        ? "0.75rem"
                        : "1.25rem",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {!rankImage && (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: style.text }}
                        />
                      </div>
                    )}
                    {isMedia && (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: style.text }}
                        />
                      </div>
                    )}
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

                  {rank.description && (
                    <p
                      className="text-xs mb-3"
                      style={{ color: "oklch(65% 0.12 85)" }}
                    >
                      {rank.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <motion.span
                      key={formatPrice(rank.price)}
                      className="font-display text-2xl font-bold"
                      style={{ color: "white" }}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatPrice(rank.price)}
                    </motion.span>
                    <span className="text-muted-foreground text-xs ml-1">
                      one-time
                    </span>
                  </div>

                  <ul className="space-y-1.5 mb-5 flex-1">
                    {rank.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Check
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: style.text }}
                        />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <Button
                    data-ocid={`ranks.buy.button.${index + 1}`}
                    className="w-full font-semibold transition-all text-sm"
                    style={{
                      background: style.bg,
                      color: style.text,
                      border: `1px solid ${style.border}`,
                    }}
                    onClick={() =>
                      addItem({
                        id: rank.id,
                        name: `${rank.name} Rank`,
                        price: rank.price / INR_PER_USD,
                        inrPrice: rank.price,
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

        {/* Media Rank info section */}
        <motion.div
          data-ocid="ranks.media_info.section"
          className="mt-12 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: "oklch(14% 0.025 250)",
            border: "1px solid oklch(45% 0.25 25 / 0.5)",
            boxShadow: "0 0 40px oklch(45% 0.25 25 / 0.1)",
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(45% 0.25 25 / 0.15)",
                border: "1px solid oklch(45% 0.25 25 / 0.5)",
              }}
            >
              <Youtube
                className="w-8 h-8"
                style={{ color: "oklch(60% 0.25 25)" }}
              />
            </div>
            <div className="flex-1">
              <h3
                className="font-pixel text-base mb-2"
                style={{ color: "oklch(80% 0.22 85)" }}
              >
                🎬 Earn Media Rank for FREE
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xl">
                Upload YouTube videos or Shorts about Shadow MC. If your video
                performs well, you can apply for Media Rank.
              </p>
              <Button
                data-ocid="ranks.media_apply.button"
                variant="outline"
                size="sm"
                className="font-semibold"
                style={{
                  borderColor: "oklch(45% 0.25 25 / 0.7)",
                  color: "oklch(65% 0.25 25)",
                  background: "oklch(45% 0.25 25 / 0.08)",
                }}
                onClick={() =>
                  window.open("https://discord.gg/sNYGSQ3p", "_blank")
                }
              >
                Apply for Media Rank →
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
