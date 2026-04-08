import { useEffect, useRef, useState } from "react";
import { type Currency, useCurrency } from "../context/CurrencyContext";

export default function CurrencyToggle() {
  const { currency, setCurrency, currencies, currencyNames, symbols, rates } =
    useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const exampleINR = 349;

  return (
    <div ref={ref} className="relative" data-ocid="currency.toggle_wrapper">
      <button
        type="button"
        data-ocid="currency.toggle"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border transition-all hover:scale-105 active:scale-95"
        style={{
          background: "oklch(20% 0.03 250)",
          borderColor: "oklch(78% 0.18 195 / 0.5)",
          color: "oklch(78% 0.18 195)",
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{currency}</span>
        <span className="text-xs opacity-70">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full mt-2 right-0 z-50 rounded-xl border overflow-hidden shadow-2xl min-w-[220px]"
          style={{
            background: "oklch(13% 0.025 250)",
            borderColor: "oklch(30% 0.04 250)",
          }}
        >
          {currencies.map((c: Currency) => {
            const isSelected = c === currency;
            const converted = exampleINR * rates[c];
            const preview =
              c === "INR"
                ? `${exampleINR}`
                : `${symbols[c]}${converted.toFixed(2)}`;

            return (
              <button
                key={c}
                role="menuitem"
                type="button"
                data-ocid={`currency.option.${c.toLowerCase()}`}
                onClick={() => {
                  setCurrency(c);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/5 text-left"
                style={{
                  background: isSelected
                    ? "oklch(78% 0.18 195 / 0.15)"
                    : undefined,
                  color: isSelected
                    ? "oklch(78% 0.18 195)"
                    : "oklch(85% 0.02 250)",
                  borderLeft: isSelected
                    ? "2px solid oklch(78% 0.18 195)"
                    : "2px solid transparent",
                }}
              >
                <span className="font-semibold font-mono">{c}</span>
                <span className="text-xs opacity-60 ml-2 truncate flex-1 px-2 text-left">
                  {currencyNames[c]}
                </span>
                <span
                  className="font-mono text-xs tabular-nums"
                  style={{
                    color: isSelected
                      ? "oklch(78% 0.18 195)"
                      : "oklch(65% 0.04 250)",
                  }}
                >
                  {preview}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
