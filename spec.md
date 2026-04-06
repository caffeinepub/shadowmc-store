# ShadowMC Store

## Current State
The store is live. The CSP eval error blocks Internet Identity. Login freezes when a valid session already exists. Cart summary bar exists but username doesn't show. Canister keeps stopping.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `useInternetIdentity.ts`: Fix login freeze -- call `handleLoginSuccess()` when valid session exists, not `setErrorMessage`
- Cart summary bar: ensure username from UserInfoContext is always shown

### Remove
- Nothing

## Implementation Plan
1. Fix Internet Identity login freeze in useInternetIdentity.ts
2. Deploy fresh to restart stopped canister
