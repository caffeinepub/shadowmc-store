# ShadowMC Store

## Current State
Full Minecraft store with ranks, coins, cart, purchase history, admin panel, entry popup, currency toggle. Multiple CSP issues (Google Fonts blocked, eval blocked), admin button visible in navbar, cart summary bar shows ₹ unicode escape, admin panel needs sidebar redesign.

## Requested Changes (Diff)

### Add
- Bedrock Edition toggle in entry popup with flick animation; auto-prepends dot to username when ON, prevents backspace removal of dot; removes dot when OFF
- Admin panel left sidebar with clickable: Orders (shows all orders), Total Revenue, Usernames (shows player list)
- Player TAB section in navbar area (shows username, item count, total)

### Modify
- Remove Admin button from navbar (hidden from all users; admin panel only accessible via ?page=admin URL)
- Fix CSP in index.html: add fonts.googleapis.com and fonts.gstatic.com to style-src
- Fix currency display: remove ₹ symbol (show plain number like "349" not "₹349") — actually keep ₹ symbol but fix the \u20b9 unicode escape showing as raw text in CartSummaryBar
- Admin panel: redesign with left sidebar layout; Orders replaces Total Orders and is clickable; Usernames replaces Unique Players and is clickable to show player list; Total Revenue stays
- CartSummaryBar: show username, item count, total correctly

### Remove
- Admin button from navbar
- \u20b9 raw unicode escape from CartSummaryBar (use ₹ directly)

## Implementation Plan
1. Fix index.html CSP to allow fonts.googleapis.com and fonts.gstatic.com
2. Remove Admin button from Navbar.tsx
3. Fix CartSummaryBar.tsx: fix ₹ symbol rendering, show username/item count/total properly
4. Update EntryPopup.tsx: add Bedrock Edition toggle with flick animation
5. Redesign AdminPanel.tsx: left sidebar with Orders/Revenue/Usernames tabs
