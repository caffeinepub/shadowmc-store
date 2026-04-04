import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Purchase,
  ShoppingItem,
  StoreInfo,
  UserProfile,
} from "../backend";
import type { backendInterface as ExtendedBackendInterface } from "../backend.d";
import { useActor } from "./useActor";

export function useStoreInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<StoreInfo>({
    queryKey: ["storeInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getStore();
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
      return actor.getCallerPurchases();
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
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
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
      return actor.isCallerAdmin();
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
      return actor.getPurchases();
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
      return (
        actor as unknown as ExtendedBackendInterface
      ).getVerifiedPurchaseIds();
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
      return (
        actor as unknown as ExtendedBackendInterface
      ).markPurchaseVerified(purchaseId);
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
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && enabled && !!principal,
    staleTime: 60_000,
  });
}
