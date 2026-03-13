import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Coins, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const PARTICLE_COLORS = [
  "oklch(78% 0.18 195)",
  "oklch(60% 0.22 305)",
  "oklch(78% 0.22 70)",
  "oklch(78% 0.18 195)",
  "oklch(60% 0.22 305)",
  "oklch(78% 0.22 70)",
  "oklch(78% 0.18 195)",
  "oklch(60% 0.22 305)",
  "oklch(78% 0.22 70)",
  "oklch(78% 0.18 195)",
  "oklch(60% 0.22 305)",
  "oklch(78% 0.22 70)",
];

const PARTICLES = PARTICLE_COLORS.map((color, i) => ({
  id: `particle-${i}`,
  color,
  left: `${10 + i * 7.5}%`,
  top: `${20 + ((i * 37) % 60)}%`,
  duration: 3 + i * 0.4,
}));

interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [copied, setCopied] = useState(false);
  const serverIp = "shadowmcnet.falix.gg";

  const copyIp = async () => {
    await navigator.clipboard.writeText(serverIp);
    setCopied(true);
    toast.success("Server IP copied!", { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
      style={{ paddingTop: "4rem" }}
    >
      {/* Hero background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/shadowmc-hero-bg.dim_1920x600.jpg')",
        }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(12% 0.02 250 / 0.6) 0%, oklch(12% 0.02 250 / 0.85) 50%, oklch(12% 0.02 250 / 1) 100%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: p.color,
              left: p.left,
              top: p.top,
              opacity: 0.6,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: p.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img
            src="/assets/generated/shadowmc-logo-transparent.dim_400x120.png"
            alt="ShadowMC"
            className="mx-auto mb-6 h-20 w-auto object-contain"
          />
        </motion.div>

        <motion.h1
          className="font-pixel text-glow-cyan mb-4"
          style={{
            fontSize: "clamp(1rem, 3vw, 1.75rem)",
            color: "oklch(78% 0.18 195)",
            lineHeight: 1.8,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          ShadowMC Store
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg mb-8 font-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Buy ranks, coins &amp; exclusive perks to enhance your gameplay
        </motion.p>

        {/* Server IP Badge */}
        <motion.div
          className="flex items-center justify-center mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            type="button"
            onClick={copyIp}
            className="group flex items-center gap-3 px-6 py-3 rounded-full border transition-all"
            style={{
              background: "oklch(15% 0.025 250 / 0.8)",
              borderColor: "oklch(78% 0.18 195 / 0.5)",
              boxShadow: "0 0 20px oklch(78% 0.18 195 / 0.2)",
            }}
          >
            <span className="text-xs text-muted-foreground font-pixel">IP</span>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: "oklch(78% 0.18 195)" }}
            >
              {serverIp}
            </span>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all"
              style={{
                background: "oklch(78% 0.18 195 / 0.15)",
                color: "oklch(78% 0.18 195)",
              }}
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            data-ocid="hero.ranks.primary_button"
            size="lg"
            className="gap-2 text-base font-semibold px-8"
            style={{
              background: "oklch(78% 0.18 195)",
              color: "oklch(10% 0.02 250)",
              boxShadow: "0 0 24px oklch(78% 0.18 195 / 0.5)",
            }}
            onClick={() => onNavigate("ranks")}
          >
            Browse Ranks <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            data-ocid="hero.coins.secondary_button"
            size="lg"
            variant="outline"
            className="gap-2 text-base font-semibold px-8 border-2"
            style={{
              borderColor: "oklch(78% 0.22 70 / 0.6)",
              color: "oklch(78% 0.22 70)",
              background: "oklch(78% 0.22 70 / 0.05)",
            }}
            onClick={() => onNavigate("coins")}
          >
            <Coins className="w-4 h-4" /> Get Coins
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            { value: "4", label: "Rank Tiers" },
            { value: "4", label: "Coin Bundles" },
            { value: "24/7", label: "Online" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="font-pixel text-2xl text-glow-cyan"
                style={{ color: "oklch(78% 0.18 195)" }}
              >
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
      >
        <div
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-1"
          style={{ borderColor: "oklch(78% 0.18 195 / 0.4)" }}
        >
          <motion.div
            className="w-1 h-2 rounded-full"
            style={{ background: "oklch(78% 0.18 195)" }}
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </motion.div>
    </section>
  );
}
