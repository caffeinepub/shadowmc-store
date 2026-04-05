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
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useUserInfo } from "../context/UserInfoContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCheckoutSession } from "../hooks/useQueries";
import { createRawActorWithConfig } from "../rawActor";
import {
  saveLocalOrder,
  updateLocalOrderBackendId,
} from "../utils/localOrders";

const UPI_ID = "8008366007@upi";
const INR_PER_USD = 92;

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

type Step = 1 | 2 | 3 | 4 | 5;

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
  const { userInfo } = useUserInfo();
  const [username, setUsername] = useState(() => userInfo.minecraftUsername);
  const [usernameError, setUsernameError] = useState("");
  const [email, setEmail] = useState(() => userInfo.playerEmail);
  const [emailError, setEmailError] = useState("");
  const [copied, setCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<
    string | null
  >(null);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearCart, items } = useCart();
  const { mutateAsync: createSession, isPending: isStripeLoading } =
    useCreateCheckoutSession();
  const { login, identity } = useInternetIdentity();
  const { actor } = useActor();

  const inrTotal = Math.round(total * INR_PER_USD);

  useEffect(() => {
    if (open) {
      if (userInfo.minecraftUsername) setUsername(userInfo.minecraftUsername);
      if (userInfo.playerEmail) setEmail(userInfo.playerEmail);
    }
  }, [open, userInfo.minecraftUsername, userInfo.playerEmail]);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrl) {
        URL.revokeObjectURL(screenshotPreviewUrl);
      }
    };
  }, [screenshotPreviewUrl]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (screenshotPreviewUrl) {
        URL.revokeObjectURL(screenshotPreviewUrl);
      }
      setScreenshot(file);
      setScreenshotPreviewUrl(URL.createObjectURL(file));
    }
  };

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
    if (valid) {
      if (actor && identity && !identity.getPrincipal().isAnonymous()) {
        try {
          actor
            .saveCallerUserProfile({
              id: identity.getPrincipal(),
              username: username.trim(),
            })
            .catch(() => {});
        } catch {
          // silently ignore
        }
      }

      const backendItems = items.map((i) => ({
        name: i.name,
        quantity: BigInt(i.quantity),
        priceINR: BigInt(i.inrPrice ?? Math.round(i.price * INR_PER_USD)),
      }));

      const localOrderId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const submitOrder = async (screenshotBase64: string) => {
        saveLocalOrder({
          id: localOrderId,
          timestamp: Date.now(),
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            priceINR: i.inrPrice ?? Math.round(i.price * 92),
          })),
          totalINR: inrTotal,
          paymentMethod: selectedMethod?.name ?? "UPI",
          username: username.trim(),
          email: email.trim(),
          verified: false,
        });

        try {
          const rawActor = await createRawActorWithConfig();
          const backendIdBigInt = await rawActor.submitManualOrder(
            username.trim(),
            email.trim(),
            backendItems,
            BigInt(inrTotal),
            selectedMethod?.name ?? "UPI",
            screenshotBase64,
          );
          const backendId = Number(backendIdBigInt);
          updateLocalOrderBackendId(localOrderId, backendId);
        } catch (err) {
          console.warn("Failed to save order to backend:", err);
        }
      };

      if (screenshot) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = (e.target?.result as string) ?? "";
          submitOrder(base64);
        };
        reader.onerror = () => {
          submitOrder("");
        };
        reader.readAsDataURL(screenshot);
      } else {
        submitOrder("");
      }

      setStep(5);
      setShowHistoryPopup(true);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSelectedMethod(null);
      setUsernameError("");
      setEmailError("");
      setScreenshot(null);
      setShowHistoryPopup(false);
      if (screenshotPreviewUrl) {
        URL.revokeObjectURL(screenshotPreviewUrl);
        setScreenshotPreviewUrl(null);
      }
    }, 300);
  };

  const handleCloseAndClear = () => {
    clearCart();
    handleClose();
  };

  const stepLabels = ["Method", "Pay", "Proof", "Details", "Done"];

  const instructions = selectedMethod
    ? [
        `Open ${selectedMethod.name} app`,
        "Send to the UPI ID above",
        `Enter exact amount \u20b9${inrTotal.toLocaleString("en-IN")}`,
        "Take a screenshot for your records",
      ]
    : [];

  return (
    <>
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
              const n = (i + 1) as Step;
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
                      className="w-6 h-px mb-3"
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

          {/* Step 1 — Choose method */}
          {step === 1 && (
            <div className="p-6">
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
                    \u20b9{inrTotal.toLocaleString("en-IN")}
                  </span>
                </p>
              </DialogHeader>
              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    type="button"
                    key={method.id}
                    data-ocid={method.ocid}
                    onClick={() => handleMethodSelect(method)}
                    disabled={method.id === "stripe" && isStripeLoading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 group hover:translate-x-1 hover:brightness-110"
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
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Payment instructions */}
          {step === 2 && selectedMethod && (
            <div className="p-6">
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

              {items.length > 0 && (
                <div
                  className="rounded-xl p-3 mb-4 space-y-1.5"
                  style={{
                    background: "oklch(16% 0.025 250)",
                    border: "1px solid oklch(22% 0.03 250)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-2"
                    style={{ color: "oklch(65% 0.06 250)" }}
                  >
                    Order Summary:
                  </p>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span style={{ color: "oklch(75% 0.05 250)" }}>
                        {item.name} \u00d7 {item.quantity}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "oklch(82% 0.08 250)" }}
                      >
                        \u20b9
                        {(
                          (item.inrPrice ??
                            Math.round(item.price * INR_PER_USD)) *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="rounded-xl p-4 mb-4 text-center"
                style={{
                  background: "oklch(16% 0.03 250)",
                  border: "1px solid oklch(25% 0.04 250)",
                }}
              >
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: "oklch(72% 0.10 195)" }}
                >
                  \ud83d\udcb3 Complete your payment to:{" "}
                  <span className="font-mono">{UPI_ID}</span>
                </p>
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
                  \u20b9{inrTotal.toLocaleString("en-IN")}
                </p>
              </div>

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
                <Check className="w-4 h-4" /> I&apos;ve completed the payment
              </Button>
            </div>
          )}

          {/* Step 3 — Upload Screenshot */}
          {step === 3 && (
            <div className="p-6">
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
                  Upload Payment Screenshot
                </DialogTitle>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  Please upload your payment screenshot as proof
                </p>
              </DialogHeader>

              <label
                htmlFor="screenshot-upload"
                className="rounded-xl mb-5 overflow-hidden cursor-pointer transition-all hover:opacity-90 block"
                style={{
                  border: screenshot
                    ? "2px solid oklch(65% 0.18 145 / 0.6)"
                    : "2px dashed oklch(40% 0.06 250)",
                  background: screenshot
                    ? "oklch(14% 0.03 145 / 0.3)"
                    : "oklch(16% 0.025 250)",
                }}
              >
                {screenshotPreviewUrl ? (
                  <div className="relative">
                    <img
                      src={screenshotPreviewUrl}
                      alt="Payment screenshot preview"
                      className="w-full object-contain rounded-xl"
                      style={{ maxHeight: "200px" }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 py-2"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(10% 0.02 250 / 0.9), transparent)",
                      }}
                    >
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: "oklch(80% 0.08 250)" }}
                      >
                        {screenshot?.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(20% 0.04 250)" }}
                    >
                      <Upload
                        className="w-6 h-6"
                        style={{ color: "oklch(60% 0.08 250)" }}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "oklch(68% 0.06 250)" }}
                      >
                        Click to upload screenshot
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(48% 0.04 250)" }}
                      >
                        PNG, JPG or JPEG
                      </p>
                    </div>
                  </div>
                )}
              </label>

              <input
                id="screenshot-upload"
                ref={fileInputRef}
                data-ocid="payment.upload_button"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleScreenshotChange}
              />

              {screenshot && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
                  style={{
                    background: "oklch(18% 0.04 145 / 0.4)",
                    border: "1px solid oklch(55% 0.15 145 / 0.3)",
                  }}
                >
                  <Check
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(65% 0.18 145)" }}
                  />
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: "oklch(70% 0.10 145)" }}
                  >
                    {screenshot.name}
                  </span>
                  <span
                    className="text-xs ml-auto flex-shrink-0"
                    style={{ color: "oklch(50% 0.04 250)" }}
                  >
                    {(screenshot.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}

              <Button
                data-ocid="payment.proof.button"
                className="w-full font-semibold gap-2"
                disabled={!screenshot}
                style={{
                  background: screenshot
                    ? "oklch(78% 0.18 195)"
                    : "oklch(28% 0.04 250)",
                  color: screenshot
                    ? "oklch(10% 0.02 250)"
                    : "oklch(45% 0.04 250)",
                  boxShadow: screenshot
                    ? "0 0 16px oklch(78% 0.18 195 / 0.4)"
                    : "none",
                }}
                onClick={() => setStep(4)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 4 — Username + Email */}
          {step === 4 && (
            <div className="p-6">
              <DialogHeader className="mb-5">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 text-xs mb-3 hover:opacity-80 transition-opacity w-fit"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <DialogTitle
                  className="text-xl font-bold"
                  style={{ color: "oklch(90% 0.04 250)" }}
                >
                  Almost done! \ud83c\udfae
                </DialogTitle>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(55% 0.05 250)" }}
                >
                  Confirm your Minecraft username and email.
                </p>
              </DialogHeader>

              <div className="space-y-4 mb-5">
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
                  \ud83d\udca1 Rank / coins will be added to your account within
                  a few minutes after we verify your payment.
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
                Complete Order
              </Button>
            </div>
          )}

          {/* Step 5 — Success */}
          {step === 5 && (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
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
              </div>

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
                Confirmation sent to {email}. Contact us on Discord if you have
                any issues.
              </p>

              <Button
                data-ocid="payment.success.close_button"
                className="w-full font-semibold mb-3"
                style={{
                  background: "oklch(65% 0.18 145)",
                  color: "oklch(10% 0.02 145)",
                  boxShadow: "0 0 16px oklch(65% 0.18 145 / 0.35)",
                }}
                onClick={handleCloseAndClear}
              >
                Close &amp; Back to Store
              </Button>

              <a
                data-ocid="payment.success.discord.button"
                href="https://discord.gg/rcKTBgQU"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-md font-semibold text-sm transition-all hover:opacity-90"
                style={{
                  border: "1px solid oklch(52% 0.22 285 / 0.6)",
                  color: "oklch(72% 0.18 285)",
                  background: "oklch(52% 0.22 285 / 0.12)",
                }}
              >
                \ud83c\udfae Join our Discord server for updates &amp; support
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* "Go to History" info popup */}
      {showHistoryPopup && (
        <div
          data-ocid="payment.history_popup"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm mx-4"
          style={{
            pointerEvents: "auto",
            animation: "slideUpFade 0.3s ease-out",
          }}
        >
          <div
            className="relative rounded-2xl px-5 py-4 shadow-2xl"
            style={{
              background: "oklch(14% 0.03 195)",
              border: "1px solid oklch(55% 0.18 195 / 0.45)",
              boxShadow:
                "0 8px 40px oklch(0% 0 0 / 0.6), 0 0 0 1px oklch(55% 0.18 195 / 0.15)",
            }}
          >
            <button
              type="button"
              data-ocid="payment.history_popup.close_button"
              onClick={() => setShowHistoryPopup(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
              style={{
                background: "oklch(22% 0.04 250)",
                border: "1px solid oklch(35% 0.05 250)",
                color: "oklch(65% 0.06 250)",
              }}
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: "oklch(78% 0.18 195 / 0.15)",
                  border: "1px solid oklch(78% 0.18 195 / 0.3)",
                }}
              >
                <span className="text-lg">\ud83d\udccb</span>
              </div>
              <div>
                <p
                  className="text-sm font-bold mb-1"
                  style={{ color: "oklch(88% 0.06 250)" }}
                >
                  Order submitted!
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(62% 0.06 250)" }}
                >
                  Go to the{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "oklch(78% 0.18 195)" }}
                  >
                    History
                  </span>{" "}
                  section and{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "oklch(78% 0.18 195)" }}
                  >
                    refresh your page
                  </span>{" "}
                  to see your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
