import {
  APP_METAFIELD_NAMESPACE,
  readShopJsonMetafield,
  setShopJsonMetafields,
} from "./shop-metafields.server";

export const CHECKOUT_DISCOUNTS_METAFIELD = {
  namespace: APP_METAFIELD_NAMESPACE,
  key: "checkoutDiscounts",
};

export const DASHBOARD_DISCOUNTS_METAFIELD = {
  namespace: APP_METAFIELD_NAMESPACE,
  key: "dashboardDiscounts",
};

function normalizeCombinesWith(combinesWith = {}) {
  return {
    orderDiscounts: Boolean(combinesWith.orderDiscounts),
    productDiscounts: Boolean(combinesWith.productDiscounts),
    shippingDiscounts: Boolean(combinesWith.shippingDiscounts),
  };
}

function normalizeDiscount(discount) {
  const method = discount.method || "Discount code";

  return {
    id: discount.id,
    title: discount.title || "Checkout discount",
    category: discount.category || "Amount off order",
    method,
    code: method === "Discount code" ? String(discount.code || "").toUpperCase() : "",
    type: discount.type || "Percentage",
    value: Number(discount.value || 0),
    appliesTo: discount.appliesTo || "all",
    purchaseType: discount.purchaseType || "oneTime",
    minimumRequirement: discount.minimumRequirement || (discount.minimumPurchase > 0 ? "amount" : "none"),
    minimumPurchase: Number(discount.minimumPurchase || 0),
    minimumQuantity: Number(discount.minimumQuantity || 0),
    eligibility: discount.eligibility || "all",
    usageLimit: discount.usageLimit ? Number(discount.usageLimit) : null,
    oneUsePerCustomer: Boolean(discount.oneUsePerCustomer),
    combinesWith: normalizeCombinesWith(discount.combinesWith),
    startsAt: discount.startsAt || "",
    startsTime: discount.startsTime || "",
    endsAt: discount.endsAt || "",
    endsTime: discount.endsTime || "",
    buyQuantity: Number(discount.buyQuantity || 0),
    getQuantity: Number(discount.getQuantity || 0),
    customerGets: discount.customerGets || "",
    rewardType: discount.rewardType || "",
    rewardValue: Number(discount.rewardValue || 0),
    source: discount.source || "",
    shopifyDiscountId: discount.shopifyDiscountId || "",
    shopifyDiscountClass: discount.shopifyDiscountClass || "",
  };
}

export function getActiveCheckoutDiscounts(discounts = []) {
  return discounts
    .filter((discount) => discount.status === "Active")
    .filter((discount) => discount.source === "native" && discount.shopifyDiscountId)
    .map(normalizeDiscount)
    .filter((discount) => discount.method !== "Discount code" || discount.code);
}

export async function loadDashboardDiscounts(admin) {
  const dashboardDiscounts = await readShopJsonMetafield(
    admin,
    DASHBOARD_DISCOUNTS_METAFIELD,
    null,
  );

  if (dashboardDiscounts) {
    return dashboardDiscounts;
  }

  const checkoutDiscounts = await readShopJsonMetafield(admin, CHECKOUT_DISCOUNTS_METAFIELD, []);

  return checkoutDiscounts.map((discount) => ({
    ...discount,
    status: discount.status || "Active",
  }));
}

export async function syncCheckoutDiscountsMetafield(admin, discounts = []) {
  const activeDiscounts = getActiveCheckoutDiscounts(discounts);

  await setShopJsonMetafields(admin, [
    {
      ...DASHBOARD_DISCOUNTS_METAFIELD,
      value: discounts,
    },
    {
      ...CHECKOUT_DISCOUNTS_METAFIELD,
      value: activeDiscounts,
    },
  ]);

  return activeDiscounts;
}
