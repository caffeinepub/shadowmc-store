import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  EyeOff,
  LogOut,
  Package,
  RefreshCw,
  Shield,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRawActorWithConfig } from "../config";
import type { ManualOrder } from "../declarations/backend.did.d.ts";

const ADMIN_PIN = "1313";
const ADMIN_AUTH_KEY = "shadowmc_admin_auth";

// Use canonical types from Candid declarations
type Order = ManualOrder;

function formatDate(ts: bigint): string {
  // ts is nanoseconds — convert to milliseconds
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawActor = await createRawActorWithConfig();
      const result = await rawActor.getManualOrders();
      // Sort newest first by timestamp
      const sorted = [...result].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
      setOrders(sorted);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [isAuthenticated, fetchOrders]);

  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Wrong password. Try again.");
      setPin("");
      setTimeout(() => pinInputRef.current?.focus(), 50);
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handlePinSubmit();
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setPin("");
    setPinError("");
    setOrders([]);
  };

  const handleMarkVerified = async (order: Order) => {
    try {
      const rawActor = await createRawActorWithConfig();
      await rawActor.markManualOrderVerified(order.id);
      // Refresh the list
      await fetchOrders();
    } catch (err) {
      console.error("Failed to verify order:", err);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalINR), 0);
  const uniquePlayers = new Set(orders.map((o) => o.username)).size;

  // ── PIN LOGIN SCREEN ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(8% 0.02 250)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{
            background: "oklch(12% 0.025 250)",
            border: "1px solid oklch(22% 0.04 250)",
            boxShadow: "0 32px 80px oklch(0% 0 0 / 0.6)",
          }}
          data-ocid="admin.modal"
        >
          {/* Shield icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(18% 0.04 195)",
                boxShadow: "0 0 32px oklch(78% 0.18 195 / 0.2)",
                border: "1px solid oklch(50% 0.14 195 / 0.3)",
              }}
            >
              <Shield
                className="w-10 h-10"
                style={{ color: "oklch(78% 0.18 195)" }}
              />
            </div>
          </div>

          <h1
            className="text-2xl font-bold text-center mb-1"
            style={{ color: "oklch(92% 0.04 250)" }}
          >
            ShadowMC Admin
          </h1>
          <p
            className="text-sm text-center mb-8"
            style={{ color: "oklch(50% 0.05 250)" }}
          >
            Enter your 4-digit PIN to continue
          </p>

          <div className="space-y-3">
            <div className="relative">
              <Input
                ref={pinInputRef}
                data-ocid="admin.pin.input"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(val);
                  if (pinError) setPinError("");
                }}
                onKeyDown={handlePinKeyDown}
                className="text-center text-2xl tracking-[0.5em] pr-10 h-14"
                style={{
                  background: "oklch(16% 0.03 250)",
                  border: pinError
                    ? "1px solid oklch(65% 0.2 25)"
                    : "1px solid oklch(28% 0.04 250)",
                  color: "oklch(90% 0.04 250)",
                  letterSpacing: "0.4em",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "oklch(50% 0.05 250)" }}
                tabIndex={-1}
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {pinError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  data-ocid="admin.pin.error_state"
                  className="text-xs text-center"
                  style={{ color: "oklch(65% 0.2 25)" }}
                >
                  {pinError}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              data-ocid="admin.login.submit_button"
              className="w-full h-12 font-bold text-base"
              onClick={handlePinSubmit}
              disabled={pin.length !== 4}
              style={{
                background:
                  pin.length === 4
                    ? "oklch(78% 0.18 195)"
                    : "oklch(22% 0.03 250)",
                color:
                  pin.length === 4
                    ? "oklch(10% 0.02 250)"
                    : "oklch(40% 0.04 250)",
                boxShadow:
                  pin.length === 4
                    ? "0 0 20px oklch(78% 0.18 195 / 0.35)"
                    : "none",
                transition: "all 0.2s",
              }}
            >
              Enter Admin Panel
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "oklch(8% 0.02 250)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: "oklch(10% 0.022 250 / 0.95)",
          borderBottom: "1px solid oklch(18% 0.03 250)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Shield
            className="w-6 h-6"
            style={{ color: "oklch(78% 0.18 195)" }}
          />
          <h1
            className="text-lg font-bold"
            style={{ color: "oklch(92% 0.04 250)" }}
          >
            ShadowMC Admin Panel
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="admin.refresh.button"
            variant="ghost"
            size="sm"
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm"
            style={{ color: "oklch(62% 0.10 195)" }}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            data-ocid="admin.logout.button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm"
            style={{ color: "oklch(55% 0.05 250)" }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Orders",
              value: orders.length,
              icon: Package,
              color: "oklch(78% 0.18 195)",
              bg: "oklch(18% 0.04 195)",
              ocid: "admin.stats.orders.card",
            },
            {
              label: "Total Revenue",
              value: `₹${totalRevenue.toLocaleString("en-IN")}`,
              icon: Shield,
              color: "oklch(75% 0.18 145)",
              bg: "oklch(18% 0.04 145)",
              ocid: "admin.stats.revenue.card",
            },
            {
              label: "Unique Players",
              value: uniquePlayers,
              icon: Users,
              color: "oklch(78% 0.18 60)",
              bg: "oklch(18% 0.04 60)",
              ocid: "admin.stats.players.card",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              data-ocid={stat.ocid}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-5 flex items-center gap-4"
              style={{
                background: "oklch(12% 0.025 250)",
                border: "1px solid oklch(22% 0.04 250)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: stat.bg }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "oklch(50% 0.05 250)" }}
                >
                  {stat.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Orders section */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "oklch(12% 0.025 250)",
            border: "1px solid oklch(22% 0.04 250)",
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid oklch(18% 0.03 250)" }}
          >
            <h2
              className="text-base font-bold"
              style={{ color: "oklch(90% 0.04 250)" }}
            >
              Payment Orders
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(48% 0.04 250)" }}
            >
              Newest orders first — click screenshot thumbnail to view full
              image
            </p>
          </div>

          {isLoading && orders.length === 0 ? (
            <div
              data-ocid="admin.orders.loading_state"
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <RefreshCw
                className="w-8 h-8 animate-spin"
                style={{ color: "oklch(55% 0.08 195)" }}
              />
              <p
                className="text-sm font-medium"
                style={{ color: "oklch(50% 0.05 250)" }}
              >
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div
              data-ocid="admin.orders.empty_state"
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "oklch(18% 0.03 250)" }}
              >
                <Package
                  className="w-8 h-8"
                  style={{ color: "oklch(40% 0.04 250)" }}
                />
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: "oklch(45% 0.04 250)" }}
              >
                No orders yet
              </p>
              <p className="text-xs" style={{ color: "oklch(35% 0.03 250)" }}>
                Orders will appear here after players complete payment
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow
                    style={{
                      borderBottom: "1px solid oklch(18% 0.03 250)",
                    }}
                  >
                    {[
                      "#",
                      "Player",
                      "Items",
                      "Amount",
                      "Method",
                      "Date",
                      "Screenshot",
                      "Status",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold"
                        style={{ color: "oklch(52% 0.05 250)" }}
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow
                      key={String(order.id)}
                      data-ocid={`admin.orders.item.${idx + 1}`}
                      style={{
                        borderBottom: "1px solid oklch(16% 0.025 250)",
                      }}
                    >
                      {/* # */}
                      <TableCell
                        className="text-xs font-mono"
                        style={{ color: "oklch(45% 0.04 250)" }}
                      >
                        {idx + 1}
                      </TableCell>

                      {/* Player */}
                      <TableCell>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "oklch(88% 0.04 250)" }}
                        >
                          {order.username}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(50% 0.04 250)" }}
                        >
                          {order.email}
                        </p>
                      </TableCell>

                      {/* Items */}
                      <TableCell>
                        <div className="space-y-0.5">
                          {order.items.map((item, j) => (
                            <div
                              key={`${item.name}-${j}`}
                              className="text-xs"
                              style={{ color: "oklch(70% 0.05 250)" }}
                            >
                              {item.name}{" "}
                              <span style={{ color: "oklch(50% 0.04 250)" }}>
                                ×{String(item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span
                          className="text-sm font-bold"
                          style={{ color: "oklch(75% 0.18 145)" }}
                        >
                          ₹{Number(order.totalINR).toLocaleString("en-IN")}
                        </span>
                      </TableCell>

                      {/* Method */}
                      <TableCell>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "oklch(20% 0.04 195)",
                            color: "oklch(72% 0.14 195)",
                            border: "1px solid oklch(45% 0.12 195 / 0.3)",
                          }}
                        >
                          {order.paymentMethod}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell
                        className="text-xs whitespace-nowrap"
                        style={{ color: "oklch(50% 0.04 250)" }}
                      >
                        {formatDate(order.timestamp)}
                      </TableCell>

                      {/* Screenshot */}
                      <TableCell>
                        {order.screenshotBase64 ? (
                          <button
                            type="button"
                            data-ocid="admin.orders.screenshot.button"
                            onClick={() =>
                              setPreviewImage(order.screenshotBase64)
                            }
                            className="block transition-all hover:opacity-80 hover:scale-105 rounded overflow-hidden"
                            style={{
                              border: "1px solid oklch(35% 0.06 250)",
                            }}
                          >
                            <img
                              src={order.screenshotBase64}
                              alt="Payment proof"
                              className="object-cover"
                              style={{
                                width: "48px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                            />
                          </button>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "oklch(38% 0.04 250)" }}
                          >
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Status / Verify */}
                      <TableCell>
                        {order.verified ? (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background: "oklch(20% 0.04 145)",
                              color: "oklch(72% 0.18 145)",
                              border: "1px solid oklch(45% 0.15 145 / 0.35)",
                            }}
                          >
                            ✓ Verified
                          </span>
                        ) : (
                          <Button
                            data-ocid="admin.orders.verify.button"
                            size="sm"
                            onClick={() => handleMarkVerified(order)}
                            className="h-7 text-xs px-3"
                            style={{
                              background: "oklch(22% 0.04 195)",
                              color: "oklch(72% 0.14 195)",
                              border: "1px solid oklch(45% 0.12 195 / 0.4)",
                            }}
                          >
                            Mark Verified
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Fullscreen screenshot preview overlay */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            key="preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-ocid="admin.screenshot.modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0% 0 0 / 0.9)" }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                data-ocid="admin.screenshot.close_button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "oklch(22% 0.04 250)",
                  border: "1px solid oklch(35% 0.05 250)",
                  color: "oklch(70% 0.05 250)",
                }}
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={previewImage}
                alt="Payment screenshot full view"
                className="w-full rounded-xl"
                style={{
                  maxHeight: "80vh",
                  objectFit: "contain",
                  boxShadow: "0 24px 80px oklch(0% 0 0 / 0.7)",
                }}
              />
              <p
                className="text-center mt-3 text-xs"
                style={{ color: "oklch(45% 0.04 250)" }}
              >
                Click outside or the ✕ to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
