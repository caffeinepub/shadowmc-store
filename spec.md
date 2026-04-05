# ShadowMC Store

## Current State
The store is fully featured with ranks, coin bundles, UPI payment flow, admin panel, purchase history, and product suggestions. The critical unresolved bug is that `createRawActorWithConfig` is called by AdminPanel, PaymentModal, and PurchaseHistory but was never defined in `config.ts` — causing all order submissions and retrievals to crash silently with "createRawActorWithConfig is not a function". Additionally, Internet Identity login was broken: when a user already had a valid session and clicked Login again, the code called `setErrorMessage("User is already authenticated")` instead of resuming the session, permanently setting login status to `loginError`.

## Requested Changes (Diff)

### Add
- `createRawActorWithConfig()` function in `config.ts` — creates a raw Candid actor using `Actor.createActor` with `idlFactory` and an anonymous `HttpAgent`. This bypasses the typed wrapper and exposes `submitManualOrder`, `getManualOrders`, and `markManualOrderVerified` directly.
- `RawBackendActor` TypeScript interface in `config.ts` to type the raw actor's return value.

### Modify
- `config.ts`: Add `Actor` to the `@icp-sdk/core/agent` import and add `idlFactory` import from `./declarations/backend.did`. Implement `createRawActorWithConfig` as a new exported async function.
- `useInternetIdentity.ts`: In the `login()` callback, change the "already authenticated" branch from calling `setErrorMessage("User is already authenticated")` to calling `handleLoginSuccess()` so existing sessions are recognized and the user is logged in immediately.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `createRawActorWithConfig` to `config.ts` with correct imports and implementation.
2. Fix `login()` in `useInternetIdentity.ts` to call `handleLoginSuccess()` when user already has a valid delegation.
3. Run frontend validation (lint + typecheck + build).
4. Deploy.
