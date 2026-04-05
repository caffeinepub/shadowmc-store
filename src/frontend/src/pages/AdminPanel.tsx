import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut, Package, RefreshCw, Shield, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { createRawActorWithConfig } from "../config";
import type { ManualOrder } from "../declarations/backend.did.d.ts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const _ADMIN_PRINCIPAL = "rayyan.khan20125@gmail.com";

type Order = ManualOrder;

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPanel() {
  const { identity, login, clear, isInitializing, isLoggingIn, loginStatus } =
    useInternetIdentity();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawActor = await createRawActorWithConfig();
      const result = (await rawActor.getManualOrders()) as Order[];
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
      // All logged-in users can access the admin panel (owner only knows the URL)
      setAccessDenied(false);
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const handleLogout = () => {
    clear();
    setOrders([]);
    setAccessDenied(false);
  };

  const handleMarkVerified = async (order: Order) => {
    try {
      const rawActor = await createRawActorWithConfig();
      await rawActor.markManualOrderVerified(order.id);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to verify order:", err);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalINR), 0);
  const uniquePlayers = new Set(orders.map((o) => o.username)).size;

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(8% 0.02 250)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <RefreshCw
            className="w-8 h-8 animate-spin"
            style={{ color: "oklch(78% 0.18 195)" }}
          />
          <p style={{ color: "oklch(55% 0.05 250)" }}>Initializing...</p>
        </div>
      </div>
    );
  }

  // ── ACCESS DENIED ────────────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(8% 0.02 250)" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{
            background: "oklch(12% 0.025 250)",
            border: "1px solid oklch(22% 0.04 250)",
          }}
        >
          <Shield
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "oklch(65% 0.2 25)" }}
          />
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(65% 0.2 25)" }}
          >
            Access Denied
          </h1>
          <p className="text-sm mb-6" style={{ color: "oklch(50% 0.05 250)" }}>
            This admin panel is restricted to the store owner only.
          </p>
          <Button onClick={handleLogout} variant="ghost" size="sm">
            Log out
          </Button>
        </div>
      </div>
    );
  }

  // ── LOGIN SCREEN ─────────────────────────────────────────────────────────
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
        >
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
            Login with Internet Identity to access the admin panel
          </p>

          <Button
            className="w-full h-12 font-bold text-base"
            onClick={login}
            disabled={isLoggingIn}
            style={{
              background: "oklch(78% 0.18 195)",
              color: "oklch(10% 0.02 250)",
              boxShadow: "0 0 20px oklch(78% 0.18 195 / 0.35)",
              opacity: isLoggingIn ? 0.7 : 1,
            }}
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Opening Internet Identity...
              </span>
            ) : (
              "Login with Internet Identity"
            )}
          </Button>

          {loginStatus === "loginError" && (
            <p
              className="text-xs text-center mt-3"
              style={{ color: "oklch(65% 0.2 25)" }}
            >
              Login failed. Please try again.
            </p>
          )}
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
            },
            {
              label: "Total Revenue",
              value: `₹${totalRevenue.toLocaleString("en-IN")}`,
              icon: Shield,
              color: "oklch(75% 0.18 145)",
              bg: "oklch(18% 0.04 145)",
            },
            {
              label: "Unique Players",
              value: uniquePlayers,
              icon: Users,
              color: "oklch(78% 0.18 60)",
              bg: "oklch(18% 0.04 60)",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
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
                    style={{ borderBottom: "1px solid oklch(18% 0.03 250)" }}
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
                      style={{ borderBottom: "1px solid oklch(16% 0.025 250)" }}
                    >
                      <TableCell
                        className="text-xs font-mono"
                        style={{ color: "oklch(45% 0.04 250)" }}
                      >
                        {idx + 1}
                      </TableCell>
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
                      <TableCell>
                        <span
                          className="text-sm font-bold"
                          style={{ color: "oklch(75% 0.18 145)" }}
                        >
                          ₹{Number(order.totalINR).toLocaleString("en-IN")}
                        </span>
                      </TableCell>
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
                      <TableCell
                        className="text-xs whitespace-nowrap"
                        style={{ color: "oklch(50% 0.04 250)" }}
                      >
                        {formatDate(order.timestamp)}
                      </TableCell>
                      <TableCell>
                        {order.screenshotBase64 ? (
                          <button
                            type="button"
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

      {/* Fullscreen screenshot preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            key="preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
