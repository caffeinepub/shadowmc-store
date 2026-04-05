import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ban,
  Eye,
  LogOut,
  Package,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ManualOrderLite } from "../declarations/backend.did.d.ts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { createRawActorWithConfig } from "../rawActor";

type Order = ManualOrderLite;

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
  const [loadingScreenshot, setLoadingScreenshot] = useState<bigint | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState<bigint | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawActor = await createRawActorWithConfig();
      const result = (await rawActor.getManualOrdersLite()) as Order[];
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
    }
  }, [isAuthenticated, fetchOrders]);

  const handleLogout = () => {
    clear();
    setOrders([]);
  };

  const handleViewScreenshot = async (orderId: bigint) => {
    setLoadingScreenshot(orderId);
    try {
      const rawActor = await createRawActorWithConfig();
      const screenshot = (await rawActor.getOrderScreenshot(orderId)) as string;
      if (screenshot) {
        setPreviewImage(screenshot);
      } else {
        alert("No screenshot found for this order.");
      }
    } catch (err) {
      console.error("Failed to fetch screenshot:", err);
      alert("Failed to load screenshot.");
    } finally {
      setLoadingScreenshot(null);
    }
  };

  const handleMarkVerified = async (order: Order) => {
    setActionLoading(order.id);
    try {
      const rawActor = await createRawActorWithConfig();
      await rawActor.markManualOrderVerified(order.id);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to verify order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (
      !window.confirm(
        `Delete order #${String(order.id)} from ${order.username}? This cannot be undone.`,
      )
    )
      return;
    setActionLoading(order.id);
    try {
      const rawActor = await createRawActorWithConfig();
      await rawActor.deleteManualOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error("Failed to delete order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockOrder = async (order: Order) => {
    setActionLoading(order.id);
    try {
      const rawActor = await createRawActorWithConfig();
      await rawActor.blockManualOrder(order.id);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to block order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const totalRevenue = orders
    .filter((o) => !o.blocked)
    .reduce((sum, o) => sum + Number(o.totalINR), 0);
  const uniquePlayers = new Set(orders.map((o) => o.username)).size;

  // ── LOADING ──────────────────────────────────────────────────────
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

  // ── LOGIN SCREEN ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(8% 0.02 250)" }}
      >
        <div
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
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────
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
              value: `\u20b9${totalRevenue.toLocaleString("en-IN")}`,
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
            <div
              key={stat.label}
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
            </div>
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
              Newest orders first \u2014 use the buttons to verify, block, or
              delete orders
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
                      "Actions",
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
                  {orders.map((order, idx) => {
                    const isActioning = actionLoading === order.id;
                    return (
                      <TableRow
                        key={String(order.id)}
                        style={{
                          borderBottom: "1px solid oklch(16% 0.025 250)",
                          opacity: order.blocked ? 0.6 : 1,
                        }}
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
                                  \u00d7{String(item.quantity)}
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
                            \u20b9
                            {Number(order.totalINR).toLocaleString("en-IN")}
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
                          {order.hasScreenshot ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewScreenshot(order.id)}
                              disabled={loadingScreenshot === order.id}
                              className="h-7 text-xs px-2 flex items-center gap-1"
                              style={{
                                color: "oklch(72% 0.14 195)",
                                border: "1px solid oklch(45% 0.12 195 / 0.3)",
                              }}
                            >
                              {loadingScreenshot === order.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              View
                            </Button>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: "oklch(38% 0.04 250)" }}
                            >
                              \u2014
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.blocked ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: "oklch(20% 0.04 30)",
                                color: "oklch(72% 0.18 30)",
                                border: "1px solid oklch(45% 0.15 30 / 0.35)",
                              }}
                            >
                              \u26d4 Blocked
                            </span>
                          ) : order.verified ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: "oklch(20% 0.04 145)",
                                color: "oklch(72% 0.18 145)",
                                border: "1px solid oklch(45% 0.15 145 / 0.35)",
                              }}
                            >
                              \u2713 Verified
                            </span>
                          ) : (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: "oklch(20% 0.04 60)",
                                color: "oklch(72% 0.18 60)",
                                border: "1px solid oklch(45% 0.15 60 / 0.35)",
                              }}
                            >
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {!order.verified && !order.blocked && (
                              <Button
                                size="sm"
                                onClick={() => handleMarkVerified(order)}
                                disabled={isActioning}
                                className="h-7 text-xs px-2 flex items-center gap-1"
                                style={{
                                  background: "oklch(22% 0.04 145)",
                                  color: "oklch(72% 0.18 145)",
                                  border: "1px solid oklch(45% 0.15 145 / 0.4)",
                                }}
                              >
                                {isActioning ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Shield className="w-3 h-3" />
                                )}
                                Verify
                              </Button>
                            )}
                            {!order.blocked && (
                              <Button
                                size="sm"
                                onClick={() => handleBlockOrder(order)}
                                disabled={isActioning}
                                className="h-7 text-xs px-2 flex items-center gap-1"
                                style={{
                                  background: "oklch(22% 0.04 55)",
                                  color: "oklch(75% 0.18 55)",
                                  border: "1px solid oklch(50% 0.18 55 / 0.4)",
                                }}
                              >
                                {isActioning ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Ban className="w-3 h-3" />
                                )}
                                Block
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleDeleteOrder(order)}
                              disabled={isActioning}
                              className="h-7 text-xs px-2 flex items-center gap-1"
                              style={{
                                background: "oklch(22% 0.04 25)",
                                color: "oklch(70% 0.18 25)",
                                border: "1px solid oklch(48% 0.18 25 / 0.4)",
                              }}
                            >
                              {isActioning ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Fullscreen screenshot preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "oklch(0% 0 0 / 0.9)",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setPreviewImage(null)}
          onKeyDown={(e) => e.key === "Escape" && setPreviewImage(null)}
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
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
              Click outside or the \u00d7 to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
