import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface LaunchBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function LaunchBanner({
  visible,
  onDismiss,
}: LaunchBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-ocid="launch_banner.section"
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-4"
          style={{
            height: "40px",
            background:
              "linear-gradient(90deg, oklch(52% 0.25 25), oklch(58% 0.24 45), oklch(52% 0.25 25))",
            backgroundSize: "200% 100%",
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 40, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <motion.div
            className="flex items-center gap-2"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <motion.span
              className="text-white font-semibold text-sm text-center select-none"
              animate={{ opacity: [1, 0.85, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              style={{ textShadow: "0 1px 8px oklch(0% 0 0 / 0.4)" }}
            >
              🔥 Launch Sale – 40% OFF on all ranks! Limited time only.
            </motion.span>
          </motion.div>
          <button
            type="button"
            data-ocid="launch_banner.close_button"
            onClick={onDismiss}
            className="absolute right-3 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
