import { useActor as useActorBase } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

// Zero-arg wrapper — passes the generated createActor to the base hook
export function useActor() {
  return useActorBase(createActor);
}
