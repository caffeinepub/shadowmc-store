import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function InformationSection() {
  const [emailCopied, setEmailCopied] = useState(false);
  const supportEmail = "shadowmcstore@gmail.com";

  const copyEmail = async () => {
    await navigator.clipboard.writeText(supportEmail);
    setEmailCopied(true);
    toast.success("Email copied!", { duration: 2000 });
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <section
      id="information"
      className="py-24 px-4"
      style={{ background: "oklch(12% 0.02 250)" }}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2
            className="font-pixel mb-4"
            style={{
              fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)",
              color: "oklch(78% 0.18 195)",
            }}
          >
            Information
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Need help? Reach out via email or join our Discord community.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Support Email Card */}
          <div
            data-ocid="information.email.card"
            className="rounded-2xl border p-6 transition-all duration-200 hover:border-[oklch(78%_0.18_195_/_0.5)]"
            style={{
              background: "oklch(14% 0.025 250)",
              borderColor: "oklch(78% 0.18 195 / 0.25)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "oklch(78% 0.18 195 / 0.12)",
                  border: "1px solid oklch(78% 0.18 195 / 0.3)",
                }}
              >
                <Mail
                  className="w-5 h-5"
                  style={{ color: "oklch(78% 0.18 195)" }}
                />
              </div>
              <div>
                <p
                  className="font-pixel text-xs"
                  style={{ color: "oklch(78% 0.18 195)" }}
                >
                  Support Email
                </p>
                <p className="text-muted-foreground text-xs">
                  Response within 24h
                </p>
              </div>
            </div>
            <p
              className="font-mono text-sm mb-4 break-all"
              style={{ color: "oklch(85% 0.02 240)" }}
            >
              {supportEmail}
            </p>
            <button
              type="button"
              data-ocid="information.email.button"
              onClick={copyEmail}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all w-full justify-center hover:brightness-110"
              style={{
                background: emailCopied
                  ? "oklch(72% 0.2 145 / 0.12)"
                  : "oklch(78% 0.18 195 / 0.08)",
                borderColor: emailCopied
                  ? "oklch(72% 0.2 145 / 0.4)"
                  : "oklch(78% 0.18 195 / 0.3)",
                color: emailCopied
                  ? "oklch(72% 0.2 145)"
                  : "oklch(78% 0.18 195)",
              }}
            >
              {emailCopied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {emailCopied ? "Copied!" : "Copy Email"}
            </button>
          </div>

          {/* Discord Card */}
          <div
            data-ocid="information.discord.card"
            className="rounded-2xl border p-6 transition-all duration-200"
            style={{
              background: "oklch(14% 0.025 250)",
              borderColor: "oklch(55% 0.18 270 / 0.3)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "oklch(45% 0.18 270 / 0.15)",
                  border: "1px solid oklch(55% 0.18 270 / 0.4)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="img"
                  aria-label="Discord"
                  style={{ color: "oklch(75% 0.15 270)" }}
                >
                  <title>Discord</title>
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.044.03.086.063.108a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
              </div>
              <div>
                <p
                  className="font-pixel text-xs"
                  style={{ color: "oklch(75% 0.15 270)" }}
                >
                  Discord Server
                </p>
                <p className="text-muted-foreground text-xs">
                  Join the community
                </p>
              </div>
            </div>
            <p
              className="text-sm mb-4"
              style={{ color: "oklch(70% 0.05 250)" }}
            >
              Get support, apply for Media Rank, and connect with other Shadow
              MC players.
            </p>
            <a
              href="https://discord.gg/sNYGSQ3p"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="information.discord.button"
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all w-full justify-center font-semibold hover:scale-[1.02] hover:brightness-110"
              style={{
                background: "oklch(45% 0.18 270 / 0.15)",
                borderColor: "oklch(55% 0.18 270 / 0.5)",
                color: "oklch(75% 0.15 270)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="img"
                aria-label="Discord"
              >
                <title>Discord</title>
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.044.03.086.063.108a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Join Shadow MC Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
