import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Rank {
    id: bigint;
    tier: string;
    product: Product;
}
export type ProductType = {
    __kind__: "coinBundle";
    coinBundle: CoinBundle;
} | {
    __kind__: "rank";
    rank: Rank;
};
export interface ManualOrderItem {
    name: string;
    quantity: bigint;
    priceINR: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ManualOrder {
    id: bigint;
    verified: boolean;
    paymentMethod: string;
    username: string;
    blocked: boolean;
    email: string;
    totalINR: bigint;
    timestamp: Time;
    items: Array<ManualOrderItem>;
    screenshotBase64: string;
}
export interface ManualOrderLite {
    id: bigint;
    verified: boolean;
    paymentMethod: string;
    username: string;
    blocked: boolean;
    email: string;
    totalINR: bigint;
    timestamp: Time;
    items: Array<ManualOrderItem>;
    hasScreenshot: boolean;
}
export interface CoinBundle {
    id: bigint;
    coins: bigint;
    product: Product;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface StoreInfo {
    coinBundles: Array<CoinBundle>;
    coinBundleMultiplier: bigint;
    currency: string;
    rankDescription: string;
    ranks: Array<Rank>;
}
export interface Purchase {
    id: bigint;
    paymentSessionId: string;
    purchaseTime: Time;
    productId: bigint;
    productType: ProductType;
    caller: Principal;
    priceCents: bigint;
}
export interface UserProfile {
    id: Principal;
    username: string;
}
export interface Product {
    id: bigint;
    name: string;
    priceCents: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCoinBundle(coins: bigint, priceCents: bigint): Promise<void>;
    addRank(tier: string, priceCents: bigint, name: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockManualOrder(orderId: bigint): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteManualOrder(orderId: bigint): Promise<boolean>;
    getCallerPurchases(): Promise<Array<Purchase>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getManualOrders(): Promise<Array<ManualOrder>>;
    getManualOrdersLite(): Promise<Array<ManualOrderLite>>;
    getOrderScreenshot(orderId: bigint): Promise<string>;
    getPurchases(): Promise<Array<Purchase>>;
    getStore(): Promise<StoreInfo>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVerifiedPurchaseIds(): Promise<Array<bigint>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markManualOrderVerified(orderId: bigint): Promise<boolean>;
    markPurchaseVerified(purchaseId: bigint): Promise<boolean>;
    purchaseProduct(productId: bigint, productType: ProductType, priceCents: bigint, paymentSessionId: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitManualOrder(username: string, email: string, items: Array<ManualOrderItem>, totalINR: bigint, paymentMethod: string, screenshotBase64: string): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
