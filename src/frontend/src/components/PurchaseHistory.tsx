import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Coins, Loader2, Package, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import type { Purchase } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerPurchases } from "../hooks/useQueries";

function formatDate(time: bigint) {
  return new Date(Number(time) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PurchaseHistory() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: purchases, isLoading } = useCallerPurchases();

  if (!isLoggedIn) {
    return (
      <section id="history" className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center">
            <h2
              className="font-pixel mb-6"
              style={{
                fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)",
                color: "oklch(78% 0.18 195)",
              }}
            >
              Purchase History
            </h2>
            <div
              data-ocid="history.empty_state"
              className="rounded-xl border p-12 text-center"
              style={{
                borderColor: "oklch(25% 0.04 250)",
                background: "oklch(14% 0.025 250)",
              }}
            >
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-foreground font-semibold mb-2">
                Login to view your purchases
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                Connect your account to see your order history
              </p>
              <Button
                onClick={login}
                disabled={loginStatus === "logging-in"}
                style={{
                  background: "oklch(78% 0.18 195)",
                  color: "oklch(10% 0.02 250)",
                }}
              >
                {loginStatus === "logging-in" ? "Connecting..." : "Login"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="history" className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            className="font-pixel mb-4"
            style={{
              fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)",
              color: "oklch(78% 0.18 195)",
            }}
          >
            Purchase History
          </h2>
        </motion.div>

        {isLoading ? (
          <div
            data-ocid="history.loading_state"
            className="flex justify-center py-16"
          >
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "oklch(78% 0.18 195)" }}
            />
          </div>
        ) : !purchases?.length ? (
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
            <p className="text-muted-foreground text-sm">
              Your order history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase: Purchase, index: number) => (
              <motion.div
                key={String(purchase.id)}
                data-ocid={`history.item.${index + 1}`}
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{
                  borderColor: "oklch(25% 0.04 250)",
                  background: "oklch(14% 0.025 250)",
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
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
                    {formatDate(purchase.purchaseTime)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ${(Number(purchase.priceCents) / 100).toFixed(2)}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Completed
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
