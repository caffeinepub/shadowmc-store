import { motion } from "motion/react";
import CurrencyToggle from "./CurrencyToggle";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  bannerVisible: boolean;
}

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "ranks", label: "Ranks" },
  { id: "coins", label: "Coins" },
  { id: "payment", label: "Payment" },
  { id: "history", label: "History" },
];

export default function Navbar({
  activeSection,
  onNavigate,
  bannerVisible,
}: NavbarProps) {
  return (
    <header
      className="fixed left-0 right-0 z-50 border-b transition-all duration-300"
      style={{
        top: bannerVisible ? "40px" : "0px",
        background: "oklch(10% 0.02 250 / 0.85)",
        backdropFilter: "blur(12px)",
        borderColor: "oklch(22% 0.04 250)",
      }}
    >
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          data-ocid="nav.home.link"
          onClick={() => onNavigate("home")}
          className="font-pixel text-sm tracking-wide"
          style={{ color: "oklch(78% 0.18 195)" }}
        >
          ShadowMC
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() => onNavigate(link.id)}
              className="text-sm font-medium transition-colors relative"
              style={{
                color:
                  activeSection === link.id
                    ? "oklch(78% 0.18 195)"
                    : "oklch(65% 0.02 240)",
              }}
            >
              {link.label}
              {activeSection === link.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "oklch(78% 0.18 195)" }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <CurrencyToggle />
        </div>
      </div>
    </header>
  );
}
