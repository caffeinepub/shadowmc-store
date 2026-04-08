import { createContext, useContext, useState } from "react";

export type Currency =
  | "INR"
  | "USD"
  | "CAD"
  | "GBP"
  | "EUR"
  | "AUD"
  | "AED"
  | "SGD";

export const RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  CAD: 0.016,
  GBP: 0.0095,
  EUR: 0.011,
  AUD: 0.018,
  AED: 0.044,
  SGD: 0.016,
};

export const SYMBOLS: Record<Currency, string> = {
  INR: "",
  USD: "$",
  CAD: "CA$",
  GBP: "£",
  EUR: "€",
  AUD: "A$",
  AED: "د.إ",
  SGD: "S$",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: "Indian Rupee",
  USD: "US Dollar",
  CAD: "Canadian Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  AUD: "Australian Dollar",
  AED: "UAE Dirham",
  SGD: "Singapore Dollar",
};

export const currencies: Currency[] = [
  "INR",
  "USD",
  "CAD",
  "GBP",
  "EUR",
  "AUD",
  "AED",
  "SGD",
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountINR: number) => string;
  formatPriceWithINR: (amountINR: number) => string;
  currencies: Currency[];
  rates: Record<Currency, number>;
  symbols: Record<Currency, string>;
  currencyNames: Record<Currency, string>;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

function getSavedCurrency(): Currency {
  try {
    const saved = localStorage.getItem("shadowmc_currency") as Currency | null;
    if (saved && currencies.includes(saved)) return saved;
  } catch {
    // ignore
  }
  return "INR";
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(getSavedCurrency);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("shadowmc_currency", c);
    } catch {
      // ignore
    }
  };

  const formatPrice = (amountINR: number): string => {
    if (currency === "INR") {
      return `${Math.round(amountINR).toLocaleString("en-IN")}`;
    }
    const rate = RATES[currency];
    const converted = amountINR * rate;
    const symbol = SYMBOLS[currency];
    return `${symbol}${converted.toFixed(2)}`;
  };

  // alias
  const formatPriceWithINR = formatPrice;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        formatPriceWithINR,
        currencies,
        rates: RATES,
        symbols: SYMBOLS,
        currencyNames: CURRENCY_NAMES,
      }}
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
