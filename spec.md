# ShadowMC Store

## Current State
- Player TAB is a floating bar fixed at `bottom-0 right-0` (CartSummaryBar.tsx), displayed outside the navbar as a large button
- Orders keep failing with "canister is stopped" error — canister 3m3vl-qaaaa-aaaab-qf4eq-cai stops between deploys
- Navbar has logo, nav links, cart icon badge, currency toggle, and Discord button

## Requested Changes (Diff)

### Add
- Compact Player TAB widget embedded in the Navbar, below the main navbar row, right-aligned
- Widget shows: player name (small font), item count (e.g. "1 item"), and total price separated by "|"

### Modify
- Move Player TAB from CartSummaryBar.tsx floating bottom-right position INTO the Navbar, as a second row below the main navbar bar
- Player TAB row: compact, single line, right-aligned, small text, always visible once username is set
- Format: `PlayerName  |  1 item  |  349` — all small text, compact, clickable to open cart
- Remove the old CartSummaryBar floating bottom-right widget (or hide it)
- Restart/redeploy backend to fix canister-stopped orders error

### Remove
- CartSummaryBar as a separate floating bottom component (replace with navbar-embedded compact version)

## Implementation Plan
1. Edit Navbar.tsx to add a second compact row below the main navbar that shows Player TAB info
2. Remove or hide CartSummaryBar.tsx (no longer needed as a floating element)
3. Redeploy triggers canister restart which fixes the orders-not-showing issue
