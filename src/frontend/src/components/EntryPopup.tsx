import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUserInfo } from "../context/UserInfoContext";

export default function EntryPopup() {
  const { setUserInfo } = useUserInfo();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isFormValid =
    username.trim().length > 0 && emailRegex.test(email.trim());

  const handleSubmit = () => {
    let valid = true;

    if (!username.trim()) {
      setUsernameError("Minecraft username is required");
      valid = false;
    } else {
      setUsernameError("");
    }

    if (!email.trim()) {
      setEmailError("Email address is required");
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (valid) {
      setUserInfo(username.trim(), email.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid) {
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "oklch(8% 0.02 250 / 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          animation: "popupEnter 0.4s ease-out",
          background: "oklch(12% 0.025 250)",
          border: "1px solid oklch(28% 0.06 250)",
          boxShadow:
            "0 0 60px oklch(78% 0.18 195 / 0.12), 0 32px 80px oklch(0% 0 0 / 0.7)",
        }}
      >
        {/* Header glow bar */}
        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(to right, oklch(60% 0.22 290), oklch(78% 0.18 195), oklch(78% 0.22 70))",
          }}
        />

        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="pt-2">
              <img
                src="/assets/generated/shadowmc-logo-transparent.dim_400x120.png"
                alt="ShadowMC"
                style={{
                  maxHeight: "80px",
                  maxWidth: "280px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="text-xl font-bold mb-1"
              style={{ color: "oklch(92% 0.04 250)" }}
            >
              Welcome to ShadowMC Store
            </h1>
            <p className="text-sm" style={{ color: "oklch(55% 0.05 250)" }}>
              Enter your details to access the store
            </p>
          </div>

          {/* Warning box */}
          <div
            className="rounded-xl p-3 mb-6 flex items-start gap-2"
            style={{
              background: "oklch(22% 0.06 80 / 0.4)",
              border: "1px solid oklch(70% 0.18 80 / 0.35)",
            }}
          >
            <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
            <p
              className="text-xs font-medium"
              style={{ color: "oklch(80% 0.14 80)" }}
            >
              Please enter your exact Minecraft username correctly. Wrong
              username means your rank/coins won&apos;t be delivered to you.
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            {/* Minecraft Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="entry-username"
                className="text-xs font-semibold block"
                style={{ color: "oklch(68% 0.08 250)" }}
              >
                Minecraft Username
                <span style={{ color: "oklch(65% 0.2 25)" }}> *</span>
              </label>
              <Input
                id="entry-username"
                data-ocid="entry.username.input"
                placeholder="Your Minecraft username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError("");
                }}
                autoComplete="off"
                spellCheck={false}
                className="text-sm h-11"
                style={{
                  background: "oklch(16% 0.03 250)",
                  border: usernameError
                    ? "1px solid oklch(65% 0.2 25)"
                    : "1px solid oklch(28% 0.04 250)",
                  color: "oklch(90% 0.04 250)",
                }}
              />
              {usernameError && (
                <p
                  data-ocid="entry.username.error_state"
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
                htmlFor="entry-email"
                className="text-xs font-semibold block"
                style={{ color: "oklch(68% 0.08 250)" }}
              >
                Email Address
                <span style={{ color: "oklch(65% 0.2 25)" }}> *</span>
              </label>
              <Input
                id="entry-email"
                data-ocid="entry.email.input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className="text-sm h-11"
                style={{
                  background: "oklch(16% 0.03 250)",
                  border: emailError
                    ? "1px solid oklch(65% 0.2 25)"
                    : "1px solid oklch(28% 0.04 250)",
                  color: "oklch(90% 0.04 250)",
                }}
              />
              {emailError && (
                <p
                  data-ocid="entry.email.error_state"
                  className="text-xs"
                  style={{ color: "oklch(65% 0.2 25)" }}
                >
                  {emailError}
                </p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <Button
            data-ocid="entry.submit.primary_button"
            className="w-full h-12 font-bold text-base gap-2 mb-5"
            style={{
              background: isFormValid
                ? "oklch(78% 0.18 195)"
                : "oklch(28% 0.04 250)",
              color: isFormValid
                ? "oklch(10% 0.02 250)"
                : "oklch(45% 0.04 250)",
              boxShadow: isFormValid
                ? "0 0 24px oklch(78% 0.18 195 / 0.45)"
                : "none",
              transition: "all 0.25s ease",
            }}
            onClick={handleSubmit}
          >
            Continue → Enter Store
          </Button>

          {/* Discord CTA */}
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background: "oklch(16% 0.03 285 / 0.5)",
              border: "1px solid oklch(55% 0.18 285 / 0.25)",
            }}
          >
            <p
              className="text-xs mb-3 font-medium"
              style={{ color: "oklch(65% 0.06 250)" }}
            >
              🎮 Join our Discord server for updates &amp; support
            </p>
            <a
              data-ocid="entry.discord.button"
              href="https://discord.gg/rcKTBgQU"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{
                background: "oklch(52% 0.22 285)",
                color: "oklch(98% 0.01 285)",
                boxShadow: "0 0 12px oklch(52% 0.22 285 / 0.35)",
              }}
            >
              🎮 Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
