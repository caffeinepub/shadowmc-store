import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const UPI_ID = "8008366007@upi";

const PAYMENT_METHODS = [
  { id: "gpay", name: "Google Pay", emoji: "🟢", color: "oklch(65% 0.18 145)" },
  { id: "phonepe", name: "PhonePe", emoji: "💜", color: "oklch(60% 0.22 290)" },
  { id: "paytm", name: "Paytm", emoji: "🔵", color: "oklch(62% 0.20 230)" },
  { id: "paypal", name: "PayPal", emoji: "🅿️", color: "oklch(72% 0.18 50)" },
  { id: "upi", name: "UPI", emoji: "💸", color: "oklch(78% 0.18 195)" },
];

export default function PaymentSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="payment"
      data-ocid="payment.section"
      className="py-24 px-4"
      style={{ background: "oklch(11% 0.02 250)" }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2
            className="font-pixel mb-4"
            style={{
              fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)",
              color: "oklch(78% 0.18 195)",
            }}
          >
            Payment Methods
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-display">
            All major Indian payment apps accepted. Fast &amp; secure.
          </p>
        </div>

        {/* Payment method pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
              style={{
                background: "oklch(14% 0.025 250)",
                borderColor: `${method.color}40`,
                borderLeft: `3px solid ${method.color}`,
                color: method.color,
              }}
            >
              <span className="text-lg">{method.emoji}</span>
              {method.name}
            </div>
          ))}
        </div>

        {/* UPI ID box */}
        <div
          className="max-w-lg mx-auto rounded-2xl p-6 text-center"
          style={{
            background: "oklch(14% 0.025 250)",
            border: "1px solid oklch(50% 0.15 195 / 0.4)",
            boxShadow: "0 0 40px oklch(78% 0.18 195 / 0.08)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "oklch(55% 0.05 250)" }}
          >
            UPI ID
          </p>
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
            style={{
              background: "oklch(11% 0.02 250)",
              border: "1px solid oklch(40% 0.12 195 / 0.5)",
            }}
          >
            <span
              className="font-mono font-bold text-lg tracking-wide"
              style={{ color: "oklch(85% 0.12 195)" }}
            >
              {UPI_ID}
            </span>
            <Button
              data-ocid="payment.copy_upi.button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 gap-1.5 font-medium text-xs"
              style={{
                background: copied
                  ? "oklch(25% 0.06 145)"
                  : "oklch(20% 0.04 195)",
                color: copied ? "oklch(65% 0.18 145)" : "oklch(78% 0.18 195)",
                border: `1px solid ${copied ? "oklch(45% 0.12 145 / 0.5)" : "oklch(45% 0.12 195 / 0.5)"}`,
              }}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs" style={{ color: "oklch(50% 0.04 250)" }}>
            Send payment to this UPI ID using Google Pay, PhonePe, Paytm, or any
            UPI app. Then proceed to checkout and submit your Minecraft
            username.
          </p>
        </div>
      </div>
    </section>
  );
}
