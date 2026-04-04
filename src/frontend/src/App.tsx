import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CartDrawer from "./components/CartDrawer";
import CoinsSection from "./components/CoinsSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import LaunchBanner from "./components/LaunchBanner";
import Navbar from "./components/Navbar";
import PaymentSection from "./components/PaymentSection";
import PurchaseHistory from "./components/PurchaseHistory";
import RanksSection from "./components/RanksSection";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

function StoreApp() {
  const [activeSection, setActiveSection] = useState("home");
  const [bannerVisible, setBannerVisible] = useState(true);

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
      const offset = bannerVisible ? 120 : 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    } else if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const sections = ["home", "ranks", "coins", "payment", "history"];
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

  const topOffset = bannerVisible ? "top-[96px]" : "top-16";

  return (
    <div className="min-h-screen bg-background">
      <LaunchBanner
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
      />
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        bannerVisible={bannerVisible}
      />
      <main
        className={`pt-16 transition-all duration-300 ${topOffset}`}
        style={{ paddingTop: 0, marginTop: bannerVisible ? "96px" : "64px" }}
      >
        <div id="home">
          <Hero onNavigate={handleNavigate} />
        </div>
        <RanksSection />
        <CoinsSection />
        <PaymentSection />
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
      <CurrencyProvider>
        <CartProvider>
          <StoreApp />
        </CartProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
