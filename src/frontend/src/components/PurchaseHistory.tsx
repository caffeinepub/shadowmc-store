import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Coins,
  Loader2,
  Package,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Purchase } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerPurchases } from "../hooks/useQueries";
import { createRawActorWithConfig } from "../rawActor";
import {
  LOCAL_ORDERS_KEY,
  type LocalOrder,
  deleteLocalOrder,
  loadLocalOrders,
} from "../utils/localOrders";

const INR_PER_USD = 92;

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PurchaseHistory() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: stripePurchases, isLoading } = useCallerPurchases();
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Load local manual orders and sync verified/blocked status from backend
  useEffect(() => {
    const syncOrders = async () => {
      const orders = loadLocalOrders();
      setLocalOrders(orders);

      const ordersWithBackendId = orders.filter(
        (o) => o.backendId !== undefined,
      );
      if (ordersWithBackendId.length === 0) return;

      setIsSyncing(true);
      try {
        const rawActor = await createRawActorWithConfig();
        const backendOrders = (await rawActor.getManualOrdersLite()) as Array<{
          id: bigint;
          verified: boolean;
          blocked: boolean;
        }>;

        const statusMap = new Map<
          number,
          { verified: boolean; blocked: boolean }
        >();
        for (const bo of backendOrders) {
          statusMap.set(Number(bo.id), {
            verified: bo.verified,
            blocked: bo.blocked ?? false,
          });
        }

        const mergedOrders = orders.map((order) => {
          if (order.backendId !== undefined) {
            const status = statusMap.get(order.backendId);
            if (status !== undefined) {
              return {
                ...order,
                verified: status.verified,
                blocked: status.blocked,
              };
            }
          }
          return order;
        });

        try {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(mergedOrders));
        } catch {
          // ignore storage errors
        }

        setLocalOrders(mergedOrders);
      } catch (err) {
        console.warn("Failed to sync order status from backend:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    syncOrders();
  }, []);

  const handleDeleteOrder = (orderId: string) => {
    setDeletingIds((prev) => new Set(prev).add(orderId));
    setTimeout(() => {
      deleteLocalOrder(orderId);
      setLocalOrders((prev) => prev.filter((o) => o.id !== orderId));
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }, 320);
  };

  const hasLocalOrders = localOrders.length > 0;
  const hasStripePurchases = (stripePurchases?.length ?? 0) > 0;

  function getStatusBadge(order: LocalOrder) {
    if (order.blocked) {
      return (
        <Badge
          variant="secondary"
          className="text-xs"
          style={{
            background: "oklch(20% 0.04 25)",
            color: "oklch(70% 0.18 25)",
            border: "1px solid oklch(45% 0.15 25 / 0.3)",
          }}
        >
          ⛔ Blocked
        </Badge>
      );
    }
    if (order.verified) {
      return (
        <Badge
          variant="secondary"
          className="text-xs"
          style={{
            background: "oklch(20% 0.04 145)",
            color: "oklch(72% 0.18 145)",
            border: "1px solid oklch(45% 0.15 145 / 0.3)",
          }}
        >
          ✓ Verified
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="text-xs"
        style={{
          background: "oklch(20% 0.04 60)",
          color: "oklch(72% 0.18 60)",
          border: "1px solid oklch(55% 0.18 60 / 0.3)",
        }}
      >
        Pending Review
      </Badge>
    );
  }

  return (
    <section
      id="history"
      className="py-24 px-4"
      style={{ background: "oklch(12% 0.02 250 / 0.85)" }}
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
            Purchase History
          </h2>
          <p className="text-sm" style={{ color: "oklch(50% 0.05 250)" }}>
            Your recent orders on this device
            {isSyncing && (
              <span
                className="ml-2 inline-flex items-center gap-1"
                style={{ color: "oklch(60% 0.08 195)" }}
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Syncing...</span>
              </span>
            )}
          </p>
        </div>

        {/* Manual / UPI orders */}
        {hasLocalOrders && (
          <div className="mb-8">
            <p
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "oklch(55% 0.07 250)" }}
            >
              UPI / Manual Payment Orders
            </p>
            <div className="space-y-3 overflow-hidden">
              {[...localOrders]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((order, index) => {
                  const isDeleting = deletingIds.has(order.id);
                  return (
                    <div
                      key={order.id}
                      data-ocid={`history.local.item.${index + 1}`}
                      className="flex items-start gap-4 p-4 rounded-xl border relative overflow-hidden"
                      style={{
                        borderColor: isDeleting
                          ? "oklch(55% 0.18 25 / 0.4)"
                          : "oklch(25% 0.04 250)",
                        background: isDeleting
                          ? "oklch(16% 0.04 25)"
                          : "oklch(14% 0.025 250)",
                        transition:
                          "background 0.15s, border-color 0.15s, transform 0.3s ease, opacity 0.3s ease",
                        transform: isDeleting ? "translateX(120px)" : "none",
                        opacity: isDeleting ? 0 : 1,
                      }}
                    >
                      {isDeleting && (
                        <div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(to right, transparent, oklch(55% 0.22 25 / 0.12))",
                          }}
                        />
                      )}

                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: "oklch(78% 0.18 195 / 0.1)",
                          border: "1px solid oklch(78% 0.18 195 / 0.3)",
                        }}
                      >
                        <Package
                          className="w-5 h-5"
                          style={{ color: "oklch(78% 0.18 195)" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm mb-0.5">
                          {order.items.map((i) => i.name).join(", ")}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(55% 0.05 250)" }}
                        >
                          Player:{" "}
                          <span style={{ color: "oklch(78% 0.18 195)" }}>
                            {order.username}
                          </span>
                        </p>
                        <div
                          className="flex items-center gap-1 text-xs mt-0.5"
                          style={{ color: "oklch(50% 0.04 250)" }}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDate(order.timestamp)} &middot;{" "}
                          {order.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <p className="font-semibold text-foreground text-sm">
                          Rs {order.totalINR.toLocaleString("en-IN")}
                        </p>
                        {getStatusBadge(order)}
                        <button
                          type="button"
                          data-ocid={`history.local.delete.${index + 1}`}
                          onClick={() =>
                            !isDeleting && handleDeleteOrder(order.id)
                          }
                          disabled={isDeleting}
                          className="flex items-center gap-1 text-xs mt-1 px-2 py-1 rounded-lg transition-colors hover:brightness-125"
                          style={{
                            color: isDeleting
                              ? "oklch(65% 0.22 25)"
                              : "oklch(55% 0.18 25)",
                            background: isDeleting
                              ? "oklch(22% 0.05 25)"
                              : "oklch(18% 0.03 25 / 0)",
                            border: "1px solid oklch(45% 0.18 25 / 0.25)",
                            cursor: isDeleting ? "default" : "pointer",
                          }}
                          title="Remove from history"
                        >
                          <Trash2 className="w-3 h-3" />
                          {isDeleting ? "Removing..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Stripe purchases -- only when logged in via Internet Identity */}
        {isLoggedIn && (
          <div>
            {hasLocalOrders && (
              <p
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "oklch(55% 0.07 250)" }}
              >
                Card / Stripe Purchases
              </p>
            )}
            {isLoading ? (
              <div
                data-ocid="history.loading_state"
                className="flex justify-center py-8"
              >
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: "oklch(78% 0.18 195)" }}
                />
              </div>
            ) : hasStripePurchases ? (
              <div className="space-y-3">
                {(stripePurchases as Purchase[]).map(
                  (purchase: Purchase, index: number) => (
                    <div
                      key={String(purchase.id)}
                      data-ocid={`history.stripe.item.${index + 1}`}
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{
                        borderColor: "oklch(25% 0.04 250)",
                        background: "oklch(14% 0.025 250)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "oklch(78% 0.18 195 / 0.1)",
                          border: "1px solid oklch(78% 0.18 195 / 0.3)",
                        }}
                      >
                        {purchase.productType.__kind__ === "coinBundle" ? (
                          <Coins
                            className="w-5 h-5"
                            style={{ color: "oklch(78% 0.22 70)" }}
                          />
                        ) : (
                          <ShieldCheck
                            className="w-5 h-5"
                            style={{ color: "oklch(78% 0.18 195)" }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {purchase.productType.__kind__ === "coinBundle"
                            ? `${Number(purchase.productType.coinBundle.coins).toLocaleString()} Coins`
                            : `${purchase.productType.rank.tier} Rank`}
                        </p>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(
                            Number(purchase.purchaseTime) / 1_000_000,
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          Rs
                          {Math.round(
                            (Number(purchase.priceCents) / 100) * INR_PER_USD,
                          ).toLocaleString("en-IN")}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              !hasLocalOrders && (
                <div
                  data-ocid="history.empty_state"
                  className="rounded-xl border p-8 text-center"
                  style={{
                    borderColor: "oklch(25% 0.04 250)",
                    background: "oklch(14% 0.025 250)",
                  }}
                >
                  <p className="text-muted-foreground text-sm">
                    No Stripe purchases found for this account.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasLocalOrders && !isLoggedIn && (
          <div
            data-ocid="history.empty_state"
            className="rounded-xl border p-12 text-center"
            style={{
              borderColor: "oklch(25% 0.04 250)",
              background: "oklch(14% 0.025 250)",
            }}
          >
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-foreground font-semibold mb-2">
              No purchases yet
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              After you buy something, your orders will appear here
            </p>
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              variant="outline"
              size="sm"
              className="text-xs"
              style={{
                borderColor: "oklch(35% 0.06 250)",
                color: "oklch(65% 0.06 250)",
              }}
            >
              {loginStatus === "logging-in"
                ? "Connecting..."
                : "Login to view Stripe orders"}
            </Button>
          </div>
        )}

        {/* Login prompt when local orders exist */}
        {hasLocalOrders && !isLoggedIn && (
          <div
            className="mt-6 rounded-xl border p-4 text-center"
            style={{
              borderColor: "oklch(22% 0.04 250)",
              background: "oklch(13% 0.02 250)",
            }}
          >
            <p
              className="text-xs mb-3"
              style={{ color: "oklch(50% 0.05 250)" }}
            >
              Login to also view purchases made via card / Stripe
            </p>
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              variant="outline"
              size="sm"
              className="text-xs"
              style={{
                borderColor: "oklch(35% 0.06 250)",
                color: "oklch(65% 0.06 250)",
              }}
            >
              {loginStatus === "logging-in"
                ? "Connecting..."
                : "Login with Internet Identity"}
            </Button>
          </div>
        )}

        {/* Welcome / About box */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{
            background: "oklch(14% 0.025 250)",
            border: "1px solid oklch(78% 0.18 195 / 0.2)",
            boxShadow: "0 0 40px oklch(78% 0.18 195 / 0.05)",
          }}
        >
          <h3
            className="font-pixel mb-3"
            style={{
              color: "oklch(78% 0.18 195)",
              fontSize: "clamp(0.75rem, 2vw, 1rem)",
            }}
          >
            Welcome to Shadow MC Store
          </h3>
          <p className="text-muted-foreground mb-2">
            Shadow MC is a free public Minecraft server with{" "}
            <span style={{ color: "oklch(78% 0.22 70)" }}>Survival</span> and{" "}
            <span style={{ color: "oklch(70% 0.22 305)" }}>Lifesteal</span>{" "}
            modes.
          </p>
          <p className="text-muted-foreground text-sm">
            From Ranks and Coins, you can enhance your game experience and stand
            out from the rest.
          </p>
        </div>
      </div>
    </section>
  );
}
