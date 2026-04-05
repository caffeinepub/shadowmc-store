import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Coins, Copy } from "lucide-react";
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
  const serverIp = "shadowmcgg.enderman.cloud";

  const copyIp = async () => {
    await navigator.clipboard.writeText(serverIp);
    setCopied(true);
    toast.success("Server IP copied!", { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
      style={{ paddingTop: "7rem" }}
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

      {/* Floating particles — CSS animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 rounded-full animate-float-particle"
            style={{
              background: p.color,
              left: p.left,
              top: p.top,
              opacity: 0.6,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="pt-4">
          <img
            src="/assets/shadow_mc_logo_with_pixelated_castle-019d5e56-2b4d-71ed-9b3e-9ea06d890a57.png"
            alt="ShadowMC"
            className="mx-auto mb-6 rounded-full object-cover"
            style={{ width: "220px", height: "220px" }}
          />
        </div>

        <h1
          className="font-pixel text-glow-cyan mb-4"
          style={{
            fontSize: "clamp(1rem, 3vw, 1.75rem)",
            color: "oklch(78% 0.18 195)",
            lineHeight: 1.8,
          }}
        >
          ShadowMC Store
        </h1>

        <p className="text-muted-foreground text-lg mb-8 font-display">
          Buy ranks, coins &amp; exclusive perks to enhance your gameplay
        </p>

        {/* Server IP Badge */}
        <div className="flex items-center justify-center mb-10">
          <button
            type="button"
            onClick={copyIp}
            className="group flex items-center gap-3 px-6 py-3 rounded-full border transition-all hover:scale-105"
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
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          {[
            { value: "5", label: "Rank Tiers" },
            { value: "5", label: "Coin Bundles" },
            { value: "Free", label: "To Join" },
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
        </div>
      </div>

      {/* Scroll indicator — CSS bounce */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-1"
          style={{ borderColor: "oklch(78% 0.18 195 / 0.4)" }}
        >
          <div
            className="w-1 h-2 rounded-full animate-bounce"
            style={{ background: "oklch(78% 0.18 195)" }}
          />
        </div>
      </div>
    </section>
  );
}
