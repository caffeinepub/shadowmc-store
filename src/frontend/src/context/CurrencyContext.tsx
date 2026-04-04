import { createContext, useContext, useState } from "react";

const INR_TO_USD = 1 / 92;

type Currency = "USD" | "INR";

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  formatPrice: (inrPrice: number) => string;
  formatPriceWithINR: (usdPrice: number, inrPrice?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("INR");

  const toggleCurrency = () =>
    setCurrency((c) => (c === "USD" ? "INR" : "USD"));

  // inrPrice is the canonical price in INR
  const formatPrice = (inrPrice: number) => {
    if (currency === "INR") {
      return `₹${Math.round(inrPrice).toLocaleString("en-IN")}`;
    }
    const usd = inrPrice * INR_TO_USD;
    return `$${usd.toFixed(2)}`;
  };

  // Legacy helper: accepts a usdPrice and optional inrPrice
  // When inrPrice is provided it's used for both display modes
  const formatPriceWithINR = (usdPrice: number, inrPrice?: number) => {
    const inr = inrPrice ?? usdPrice / INR_TO_USD;
    return formatPrice(inr);
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, toggleCurrency, formatPrice, formatPriceWithINR }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
