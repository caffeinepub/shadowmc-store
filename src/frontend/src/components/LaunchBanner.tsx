import { X } from "lucide-react";

interface LaunchBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function LaunchBanner({
  visible,
  onDismiss,
}: LaunchBannerProps) {
  return (
    <div
      data-ocid="launch_banner.section"
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-4 overflow-hidden transition-all duration-300"
      style={{
        height: visible ? "40px" : "0px",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        background:
          "linear-gradient(90deg, oklch(52% 0.25 25), oklch(58% 0.24 45), oklch(52% 0.25 25))",
      }}
    >
      <span
        className="text-white font-semibold text-sm text-center select-none"
        style={{ textShadow: "0 1px 8px oklch(0% 0 0 / 0.4)" }}
      >
        🔥 Launch Sale – 40% OFF on all ranks! Limited time only.
      </span>
      <button
        type="button"
        data-ocid="launch_banner.close_button"
        onClick={onDismiss}
        className="absolute right-3 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
