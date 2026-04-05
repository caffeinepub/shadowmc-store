import { useCurrency } from "../context/CurrencyContext";

export default function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      type="button"
      data-ocid="currency.toggle"
      onClick={toggleCurrency}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border transition-all hover:scale-105 active:scale-95"
      style={{
        background:
          currency === "INR"
            ? "oklch(65% 0.22 145 / 0.15)"
            : "oklch(20% 0.03 250)",
        borderColor:
          currency === "INR"
            ? "oklch(65% 0.22 145 / 0.6)"
            : "oklch(30% 0.04 250)",
        color:
          currency === "INR" ? "oklch(72% 0.2 145)" : "oklch(75% 0.01 240)",
      }}
    >
      <span>{currency === "USD" ? "🇺🇸" : "🇮🇳"}</span>
      <span>{currency === "USD" ? "USD" : "INR"}</span>
      <span className="text-xs opacity-60">↔</span>
    </button>
  );
}
