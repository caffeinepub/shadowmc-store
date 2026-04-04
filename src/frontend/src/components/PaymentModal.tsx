import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCheckoutSession } from "../hooks/useQueries";

const UPI_ID = "8008366007@upi";
const INR_PER_USD = 83.5;

const INSTRUCTIONS = [
  "Open {method} app",
  "Send to the UPI ID above",
  "Enter exact amount",
  "Screenshot for your records",
];

type PaymentMethod = {
  id: string;
  name: string;
  shortName: string;
  borderColor: string;
  bgAccent: string;
  textColor: string;
  emoji: string;
  ocid: string;
  isUpi: boolean;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "googlepay",
    name: "Google Pay",
    shortName: "GPay",
    borderColor: "oklch(65% 0.18 145)",
    bgAccent: "oklch(20% 0.04 145)",
    textColor: "oklch(75% 0.18 145)",
    emoji: "🟢",
    ocid: "payment.method.googlepay.button",
    isUpi: true,
  },
  {
    id: "phonepe",
    name: "PhonePe",
    shortName: "PhonePe",
    borderColor: "oklch(60% 0.22 290)",
    bgAccent: "oklch(18% 0.05 290)",
    textColor: "oklch(72% 0.22 290)",
    emoji: "💜",
    ocid: "payment.method.phonepe.button",
    isUpi: true,
  },
  {
    id: "paytm",
    name: "Paytm",
    shortName: "Paytm",
    borderColor: "oklch(62% 0.20 230)",
    bgAccent: "oklch(18% 0.05 230)",
    textColor: "oklch(72% 0.20 230)",
    emoji: "🔵",
    ocid: "payment.method.paytm.button",
    isUpi: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    shortName: "PayPal",
    borderColor: "oklch(72% 0.18 50)",
    bgAccent: "oklch(18% 0.04 220)",
    textColor: "oklch(78% 0.18 50)",
    emoji: "🅿️",
    ocid: "payment.method.paypal.button",
    isUpi: false,
  },
  {
    id: "stripe",
    name: "Pay by Card",
    shortName: "Card",
    borderColor: "oklch(65% 0.12 270)",
    bgAccent: "oklch(18% 0.03 270)",
    textColor: "oklch(72% 0.12 270)",
    emoji: "💳",
    ocid: "payment.method.stripe.button",
    isUpi: false,
  },
];

type Step = 1 | 2 | 3 | 4;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}

