import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CartDrawer from "./components/CartDrawer";
import CoinsSection from "./components/CoinsSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import PurchaseHistory from "./components/PurchaseHistory";
import RanksSection from "./components/RanksSection";
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

function StoreApp() {
  const [activeSection, setActiveSection] = useState("home");

  // Handle checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") {
      toast.success("🎉 Purchase successful! Check your purchase history.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (checkout === "cancelled") {
      toast.error("Checkout was cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    } else if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Track active section via scroll
  useEffect(() => {
    const sections = ["home", "ranks", "coins", "history"];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 200) {
        setActiveSection("home");
        return;
      }
      for (const id of sections.slice(1)) {
        const el = document.getElementById(id);
        if (el) {
          const { top, bottom } = el.getBoundingClientRect();
          if (top <= 120 && bottom > 120) {
            setActiveSection(id);
            return;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
      <main>
        <div id="home">
          <Hero onNavigate={handleNavigate} />
        </div>
        <RanksSection />
        <CoinsSection />
        <PurchaseHistory />
      </main>
      <Footer />
      <CartDrawer />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(16% 0.025 250)",
            border: "1px solid oklch(25% 0.04 250)",
            color: "oklch(95% 0.01 240)",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <StoreApp />
      </CartProvider>
    </QueryClientProvider>
  );
}
