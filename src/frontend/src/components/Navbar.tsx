import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const { items, setIsOpen } = useCart();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isLoggedIn = loginStatus === "success" && !!identity;

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "ranks", label: "Ranks" },
    { id: "coins", label: "Coins" },
    { id: "history", label: "History" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
      style={{
        background: "oklch(12% 0.02 250 / 0.95)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/shadowmc-logo-transparent.dim_400x120.png"
            alt="ShadowMC"
            className="h-8 w-auto object-contain"
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() => onNavigate(link.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === link.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Button
            data-ocid="nav.cart.button"
            variant="ghost"
            size="icon"
            className="relative hover:text-primary hover:bg-primary/10"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                {cartCount}
              </Badge>
            )}
          </Button>

          {/* Login/Profile */}
          {isLoggedIn ? (
            <Button
              data-ocid="nav.login.button"
              variant="ghost"
              size="sm"
              className="gap-2 hover:text-primary hover:bg-primary/10"
              onClick={clear}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              data-ocid="nav.login.button"
              size="sm"
              className="gap-2 bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
              onClick={login}
              disabled={loginStatus === "logging-in"}
            >
              <User className="w-4 h-4" />
              {loginStatus === "logging-in" ? "Connecting..." : "Login"}
            </Button>
          )}

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() => {
                onNavigate(link.id);
                setMobileOpen(false);
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-all ${
                activeSection === link.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
