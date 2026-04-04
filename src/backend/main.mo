import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let allCoinBundles = Map.empty<Nat, CoinBundle>();
  let allRanks = Map.empty<Nat, Rank>();

  public type UserProfile = {
    username : Text;
    id : Principal;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Product = {
    id : Nat;
    name : Text;
    priceCents : Nat;
  };

  public type CoinBundle = {
    id : Nat;
    coins : Nat;
    product : Product;
  };

  public type Rank = {
    id : Nat;
    tier : Text;
    product : Product;
  };

  public type Purchase = {
    id : Nat;
    caller : Principal;
    productId : Nat;
    productType : ProductType;
    purchaseTime : Time.Time;
    priceCents : Nat;
    paymentSessionId : Text;
  };

  public type ShoppingCartItem = {
    id : Nat;
    productId : Nat;
    productType : ProductType;
    quantity : Nat;
    priceCents : Nat;
  };

  public type ProductType = {
    #coinBundle : CoinBundle;
    #rank : Rank;
  };

  public type StoreConfig = {
    currency : Text;
    rankDescription : Text;
    rankBasePrice : Nat;
  };

  public type StoreInfo = {
    currency : Text;
    rankDescription : Text;
    coinBundleMultiplier : Nat;
    coinBundles : [CoinBundle];
    ranks : [Rank];
  };

  var storeConfig : StoreConfig = {
    currency = "USD";
    rankDescription = "Awesome Minecraft ranks";
    rankBasePrice = 499;
  };

  let purchases = List.empty<Purchase>();

  // Separate map tracking which purchase IDs have been verified by admin
  let verifiedPurchaseIds = Map.empty<Nat, Time.Time>();

  var rankIdCounter = 1;
  var purchaseIdCounter = 1;
  var coinBundleIdCounter = 1;

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public access - no authentication required
  public query func getStore() : async StoreInfo {
    {
      currency = storeConfig.currency;
      rankDescription = storeConfig.rankDescription;
      coinBundleMultiplier = 2;
      coinBundles = allCoinBundles.values().toArray();
      ranks = allRanks.values().toArray();
    };
  };

  public shared ({ caller }) func addRank(tier : Text, priceCents : Nat, name : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add ranks");
    };
    let rankId = rankIdCounter;
    rankIdCounter += 1;

    let newRank : Rank = {
      id = rankId;
      tier;
      product = {
        id = rankId;
        name;
        priceCents;
      };
    };

    allRanks.add(rankId, newRank);
  };

  public shared ({ caller }) func addCoinBundle(coins : Nat, priceCents : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add coin bundles");
    };
    let bundleId = coinBundleIdCounter;
    coinBundleIdCounter += 1;

    let newBundle : CoinBundle = {
      id = bundleId;
      coins;
      product = {
        id = bundleId;
        priceCents;
        name = coins.toText() # " Coins";
      };
    };

    allCoinBundles.add(bundleId, newBundle);
  };

  public query ({ caller }) func getPurchases() : async [Purchase] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all purchases");
    };
    purchases.toArray();
  };

  public query ({ caller }) func getCallerPurchases() : async [Purchase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view purchases");
    };
    let userPurchases = purchases.filter(
      func(p) { p.caller == caller }
    );
    userPurchases.toArray();
  };

  // Admin: mark a purchase as verified (UPI payment confirmed)
  public shared ({ caller }) func markPurchaseVerified(purchaseId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can verify purchases");
    };
    verifiedPurchaseIds.add(purchaseId, Time.now());
    true;
  };

  // Admin: get all verified purchase IDs
  public query ({ caller }) func getVerifiedPurchaseIds() : async [Nat] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view verified purchases");
    };
    verifiedPurchaseIds.keys().toArray();
  };

  // Stripe integration
  var configuration : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Too restrictive for customers");
    };
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func purchaseProduct(
    productId : Nat,
    productType : ProductType,
    priceCents : Nat,
    paymentSessionId : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can purchase products");
    };

    let purchaseId = purchaseIdCounter;
    purchaseIdCounter += 1;

    let newPurchase : Purchase = {
      priceCents;
      paymentSessionId;
      id = purchaseId;
      productType;
      caller;
      productId;
      purchaseTime = Time.now();
    };

    purchases.add(newPurchase);
    "Purchase completed successfully";
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
