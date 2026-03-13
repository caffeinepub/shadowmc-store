import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Purchase, ShoppingItem, StoreInfo } from "../backend.d";
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
