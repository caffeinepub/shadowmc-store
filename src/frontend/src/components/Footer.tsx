export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      className="border-t py-12 px-4"
      style={{
        borderColor: "oklch(22% 0.03 250)",
        background: "oklch(10% 0.02 250)",
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/shadowmc-logo-transparent.dim_400x120.png"
              alt="ShadowMC"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Server IP:{" "}
              <span
                className="font-mono"
                style={{ color: "oklch(78% 0.18 195)" }}
              >
                shadowmcgg.enderman.cloud
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {/* Discord CTA */}
            <a
              data-ocid="footer.discord.button"
              href="https://discord.gg/rcKTBgQU"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 hover:scale-105"
              style={{
                background: "oklch(52% 0.22 285)",
                color: "oklch(98% 0.01 285)",
                boxShadow: "0 0 12px oklch(52% 0.22 285 / 0.35)",
              }}
            >
              🎮 Join Discord
            </a>

            <div className="text-center text-muted-foreground text-sm">
              <p>
                © {year}. Built with ❤️ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors underline underline-offset-2"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
