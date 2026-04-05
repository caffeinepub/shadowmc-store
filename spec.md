# ShadowMC Store

## Current State
The store is visually complete with all features (ranks, coins, cart, payment modal, admin panel, purchase history, entry popup, suggestions modal). However, a critical bug persists: `createRawActorWithConfig` is imported in AdminPanel.tsx, PaymentModal.tsx, and PurchaseHistory.tsx but was NEVER exported from config.ts. This causes every backend call for order submission, order retrieval, and verification to crash silently with "createRawActorWithConfig is not a function". Additionally, the canister showed as stopped (IC0508 error) which will be resolved by redeployment.

## Requested Changes (Diff)

### Add
- Export `createRawActorWithConfig` from config.ts using `Actor.createActor` directly with the raw `idlFactory` from backend declarations

### Modify
- config.ts: add the missing `createRawActorWithConfig` export that uses `Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId })` so AdminPanel, PaymentModal, and PurchaseHistory can successfully call `getManualOrders`, `submitManualOrder`, and `markManualOrderVerified`
- useInternetIdentity.ts: fix the "already authenticated" freeze where existing session triggers setErrorMessage instead of handleLoginSuccess

### Remove
- Nothing removed

## Implementation Plan
1. Add `createRawActorWithConfig` to config.ts -- use `Actor.createActor` with raw idlFactory, no typed wrapper, returns `_SERVICE` directly
2. Fix useInternetIdentity.ts to recognize existing sessions and call handleLoginSuccess instead of setErrorMessage
3. Validate build compiles cleanly
