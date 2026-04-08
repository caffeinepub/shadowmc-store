import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// Local type definitions (backend bindings are minimal stubs)
export interface Purchase {
  id: bigint;
  productType: {
    __kind__: "coinBundle" | "rank";
    coinBundle: { coins: bigint };
    rank: { tier: string };
  };
  purchaseTime: bigint;
  priceCents: bigint;
  username?: string;
  email?: string;
  totalINR?: bigint;
  paymentMethod?: string;
  timestamp?: bigint;
  verified?: boolean;
}

export interface ShoppingItem {
  productName: string;
  currency: string;
  quantity: bigint;
  priceInCents: bigint;
  productDescription: string;
}

export interface CoinBundle {
  product: { id: bigint; name: string; priceCents: bigint };
  coins: bigint;
}

export interface RankProduct {
  product: { id: bigint; name: string; priceCents: bigint };
  tier: string;
}

export interface StoreInfo {
  name: string;
  description: string;
  coinBundles?: CoinBundle[];
  ranks?: RankProduct[];
}

export interface UserProfile {
  id: Principal;
  username: string;
}

// Extended interface for methods not in generated bindings
interface ExtendedActor {
  getStore(): Promise<StoreInfo>;
  getCallerPurchases(): Promise<Purchase[]>;
  createCheckoutSession(
    items: ShoppingItem[],
    successUrl: string,
    cancelUrl: string,
  ): Promise<string>;
  isStripeConfigured(): Promise<boolean>;
  isCallerAdmin(): Promise<boolean>;
  getPurchases(): Promise<Purchase[]>;
  getVerifiedPurchaseIds(): Promise<bigint[]>;
  markPurchaseVerified(id: bigint): Promise<void>;
  getUserProfile(principal: Principal): Promise<UserProfile | null>;
  saveCallerUserProfile(profile: {
    id: Principal;
    username: string;
  }): Promise<void>;
}

export function useStoreInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<StoreInfo>({
    queryKey: ["storeInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as ExtendedActor).getStore();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useCallerPurchases() {
  const { actor, isFetching } = useActor();
  return useQuery<Purchase[]>({
    queryKey: ["callerPurchases"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActor).getCallerPurchases();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as ExtendedActor).createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as unknown as ExtendedActor).isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as unknown as ExtendedActor).isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAllPurchases(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Purchase[]>({
    queryKey: ["allPurchases"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActor).getPurchases();
    },
    enabled: !!actor && !isFetching && enabled,
    staleTime: 15_000,
  });
}

export function useVerifiedPurchaseIds(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["verifiedPurchaseIds"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActor).getVerifiedPurchaseIds();
    },
    enabled: !!actor && !isFetching && enabled,
    staleTime: 15_000,
  });
}

export function useMarkPurchaseVerified() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchaseId: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as ExtendedActor).markPurchaseVerified(
        purchaseId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPurchases"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedPurchaseIds"] });
    },
  });
}

export function useUserProfile(
  principal: Principal | undefined,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return (actor as unknown as ExtendedActor).getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && enabled && !!principal,
    staleTime: 60_000,
  });
}
