# ShadowMC Store

## Current State
Fully functional Minecraft store with ranks, coins, cart, admin panel, entry popup, Player TAB, and purchase history. Multiple currency display issues and UI bugs remain.

## Requested Changes (Diff)

### Add
- Player TAB now permanent after username registration (not just when cart has items)

### Modify
- Currency display: replace all ₹ symbols with `Rs` prefix (e.g. `Rs 349`), USD stays as `$2.66`
- Welcome box text: "Shadow MC is a free public Minecraft server" (was missing "Minecraft")
- Player TAB repositioned to bottom-right corner (fixed position), always shown after user registers
- Player TAB shows "Empty cart" when no items vs total price when items exist
- Admin panel revenue amounts use `Rs` prefix instead of `₹`
- CSP eval fix stays in place (unsafe-eval already added in index.html)
- Canister restart triggered by redeployment

### Remove
- Rupee Unicode symbol (₹) from all UI components

## Implementation Plan
1. Fix CurrencyContext.formatPrice to return `Rs X` instead of `₹X`
2. Fix CartSummaryBar: always visible when username exists, positioned bottom-right, shows `Rs`/`$` total
3. Fix PurchaseHistory welcome box text
4. Fix all hardcoded ₹ symbols in PurchaseHistory, AdminPanel, CartDrawer
5. Redeploy to restart stopped canister
