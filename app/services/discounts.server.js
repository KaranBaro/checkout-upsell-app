export const CHECKOUT_DISCOUNTS_METAFIELD = {
  namespace: "$app",
  key: "checkoutDiscounts",
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
  };
}

export function getActiveCheckoutDiscounts(discounts = []) {
  return discounts
    .filter((discount) => discount.status === "Active")
    .map(normalizeDiscount)
    .filter((discount) => discount.method !== "Discount code" || discount.code);
}

export async function syncCheckoutDiscountsMetafield(admin, discounts = []) {
  const activeDiscounts = getActiveCheckoutDiscounts(discounts);

  const shopResponse = await admin.graphql(
    `#graphql
      query CurrentShop {
        shop {
          id
        }
      }
    `,
  );
  const shopBody = await shopResponse.json();
  const ownerId = shopBody.data?.shop?.id;

  if (!ownerId) {
    throw new Error("Unable to find current shop");
  }

  const metafieldResponse = await admin.graphql(
    `#graphql
      mutation SyncCheckoutDiscounts($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace: CHECKOUT_DISCOUNTS_METAFIELD.namespace,
            key: CHECKOUT_DISCOUNTS_METAFIELD.key,
            type: "json",
            value: JSON.stringify(activeDiscounts),
          },
        ],
      },
    },
  );
  const metafieldBody = await metafieldResponse.json();
  const errors = metafieldBody.data?.metafieldsSet?.userErrors ?? [];

  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return activeDiscounts;
}
