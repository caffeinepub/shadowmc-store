# ShadowMC Store

## Current State
The admin panel at `?page=admin` requires Internet Identity login and checks the `isCallerAdmin` backend function. Payment screenshots are uploaded in the PaymentModal (Step 3) but are only stored locally in component state and never persisted anywhere -- they are lost when the modal closes. The admin panel shows order stats and a table of purchases but has no screenshot column.

## Requested Changes (Diff)

### Add
- 4-digit password gate (password: `1313`) on the admin panel, replacing Internet Identity entirely
- Password is stored in `localStorage` so admin doesn't need to re-enter on page reload
- Payment screenshot shown in admin panel for each order that has one
- Screenshots stored in `localStorage` keyed by a generated order ID (timestamp + items hash) when the user submits payment
- Admin panel orders table gets a new "Screenshot" column with a thumbnail that opens full-size on click

### Modify
- `AdminPanel.tsx`: Remove all Internet Identity / `useInternetIdentity` / `useIsAdmin` logic. Replace login screen with a simple 4-digit PIN input. After correct PIN entered, show the admin dashboard. Store PIN auth state in `localStorage`.
- `PaymentModal.tsx`: On Step 5 (success), save screenshot as base64 to `localStorage` keyed by `order_{timestamp}` and also store order metadata (username, email, items, amount, payment method). This data is what the admin panel reads.
- `AdminPanel.tsx`: Read all `order_*` keys from `localStorage`, parse and display in a table with screenshot thumbnails. No backend calls needed for the screenshot/order data display -- it's all from `localStorage`.

### Remove
- Internet Identity login flow from admin panel
- `isAdmin` backend checks from admin panel
- The existing backend-driven orders table in admin panel is kept but the screenshot column is added to the local orders view

## Implementation Plan
1. Update `PaymentModal.tsx`: On submit (Step 5), convert screenshot file to base64 and save order record to `localStorage` with key `shadowmc_order_{Date.now()}`
2. Rewrite `AdminPanel.tsx`: 
   - Replace Internet Identity with PIN input (4 digits, password 1313)
   - Store auth in `localStorage` key `shadowmc_admin_auth`
   - Read all `shadowmc_order_*` keys from localStorage and display in a rich table
   - Show screenshot thumbnail per order; clicking opens full image in a modal
   - Keep stats (total orders, revenue, unique players)
3. Update `App.tsx`: Remove `InternetIdentityProvider` wrapper from admin panel path since it's no longer needed there
