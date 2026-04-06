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
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ManualOrderLite } from "../declarations/backend.did.d.ts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { createRawActorWithConfig } from "../rawActor";

type Order = ManualOrderLite;
type SidebarTab = "orders" | "revenue" | "usernames";

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
  const [activeTab, setActiveTab] = useState<SidebarTab>("orders");

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
  const verifiedRevenue = orders
    .filter((o) => o.verified && !o.blocked)
    .reduce((sum, o) => sum + Number(o.totalINR), 0);
  const pendingRevenue = orders
    .filter((o) => !o.verified && !o.blocked)
    .reduce((sum, o) => sum + Number(o.totalINR), 0);
  const uniquePlayerNames = [...new Set(orders.map((o) => o.username))];

  // Player stats for usernames tab
  const playerStats = orders.reduce(
    (acc, o) => {
      if (!acc[o.username])
        acc[o.username] = { count: 0, lastOrder: o.timestamp };
      acc[o.username].count++;
      if (o.timestamp > acc[o.username].lastOrder)
        acc[o.username].lastOrder = o.timestamp;
      return acc;
    },
    {} as Record<string, { count: number; lastOrder: bigint }>,
  );

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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(8% 0.02 250)" }}
    >
      {/* Header — full width */}
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

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="flex-shrink-0 flex flex-col py-4"
          style={{
            width: "220px",
            background: "oklch(10% 0.022 250)",
            borderRight: "1px solid oklch(18% 0.03 250)",
          }}
        >
          {/* Sidebar nav items */}
          {(
            [
              {
                id: "orders" as SidebarTab,
                label: "Orders",
                icon: Package,
                stat: String(orders.length),
                statColor: "oklch(78% 0.18 195)",
              },
              {
                id: "revenue" as SidebarTab,
                label: "Total Revenue",
                icon: TrendingUp,
                stat: `₹${totalRevenue.toLocaleString("en-IN")}`,
                statColor: "oklch(75% 0.18 145)",
              },
              {
                id: "usernames" as SidebarTab,
                label: "Usernames",
                icon: Users,
                stat: String(uniquePlayerNames.length),
                statColor: "oklch(78% 0.18 60)",
              },
            ] as const
          ).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-ocid={`admin.${item.id}.tab`}
                onClick={() => setActiveTab(item.id)}
                className="w-full text-left flex flex-col gap-0.5 transition-all"
                style={{
                  padding: "12px 16px",
                  background: isActive
                    ? "oklch(78% 0.18 195 / 0.1)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid oklch(78% 0.18 195)"
                    : "3px solid transparent",
                  color: isActive
                    ? "oklch(78% 0.18 195)"
                    : "oklch(55% 0.05 250)",
                }}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <span
                  className="text-xs font-bold pl-6"
                  style={{ color: item.statColor }}
                >
                  {item.stat}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
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
                  Newest orders first — use the buttons to verify, block, or
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
                  <p
                    className="text-xs"
                    style={{ color: "oklch(35% 0.03 250)" }}
                  >
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
                            data-ocid={`admin.orders.item.${idx + 1}`}
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
                                    <span
                                      style={{ color: "oklch(50% 0.04 250)" }}
                                    >
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
                                ₹
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
                                    border:
                                      "1px solid oklch(45% 0.12 195 / 0.3)",
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
                                  —
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
                                    border:
                                      "1px solid oklch(45% 0.15 30 / 0.35)",
                                  }}
                                >
                                  ⛔ Blocked
                                </span>
                              ) : order.verified ? (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                  style={{
                                    background: "oklch(20% 0.04 145)",
                                    color: "oklch(72% 0.18 145)",
                                    border:
                                      "1px solid oklch(45% 0.15 145 / 0.35)",
                                  }}
                                >
                                  ✓ Verified
                                </span>
                              ) : (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                  style={{
                                    background: "oklch(20% 0.04 60)",
                                    color: "oklch(72% 0.18 60)",
                                    border:
                                      "1px solid oklch(45% 0.15 60 / 0.35)",
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
                                    data-ocid={`admin.orders.verify_button.${idx + 1}`}
                                    className="h-7 text-xs px-2 flex items-center gap-1"
                                    style={{
                                      background: "oklch(22% 0.04 145)",
                                      color: "oklch(72% 0.18 145)",
                                      border:
                                        "1px solid oklch(45% 0.15 145 / 0.4)",
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
                                    data-ocid={`admin.orders.secondary_button.${idx + 1}`}
                                    className="h-7 text-xs px-2 flex items-center gap-1"
                                    style={{
                                      background: "oklch(22% 0.04 55)",
                                      color: "oklch(75% 0.18 55)",
                                      border:
                                        "1px solid oklch(50% 0.18 55 / 0.4)",
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
                                  data-ocid={`admin.orders.delete_button.${idx + 1}`}
                                  className="h-7 text-xs px-2 flex items-center gap-1"
                                  style={{
                                    background: "oklch(22% 0.04 25)",
                                    color: "oklch(70% 0.18 25)",
                                    border:
                                      "1px solid oklch(48% 0.18 25 / 0.4)",
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
          )}

          {/* REVENUE TAB */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <h2
                className="text-lg font-bold"
                style={{ color: "oklch(90% 0.04 250)" }}
              >
                Total Revenue
              </h2>

              {/* Big revenue number */}
              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  background: "oklch(12% 0.025 250)",
                  border: "1px solid oklch(22% 0.04 250)",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "oklch(50% 0.05 250)" }}
                >
                  Total Revenue (non-blocked)
                </p>
                <p
                  className="text-5xl font-bold mb-1"
                  style={{ color: "oklch(75% 0.18 145)" }}
                >
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-sm" style={{ color: "oklch(50% 0.05 250)" }}>
                  from {orders.filter((o) => !o.blocked).length} active orders
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: "oklch(12% 0.025 250)",
                    border: "1px solid oklch(22% 0.04 250)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-2"
                    style={{ color: "oklch(50% 0.05 250)" }}
                  >
                    Verified Revenue
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "oklch(72% 0.18 145)" }}
                  >
                    ₹{verifiedRevenue.toLocaleString("en-IN")}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "oklch(45% 0.04 250)" }}
                  >
                    {orders.filter((o) => o.verified && !o.blocked).length}{" "}
                    verified orders
                  </p>
                </div>
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: "oklch(12% 0.025 250)",
                    border: "1px solid oklch(22% 0.04 250)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-2"
                    style={{ color: "oklch(50% 0.05 250)" }}
                  >
                    Pending Revenue
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "oklch(72% 0.18 60)" }}
                  >
                    ₹{pendingRevenue.toLocaleString("en-IN")}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "oklch(45% 0.04 250)" }}
                  >
                    {orders.filter((o) => !o.verified && !o.blocked).length}{" "}
                    pending orders
                  </p>
                </div>
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: "oklch(12% 0.025 250)",
                    border: "1px solid oklch(22% 0.04 250)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-2"
                    style={{ color: "oklch(50% 0.05 250)" }}
                  >
                    Total Orders
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "oklch(78% 0.18 195)" }}
                  >
                    {orders.length}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "oklch(45% 0.04 250)" }}
                  >
                    {orders.filter((o) => o.blocked).length} blocked
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* USERNAMES TAB */}
          {activeTab === "usernames" && (
            <div className="space-y-4">
              <h2
                className="text-lg font-bold"
                style={{ color: "oklch(90% 0.04 250)" }}
              >
                Usernames
              </h2>
              <p className="text-xs" style={{ color: "oklch(48% 0.04 250)" }}>
                {uniquePlayerNames.length} unique player
                {uniquePlayerNames.length !== 1 ? "s" : ""}
              </p>

              {uniquePlayerNames.length === 0 ? (
                <div
                  data-ocid="admin.usernames.empty_state"
                  className="flex flex-col items-center justify-center py-20 gap-4"
                >
                  <Users
                    className="w-12 h-12"
                    style={{ color: "oklch(35% 0.04 250)" }}
                  />
                  <p style={{ color: "oklch(45% 0.04 250)" }}>No players yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {uniquePlayerNames.map((name, idx) => {
                    const stats = playerStats[name];
                    return (
                      <div
                        key={name}
                        data-ocid={`admin.usernames.item.${idx + 1}`}
                        className="rounded-xl p-4 flex items-center gap-3"
                        style={{
                          background: "oklch(12% 0.025 250)",
                          border: "1px solid oklch(22% 0.04 250)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold"
                          style={{
                            background: "oklch(18% 0.04 195)",
                            color: "oklch(78% 0.18 195)",
                            border: "1px solid oklch(45% 0.12 195 / 0.3)",
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold truncate"
                            style={{ color: "oklch(88% 0.04 250)" }}
                          >
                            {name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "oklch(50% 0.04 250)" }}
                          >
                            {stats.count} order{stats.count !== 1 ? "s" : ""} ·{" "}
                            {formatDate(stats.lastOrder)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

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
              Click outside or the × to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
