import { motion } from "motion/react";
import { useIsAdmin } from "../hooks/useQueries";
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
  const { data: isAdmin } = useIsAdmin();

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
          className="flex items-center flex-shrink-0"
          aria-label="ShadowMC Home"
        >
          <img
            src="/assets/shadow_mc_in_the_mist-019d5d61-4deb-74fc-bad1-ec6c1bc949bb.png"
            alt="ShadowMC"
            className="h-10 w-auto object-contain"
            style={{ maxWidth: "160px" }}
          />
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
          {isAdmin === true && (
            <button
              type="button"
              data-ocid="nav.admin.link"
              onClick={() => {
                window.location.href = "?page=admin";
              }}
              className="text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: "oklch(55% 0.1 250)" }}
            >
              Admin
            </button>
          )}
          <CurrencyToggle />
          <motion.a
            href="https://discord.gg/rcKTBgQU"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="nav.discord.link"
            aria-label="Join Discord"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border transition-all"
            style={{
              background: "oklch(45% 0.18 270 / 0.2)",
              borderColor: "oklch(55% 0.18 270 / 0.6)",
              color: "oklch(75% 0.15 270)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
              aria-label="Discord"
            >
              <title>Discord</title>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.044.03.086.063.108a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            <span className="hidden sm:inline">Discord</span>
          </motion.a>
        </div>
      </div>
    </header>
  );
}
