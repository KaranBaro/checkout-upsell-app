/* eslint-disable react/prop-types */
import "@shopify/ui-extensions/preact";
import { render } from "preact";

const CHECKOUT_DISCOUNTS_METAFIELD = {
  namespace: "$app",
  key: "checkoutDiscounts",
};

export default async () => {
  render(<CheckoutDiscounts />, document.body);
};

function CheckoutDiscounts() {
  const cartLines = shopify.lines.value;
  const subtotal = Number(shopify.cost.subtotalAmount.value.amount || 0);
  const cartQuantity = cartLines.reduce((total, line) => total + line.quantity, 0);
  const appliedCodes = shopify.discountCodes.value.map((discountCode) =>
    discountCode.code.toUpperCase(),
  );
  const canUpdateDiscountCodes =
    shopify.instructions.value.discounts.canUpdateDiscountCodes;
  const discounts = getCheckoutDiscounts().filter((discount) =>
    shouldShowDiscount(discount, subtotal, cartQuantity),
  );

  if (discounts.length === 0) return null;

  return (
    <s-stack gap="base">
      {discounts.map((discount) => (
        <DiscountCard
          key={discount.id || discount.code || discount.title}
          discount={discount}
          applied={discount.code ? appliedCodes.includes(discount.code.toUpperCase()) : false}
          canUpdateDiscountCodes={canUpdateDiscountCodes}
        />
      ))}
    </s-stack>
  );
}

function DiscountCard({ discount, applied, canUpdateDiscountCodes }) {
  const canApplyCode =
    discount.method === "Discount code" &&
    discount.code &&
    canUpdateDiscountCodes;

  return (
    <s-box border="base" borderRadius="base" padding="base">
      <s-stack gap="base">
        <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
          <s-stack gap="small">
            <s-text type="strong">{discount.title}</s-text>
            <s-text>{formatOffer(discount)}</s-text>
          </s-stack>

          {canApplyCode && (
            <s-button
              variant={applied ? "tertiary" : "secondary"}
              tone={applied ? "critical" : undefined}
              onClick={() => toggleDiscountCode(discount.code, applied)}
            >
              {applied ? "Remove" : "Apply"}
            </s-button>
          )}
        </s-grid>

        {discount.method === "Discount code" ? (
          <s-text color="subdued">Code: {discount.code}</s-text>
        ) : (
          <s-text color="subdued">Applies automatically when conditions are met.</s-text>
        )}

        <s-stack gap="small">
          <s-text color="subdued">{formatMinimum(discount)}</s-text>
          <s-text color="subdued">{formatEligibility(discount)}</s-text>
          <s-text color="subdued">{formatCombinations(discount.combinesWith)}</s-text>
          {formatDateRange(discount) && (
            <s-text color="subdued">{formatDateRange(discount)}</s-text>
          )}
        </s-stack>

        {discount.method === "Automatic discount" && (
          <s-banner tone="info">
            This checkout block displays the offer. Create the matching automatic
            discount in Shopify Admin for price calculation.
          </s-banner>
        )}

        {discount.method === "Discount code" && !canUpdateDiscountCodes && (
          <s-banner tone="warning">
            Discount codes cannot be updated in this checkout session.
          </s-banner>
        )}
      </s-stack>
    </s-box>
  );
}

async function toggleDiscountCode(code, applied) {
  const result = await shopify.applyDiscountCodeChange({
    type: applied ? "removeDiscountCode" : "addDiscountCode",
    code,
  });

  if (result.type === "error") {
    console.error("Discount code change failed", result.message);
  }
}

function getCheckoutDiscounts() {
  const checkoutDiscounts = shopify.appMetafields.value.find(
    (appMetafield) =>
      appMetafield.target.type === "shop" &&
      appMetafield.metafield.namespace === CHECKOUT_DISCOUNTS_METAFIELD.namespace &&
      appMetafield.metafield.key === CHECKOUT_DISCOUNTS_METAFIELD.key,
  );

  if (!checkoutDiscounts?.metafield?.value) return [];

  try {
    const discounts = JSON.parse(checkoutDiscounts.metafield.value);

    return Array.isArray(discounts) ? discounts : [];
  } catch (error) {
    console.error("Checkout discounts metafield parse error", error);
    return [];
  }
}

function shouldShowDiscount(discount, subtotal, cartQuantity) {
  if (discount.minimumRequirement === "amount") {
    return subtotal >= Number(discount.minimumPurchase || 0);
  }

  if (discount.minimumRequirement === "quantity") {
    return cartQuantity >= Number(discount.minimumQuantity || 0);
  }

  return true;
}

function formatOffer(discount) {
  if (discount.category === "Buy X get Y") {
    return `Buy ${discount.buyQuantity || 1}, get ${discount.getQuantity || 1}`;
  }

  if (discount.category === "Free shipping" || discount.type === "Free shipping") {
    return "Free shipping";
  }

  if (discount.type === "Percentage") {
    return `${discount.value || 0}% off`;
  }

  return `₹${Number(discount.value || 0).toLocaleString("en-IN")} off`;
}

function formatMinimum(discount) {
  if (discount.minimumRequirement === "amount") {
    return `Minimum purchase ₹${Number(discount.minimumPurchase || 0).toLocaleString("en-IN")}`;
  }

  if (discount.minimumRequirement === "quantity") {
    return `Minimum ${discount.minimumQuantity || 1} item(s)`;
  }

  return "No minimum requirement";
}

function formatEligibility(discount) {
  if (!discount.eligibility || discount.eligibility === "all") return "All customers";
  if (discount.eligibility === "segments") return "Specific customer segments";
  return "Specific customers";
}

function formatCombinations(combinesWith = {}) {
  const enabled = [
    combinesWith.productDiscounts && "product discounts",
    combinesWith.orderDiscounts && "order discounts",
    combinesWith.shippingDiscounts && "shipping discounts",
  ].filter(Boolean);

  return enabled.length ? `Combines with ${enabled.join(", ")}` : "Cannot combine with other discounts";
}

function formatDateRange(discount) {
  if (!discount.startsAt && !discount.endsAt) return "";
  if (discount.startsAt && discount.endsAt) {
    return `Active ${discount.startsAt} to ${discount.endsAt}`;
  }
  if (discount.startsAt) return `Starts ${discount.startsAt}`;

  return `Ends ${discount.endsAt}`;
}