export default function PaymentModal({ open, onOpenChange, total }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [copied, setCopied] = useState(false);
  const { clearCart, items } = useCart();
  const { mutateAsync: createSession, isPending: isStripeLoading } =
    useCreateCheckoutSession();
  const { login, identity } = useInternetIdentity();

  // total is in USD (from CartContext). Convert to INR for display.
  const inrTotal = Math.round(total * INR_PER_USD);

  const handleMethodSelect = async (method: PaymentMethod) => {
    if (method.id === "stripe") {
      if (!identity) {
        toast.error("Please login to checkout");
        login();
        return;
      }
      try {
        const shoppingItems = items.map((item) => ({
          productName: item.name,
          currency: "usd",
          quantity: BigInt(item.quantity),
          priceInCents: BigInt(Math.round(item.price * 100)),
          productDescription:
            item.type === "rank"
              ? `${item.name} - Minecraft Rank`
              : `${item.name} - In-game Currency`,
        }));
        const successUrl = `${window.location.origin}?checkout=success`;
        const cancelUrl = `${window.location.origin}?checkout=cancelled`;
        const checkoutUrl = await createSession({
          items: shoppingItems,
          successUrl,
          cancelUrl,
        });
        window.location.href = checkoutUrl;
      } catch (_err) {
        toast.error("Failed to start checkout. Please try again.");
      }
      return;
    }
    setSelectedMethod(method);
    setStep(2);
  };

  const handleCopyUpi = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    let valid = true;
    if (!username.trim()) {
      setUsernameError("Please enter your Minecraft username");
      valid = false;
    } else {
      setUsernameError("");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
    if (valid) setStep(4);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSelectedMethod(null);
      setUsername("");
      setUsernameError("");
      setEmail("");
      setEmailError("");
    }, 300);
  };

  const handleCloseAndClear = () => {
    clearCart();
    handleClose();
  };

  const stepLabels = ["Method", "Pay", "Details", "Done"];

  const instructions = selectedMethod
    ? [
        `Open ${selectedMethod.name} app`,
        "Send to the UPI ID above",
        `Enter exact amount ₹${inrTotal.toLocaleString("en-IN")}`,
        "Screenshot for your records",
      ]
    : INSTRUCTIONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="payment.modal"
        className="max-w-lg w-full p-0 overflow-hidden"
        style={{
          background: "oklch(12% 0.025 250)",
          border: "1px solid oklch(25% 0.04 250)",
          boxShadow: "0 25px 80px oklch(0% 0 0 / 0.8)",
        }}
      >
        {/* Step indicator */}
        <div
          className="flex items-center justify-center gap-2 px-6 pt-5 pb-3"
          style={{ borderBottom: "1px solid oklch(20% 0.03 250)" }}
        >
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{
                      background: done
                        ? "oklch(65% 0.18 145)"
                        : active
                          ? "oklch(78% 0.18 195)"
                          : "oklch(22% 0.03 250)",
                      color:
                        done || active
                          ? "oklch(10% 0.02 250)"
                          : "oklch(50% 0.04 250)",
                    }}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : n}
                  </div>
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: active
                        ? "oklch(78% 0.18 195)"
                        : "oklch(45% 0.04 250)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className="w-8 h-px mb-3"
                    style={{
                      background:
                        step > n
                          ? "oklch(65% 0.18 145)"
                          : "oklch(25% 0.03 250)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Choose method */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <DialogHeader className="mb-5">
                <DialogTitle
                  className="text-lg font-bold"
                  style={{ color: "oklch(90% 0.04 250)" }}
                >
                  Choose Payment Method
                </DialogTitle>
                <p className="text-sm" style={{ color: "oklch(55% 0.05 250)" }}>
                  Total:{" "}
                  <span
                    style={{ color: "oklch(78% 0.18 195)" }}
                    className="font-bold"
                  >
                    ₹{inrTotal.toLocaleString("en-IN")}
                  </span>
                </p>
              </DialogHeader>
              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((method) => (
                  <motion.button
                    type="button"
                    key={method.id}
                    data-ocid={method.ocid}
                    whileHover={{ scale: 1.01, x: 3 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleMethodSelect(method)}
                    disabled={method.id === "stripe" && isStripeLoading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 group"
                    style={{
                      background: method.bgAccent,
                      border: `1px solid ${method.borderColor}30`,
                      borderLeft: `3px solid ${method.borderColor}`,
                    }}
                  >
                    <span className="text-2xl">{method.emoji}</span>
                    <div className="flex-1">
                      <div
                        className="font-semibold text-sm"
                        style={{ color: method.textColor }}
                      >
                        {method.name}
                        {method.id === "stripe" && (
                          <span className="ml-2 text-xs opacity-60">
                            (Stripe)
                          </span>
                        )}
                      </div>
                      {method.isUpi && (
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(50% 0.04 250)" }}
                        >
                          UPI payment
                        </div>
                      )}
                      {method.id === "paypal" && (
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(50% 0.04 250)" }}
                        >
                          International
                        </div>
                      )}
                      {method.id === "stripe" && (
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(50% 0.04 250)" }}
                        >
                          Credit / Debit card
                        </div>
                      )}
                    </div>
                    {method.id === "stripe" && isStripeLoading ? (
                      <Loader2
                        className="w-4 h-4 animate-spin"
                        style={{ color: method.textColor }}
                      />
                    ) : method.id === "stripe" ? (
                      <CreditCard
                        className="w-4 h-4"
                        style={{ color: method.textColor }}
                      />
                    ) : (
                      <ArrowLeft
                        className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: method.textColor }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Payment instructions */}
          {step === 2 && selectedMethod && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <DialogHeader className="mb-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs mb-3 hover:opacity-80 transition-opacity w-fit"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <DialogTitle
                  className="text-lg font-bold"
                  style={{ color: "oklch(90% 0.04 250)" }}
                >
                  Pay via {selectedMethod.name}
                </DialogTitle>
              </DialogHeader>

              {/* Amount */}
              <div
                className="rounded-xl p-4 mb-4 text-center"
                style={{
                  background: "oklch(16% 0.03 250)",
                  border: "1px solid oklch(25% 0.04 250)",
                }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  Amount to pay
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "oklch(78% 0.18 195)" }}
                >
                  ₹{inrTotal.toLocaleString("en-IN")}
                </p>
              </div>

              {/* UPI ID */}
              <p
                className="text-xs font-medium mb-2"
                style={{ color: "oklch(55% 0.05 250)" }}
              >
                Send to UPI ID:
              </p>
              <div
                className="flex items-center gap-2 p-3 rounded-xl mb-4"
                style={{
                  background: "oklch(15% 0.04 195)",
                  border: "1px solid oklch(50% 0.15 195 / 0.5)",
                  boxShadow: "0 0 16px oklch(78% 0.18 195 / 0.12)",
                }}
              >
                <span
                  className="flex-1 font-mono text-sm font-semibold tracking-wide"
                  style={{ color: "oklch(85% 0.12 195)" }}
                >
                  {UPI_ID}
                </span>
                <Button
                  data-ocid="payment.copy_upi.button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUpi}
                  className="h-7 px-2 transition-all"
                  style={{
                    color: copied
                      ? "oklch(65% 0.18 145)"
                      : "oklch(78% 0.18 195)",
                  }}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>

              {/* Instructions */}
              <div
                className="rounded-xl p-4 mb-5 space-y-2"
                style={{
                  background: "oklch(16% 0.025 250)",
                  border: "1px solid oklch(22% 0.03 250)",
                }}
              >
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: "oklch(65% 0.06 250)" }}
                >
                  How to pay:
                </p>
                {instructions.map((instruction, i) => (
                  <div key={instruction} className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: "oklch(25% 0.04 250)",
                        color: "oklch(78% 0.18 195)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "oklch(60% 0.05 250)" }}
                    >
                      {instruction}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                data-ocid="payment.paid.button"
                className="w-full font-semibold gap-2"
                style={{
                  background: "oklch(65% 0.18 145)",
                  color: "oklch(10% 0.02 145)",
                  boxShadow: "0 0 16px oklch(65% 0.18 145 / 0.35)",
                }}
                onClick={() => setStep(3)}
              >
                <Check className="w-4 h-4" /> I've completed the payment
              </Button>
            </motion.div>
          )}

          {/* Step 3 — Username + Email */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <DialogHeader className="mb-5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs mb-3 hover:opacity-80 transition-opacity w-fit"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <DialogTitle
                  className="text-xl font-bold"
                  style={{ color: "oklch(90% 0.04 250)" }}
                >
                  Almost done! 🎮
                </DialogTitle>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  Tell us your Minecraft username and email.
                </p>
              </DialogHeader>

              <div className="space-y-4 mb-5">
                {/* Username */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="minecraft-username"
                    className="text-xs font-semibold"
                    style={{ color: "oklch(65% 0.06 250)" }}
                  >
                    Your Minecraft Username
                  </label>
                  <Input
                    id="minecraft-username"
                    data-ocid="payment.username.input"
                    placeholder="Steve"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (usernameError) setUsernameError("");
                    }}
                    className="text-sm"
                    style={{
                      background: "oklch(16% 0.03 250)",
                      border: usernameError
                        ? "1px solid oklch(65% 0.2 25)"
                        : "1px solid oklch(28% 0.04 250)",
                      color: "oklch(88% 0.04 250)",
                    }}
                  />
                  {usernameError && (
                    <p
                      data-ocid="payment.username.error_state"
                      className="text-xs"
                      style={{ color: "oklch(65% 0.2 25)" }}
                    >
                      {usernameError}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="player-email"
                    className="text-xs font-semibold"
                    style={{ color: "oklch(65% 0.06 250)" }}
                  >
                    Your Email Address
                  </label>
                  <Input
                    id="player-email"
                    data-ocid="payment.email.input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className="text-sm"
                    style={{
                      background: "oklch(16% 0.03 250)",
                      border: emailError
                        ? "1px solid oklch(65% 0.2 25)"
                        : "1px solid oklch(28% 0.04 250)",
                      color: "oklch(88% 0.04 250)",
                    }}
                  />
                  {emailError && (
                    <p
                      data-ocid="payment.email.error_state"
                      className="text-xs"
                      style={{ color: "oklch(65% 0.2 25)" }}
                    >
                      {emailError}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="rounded-xl p-3 mb-5"
                style={{
                  background: "oklch(16% 0.04 195 / 0.4)",
                  border: "1px solid oklch(50% 0.12 195 / 0.25)",
                }}
              >
                <p className="text-xs" style={{ color: "oklch(62% 0.08 195)" }}>
                  💡 Rank / coins will be added to your account within a few
                  minutes after we verify your payment.
                </p>
              </div>

              <Button
                data-ocid="payment.submit.button"
                className="w-full font-semibold gap-2"
                style={{
                  background: "oklch(78% 0.18 195)",
                  color: "oklch(10% 0.02 250)",
                  boxShadow: "0 0 16px oklch(78% 0.18 195 / 0.4)",
                }}
                onClick={handleSubmit}
              >
                Submit Order
              </Button>
            </motion.div>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "oklch(25% 0.06 145)",
                    boxShadow: "0 0 40px oklch(65% 0.18 145 / 0.4)",
                  }}
                >
                  <CheckCircle2
                    className="w-10 h-10"
                    style={{ color: "oklch(65% 0.18 145)" }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "oklch(90% 0.04 250)" }}
                >
                  Order Received!
                </h2>
                <p
                  className="text-sm mb-1"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  Your payment is being verified. Rank/coins will be added to
                </p>
                <p
                  className="text-base font-bold mb-1"
                  style={{ color: "oklch(78% 0.18 195)" }}
                >
                  {username}
                </p>
                <p
                  className="text-xs mb-6"
                  style={{ color: "oklch(50% 0.04 250)" }}
                >
                  Confirmation sent to {email}. Contact us on Discord if you
                  have any issues.
                </p>

                <Button
                  data-ocid="payment.success.close_button"
                  className="w-full font-semibold"
                  style={{
                    background: "oklch(65% 0.18 145)",
                    color: "oklch(10% 0.02 145)",
                    boxShadow: "0 0 16px oklch(65% 0.18 145 / 0.35)",
                  }}
                  onClick={handleCloseAndClear}
                >
                  Close & Back to Store
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
