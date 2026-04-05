# ShadowMC Store

## Current State
- Full Minecraft store with ranks, coins, UPI/manual payment flow, admin panel, purchase history
- Admin panel uses 4-digit PIN (1313), shows orders from backend
- `createRawActorWithConfig` is imported and called in AdminPanel.tsx, PaymentModal.tsx, and PurchaseHistory.tsx but **does NOT exist in config.ts** — this is the root cause of all silent backend call failures
- Internet Identity login has a bug: when user already has a valid session, `login()` calls `setErrorMessage('User is already authenticated')` which sets loginStatus to `loginError` and freezes the button instead of just logging them in
- Purchase History shows local orders with delete button missing
- Post-order popup exists but is small

## Requested Changes (Diff)

### Add
- `createRawActorWithConfig` function in `config.ts` that uses `Actor.createActor` with the raw `idlFactory` from `./declarations/backend.did` — this gives direct access to `submitManualOrder`, `getManualOrders`, `markManualOrderVerified`
- Delete button in Purchase History next to each local order (removes from localStorage)
- Bigger, more visible post-order popup in PaymentModal

### Modify
- `config.ts`: Add `createRawActorWithConfig` export that bypasses the typed Backend wrapper
- `useInternetIdentity.ts`: Fix the `login()` function — when user already has a valid delegation, call `handleLoginSuccess()` instead of `setErrorMessage('User is already authenticated')`
- `PurchaseHistory.tsx`: Add delete button per order with a `deleteLocalOrder` utility call
- `PaymentModal.tsx`: Make the `showHistoryPopup` larger (bigger font, padding, and more visible)

### Remove
- Nothing removed

## Implementation Plan
1. Add `createRawActorWithConfig` to `config.ts` using `Actor.createActor` + raw `idlFactory`
2. Fix `useInternetIdentity.ts` login() to call `handleLoginSuccess()` on valid existing session
3. Add `deleteLocalOrder(id: string)` to `localOrders.ts`
4. Update `PurchaseHistory.tsx` to show delete button and call `deleteLocalOrder`
5. Update `PaymentModal.tsx` to make the post-order popup larger and more visible
