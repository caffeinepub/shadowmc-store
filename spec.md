# ShadowMC Server Store

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A Minecraft server store for shadowmcnet.falix.gg
- Ranks section: purchasable rank packages (e.g. VIP, MVP, Legend) with perks listed
- Coins section: purchasable coin bundles (e.g. 500, 1000, 5000 coins)
- Shopping cart: add items, view total, checkout flow
- Featured/hero banner showing server IP and branding
- Smooth, dark Minecraft-themed UI

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store product catalog (ranks + coin bundles), manage cart/orders, track purchases
2. Frontend: hero section with server IP, ranks grid, coins grid, cart sidebar, checkout modal
3. Stripe integration for payments
4. Authorization for purchase history per user
