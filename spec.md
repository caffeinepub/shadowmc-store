# ShadowMC Store

## Current State
The store is a full-stack Minecraft server store with ranks, coins, UPI/manual payment flow, admin panel, and purchase history. Version 34 fixed the payload-too-large issue by separating screenshot data from order list (`getManualOrdersLite`). The admin panel uses Internet Identity login. Orders show correctly in the admin panel. The backend has `submitManualOrder`, `getManualOrdersLite`, `getOrderScreenshot`, `markManualOrderVerified`.

## Requested Changes (Diff)

### Add
- **Logo image in navbar**: Replace the text "ShadowMC" button with `shadow_mc_in_the_mist` image from `/assets/shadow_mc_in_the_mist-019d5d3d-38b0-762f-a25f-c34608a0a5df.png`
- **Background image**: Apply `mystical_castle_by_the_glowing_river` image as full-page background on all site sections
- **Admin panel Delete button**: Add a red "Delete" button per order row that calls `deleteManualOrder(orderId)` on the backend and removes the order from the list
- **Admin panel Block button**: Add an orange/amber "Block" button per order row that calls `blockManualOrder(orderId)` on the backend; blocked orders show a "Blocked" status badge
- **Purchase History verified sync fix**: When `PurchaseHistory` syncs from backend, use `getManualOrdersLite` (not the legacy `getManualOrders`) to get verified/blocked status per order. Blocked orders should show "Blocked" badge in red instead of "Pending Review".

### Modify
- `src/backend/main.mo`: Add `deleteManualOrder(orderId)` and `blockManualOrder(orderId)` functions. Add `blocked: Bool` field to `ManualOrder` and `ManualOrderLite` types.
- `src/frontend/src/components/Navbar.tsx`: Replace text logo with `<img>` element pointing to the logo asset
- `src/frontend/src/App.tsx` or global CSS: Set background image on the main wrapper div
- `src/frontend/src/pages/AdminPanel.tsx`: Add Delete and Block buttons next to Mark Verified button in each order row. Handle blocked state display.
- `src/frontend/src/components/PurchaseHistory.tsx`: Use `getManualOrdersLite` for sync (already does this via `getManualOrders` — needs to be switched to `getManualOrdersLite`). Handle `blocked` status from synced orders.
- `src/frontend/src/utils/localOrders.ts`: Add `blocked` field to `LocalOrder` type.

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add `blocked: Bool` to `ManualOrder`/`ManualOrderLite`, add `deleteManualOrder` and `blockManualOrder` public functions
2. Update `Navbar.tsx`: replace text with logo img
3. Update `App.tsx`: add background image to the main wrapper
4. Update `AdminPanel.tsx`: add Delete + Block buttons per row, show Blocked badge
5. Update `PurchaseHistory.tsx`: use `getManualOrdersLite`, handle `blocked` status display
6. Update `localOrders.ts`: add `blocked` field to type
