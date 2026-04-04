# ShadowMC Store

## Current State

- Full Minecraft store with Ranks, Coins, Cart, UPI/Manual payment flow, Admin panel (PIN 1313), Purchase History
- Cart stores items in React state; CartDrawer shows items and checkout button
- RanksSection and CoinsSection each have "Buy Now" buttons that call `addItem` from CartContext directly
- Purchase History loads UPI orders from localStorage and Stripe orders from backend
- Backend stores manual orders in `manualOrders` list with `verified` boolean
- Admin panel marks orders verified via `markManualOrderVerified`
- Bug: Purchase History reads verified status from localStorage only — does NOT re-check backend
- Bug: Order IDs use a counter in backend but frontend saves orders to localStorage with fixed IDs; if a player submits two orders from same device, the second may overwrite the first in localStorage
- No suggestions shown when a player adds something to cart

## Requested Changes (Diff)

### Add
- **Product Suggestions Modal**: When a player clicks "Buy Now" on any rank or coin bundle, show a small suggestions popup/modal (before or alongside opening the cart) showing 2-3 complementary products they might also want. For example:
  - Buying a rank → suggest coin bundles ("Complete your setup with coins!")
  - Buying coins → suggest the next rank up or a bigger coin bundle
  - Modal shows suggested items with price and "Add to Cart" button each
  - After dismissing or adding suggestions, cart opens as normal

### Modify
- **Purchase History verified status**: After loading local orders, also fetch all manual orders from backend (`getManualOrders`) and cross-reference by order ID to update the `verified` flag. This way, when admin marks an order verified, the player sees "Verified" status after refreshing.
- **Multiple orders per account**: Fix localStorage order saving so each order gets a truly unique ID (timestamp + random suffix) instead of a counter that could collide. Also ensure new orders append to the list instead of overwriting.

### Remove
- Nothing removed

## Implementation Plan

1. Create `SuggestionsModal.tsx` component:
   - Props: `open`, `onClose`, `addedItem` (the item just added), `onAddSuggestion(item)`
   - Logic: if addedItem is a rank → show 2 coin bundle suggestions (mid-tier and best value); if addedItem is coins → show next rank up suggestion + bigger coin bundle if available
   - Renders as a Dialog/Sheet overlay with 2-3 suggestion cards, each with name, price, and "Add to Cart" button
   - Has a "Continue to Cart" button that closes modal and opens CartDrawer

2. Update `CartContext.tsx`:
   - `addItem` returns the added item so callers can trigger suggestion logic
   - Add `pendingSuggestion` state and `openSuggestions` / `closeSuggestions` functions OR handle in RanksSection/CoinsSection directly

3. Update `RanksSection.tsx` and `CoinsSection.tsx`:
   - On Buy Now click: call addItem, then show SuggestionsModal with relevant suggestions
   - Pass `setIsOpen(false)` on cart so suggestions appear before cart opens, then on "Continue to Cart" open cart

4. Fix `PurchaseHistory.tsx`:
   - After loading local orders, call `getManualOrders()` from backend (no auth required, public endpoint)
   - Cross-reference by order ID, update verified status in local display state
   - Show synced status without modifying localStorage

5. Fix `utils/localOrders.ts`:
   - Ensure order IDs use `Date.now() + Math.random()` string to prevent collisions
   - Ensure `saveLocalOrder` appends to existing array (already does, confirm no overwrite bug)
