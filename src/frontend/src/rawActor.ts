// Helper that creates a raw Candid actor bypassing the typed wrapper.
// This lets us call backend methods that aren't in the generated bindings
// (e.g. getManualOrders, submitManualOrder, markManualOrderVerified).
import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "./config";
import { idlFactory } from "./declarations/backend.did";

// biome-ignore lint/suspicious/noExplicitAny: raw actor has dynamic methods
export async function createRawActorWithConfig(): Promise<any> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(console.error);
  }
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: config.backend_canister_id,
  });
}
