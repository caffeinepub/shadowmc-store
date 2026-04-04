# ShadowMC Store

## Current State
The store has a working frontend with payment flow, entry popup, admin panel (PIN: 1313), and screenshot upload. However, orders and screenshots are saved to **localStorage** (the player's own browser), so the admin panel can never see purchases made by other players. The backend has no endpoint for manual UPI orders.

## Requested Changes (Diff)

### Add
- Backend: `submitManualOrder` public shared function (no auth needed) that accepts order details + screenshot base64 and stores them in canister stable memory
- Backend: `getManualOrders` query function that returns all manual orders (no auth check -- admin panel uses PIN-based auth on frontend)
- Backend: `markManualOrderVerified` function that sets verified status on an order

### Modify
- `PaymentModal.tsx`: After screenshot upload + confirmation, call `backend.submitManualOrder(...)` instead of (or in addition to) localStorage. The backend call should be best-effort (don't block the user if it fails).
- `AdminPanel.tsx`: On login, fetch orders from `backend.getManualOrders()` instead of reading from localStorage. Show screenshot column with thumbnail. Add "Refresh" button.

### Remove
- localStorage-only order saving (keep as fallback but primary must be canister)

## Implementation Plan
1. Update `src/backend/main.mo` to add ManualOrder type, submitManualOrder, getManualOrders, markManualOrderVerified
2. Regenerate backend bindings
3. Update PaymentModal.tsx to call backend.submitManualOrder after order confirmation
4. Update AdminPanel.tsx to call backend.getManualOrders and display results with screenshot thumbnails
5. Validate and deploy
