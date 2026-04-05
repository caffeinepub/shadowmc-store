import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CartDrawer from "./components/CartDrawer";
import CartSummaryBar from "./components/CartSummaryBar";
import CoinsSection from "./components/CoinsSection";
import EntryPopup from "./components/EntryPopup";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import InformationSection from "./components/InformationSection";
import LaunchBanner from "./components/LaunchBanner";
import Navbar from "./components/Navbar";
import PaymentSection from "./components/PaymentSection";
import PurchaseHistory from "./components/PurchaseHistory";
import RanksSection from "./components/RanksSection";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { UserInfoProvider, useUserInfo } from "./context/UserInfoContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

function isAdminPage(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get("page") === "admin" || window.location.hash === "#admin";
}

function StoreApp() {
  const [activeSection, setActiveSection] = useState("home");
  const [bannerVisible, setBannerVisible] = useState(true);
  const { userInfo } = useUserInfo();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") {
      toast.success("Purchase successful! Check your purchase history.");
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
    const sections = [
      "home",
      "ranks",
      "coins",
      "payment",
      "history",
      "information",
    ];
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
    <div
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage:
          "url('/assets/mystical_castle_by_the_glowing_river-019d5d61-5346-751b-853e-7bc20a863d8d.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(8% 0.02 250 / 0.75) 0%, oklch(8% 0.02 250 / 0.85) 40%, oklch(8% 0.02 250 / 0.92) 100%)",
        }}
      />

      <div className="relative z-10">
        {/* Entry popup — shown on every new browser session */}
        {!userInfo.hasEnteredStore && <EntryPopup />}

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
          <InformationSection />
        </main>
        <Footer />
        <CartDrawer />
        {/* Sticky cart summary bar — shown at bottom when items are in cart */}
        <CartSummaryBar />
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
    </div>
  );
}

export default function App() {
  if (isAdminPage()) {
    return (
      <QueryClientProvider client={queryClient}>
        <AdminPanel />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <CurrencyProvider>
          <UserInfoProvider>
            <CartProvider>
              <StoreApp />
            </CartProvider>
          </UserInfoProvider>
        </CurrencyProvider>
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}
