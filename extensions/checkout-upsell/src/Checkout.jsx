/* eslint-disable react/prop-types */
import "@shopify/ui-extensions/preact";
import { render } from "preact";

const CHECKOUT_UPSELLS_METAFIELD = {
  namespace: "$app",
  key: "checkoutUpsells",
};

export default async () => {
  render(<CheckoutUpsell />, document.body);
};

function CheckoutUpsell() {
  const cartLines = shopify.lines.value;
  const subtotal = Number(shopify.cost.subtotalAmount.value.amount || 0);
  const cartQuantity = cartLines.reduce((total, line) => total + line.quantity, 0);
  const upsells = getCheckoutUpsells().filter((upsell) =>
    shouldShowUpsell(upsell, cartLines, subtotal, cartQuantity),
  );

  if (upsells.length === 0) return null;

  return (
    <s-stack gap="base">
      {upsells.map((upsell) => (
        <s-stack key={upsell.id} gap="base">
          <s-stack gap="small">
            <s-text type="strong">{upsell.title || "Recommended for you"}</s-text>
            {upsell.description && (
              <s-text color="subdued">{upsell.description}</s-text>
            )}
          </s-stack>

          <ProductsLayout upsell={upsell} />
        </s-stack>
      ))}
    </s-stack>
  );
}

function ProductsLayout({ upsell }) {
  const products = upsell.recommendedProducts || [];

  if (upsell.layout === "grid") {
    return (
      <s-grid gridTemplateColumns="1fr 1fr" gap="base">
        {products.map((product) => (
          <ProductCard key={product.id || product.title} product={product} actionType={upsell.actionType} compact />
        ))}
      </s-grid>
    );
  }

  if (upsell.layout === "slider") {
    return (
      <s-scroll-view direction="inline">
        <s-stack direction="inline" gap="base">
          {products.map((product) => (
            <s-box key={product.id || product.title} inlineSize="220px">
              <ProductCard product={product} actionType={upsell.actionType} compact />
            </s-box>
          ))}
        </s-stack>
      </s-scroll-view>
    );
  }

  return (
    <s-stack gap="base">
      {products.map((product) => (
        <ProductCard key={product.id || product.title} product={product} actionType={upsell.actionType} />
      ))}
    </s-stack>
  );
}

function ProductCard({ product, actionType, compact = false }) {
  const canAdd = Boolean(product.variantId);

  return (
    <s-box border="base" borderRadius="base" padding="base">
      <s-grid
        gridTemplateColumns={compact ? "1fr" : "64px 1fr auto"}
        gap="base"
        alignItems="center"
      >
        {!compact && product.image && (
          <s-image src={product.image} alt={product.title} />
        )}

        <s-stack gap="small">
          <s-text type="strong">{product.title}</s-text>
          {product.description && (
            <s-text color="subdued">{product.description}</s-text>
          )}
          {product.discountLabel && (
            <s-text color="success">{product.discountLabel}</s-text>
          )}
          {product.price && <s-text type="strong">{product.price}</s-text>}
        </s-stack>

        {actionType === "directAdd" && canAdd && (
          <s-button variant="secondary" onClick={() => addProduct(product.variantId)}>
            Add
          </s-button>
        )}
      </s-grid>
    </s-box>
  );
}

async function addProduct(variantId) {
  await shopify.applyCartLinesChange({
    type: "addCartLine",
    merchandiseId: variantId,
    quantity: 1,
  });
}

function getCheckoutUpsells() {
  const checkoutUpsells = shopify.appMetafields.value.find(
    (appMetafield) =>
      appMetafield.target.type === "shop" &&
      appMetafield.metafield.namespace === CHECKOUT_UPSELLS_METAFIELD.namespace &&
      appMetafield.metafield.key === CHECKOUT_UPSELLS_METAFIELD.key,
  );

  if (!checkoutUpsells?.metafield?.value) return [];

  try {
    const upsells = JSON.parse(checkoutUpsells.metafield.value);

    return Array.isArray(upsells) ? upsells : [];
  } catch (error) {
    console.error("Checkout upsell metafield parse error", error);
    return [];
  }
}

function shouldShowUpsell(upsell, cartLines, subtotal, cartQuantity) {
  if (!targetMatches(upsell, cartLines)) return false;
  if (!upsell.rules?.length) return true;

  return upsell.rules.every((rule) =>
    ruleMatches(rule, cartLines, subtotal, cartQuantity),
  );
}

function targetMatches(upsell, cartLines) {
  if (upsell.targetType !== "products") return true;

  const targetProductIds = (upsell.targetProducts || []).map((product) => product.id);
  if (targetProductIds.length === 0) return true;

  return cartLines.some((line) =>
    targetProductIds.includes(line.merchandise?.product?.id),
  );
}

function ruleMatches(rule, cartLines, subtotal, cartQuantity) {
  if (!rule?.value) return true;

  if (rule.condition === "cartQuantity") {
    return compare(cartQuantity, rule.operator, Number(rule.value));
  }

  if (rule.condition === "cartTotal" || rule.condition === "minimumPurchase") {
    return compare(subtotal, rule.operator, Number(rule.value));
  }

  if (rule.condition === "productInCart") {
    const hasProduct = cartLines.some((line) =>
      String(line.merchandise?.product?.id || "").includes(String(rule.value)),
    );

    return rule.operator === "excludes" ? !hasProduct : hasProduct;
  }

  return true;
}

function compare(actual, operator, expected) {
  if (Number.isNaN(expected)) return true;
  if (operator === "lessThan") return actual < expected;
  if (operator === "equals") return actual === expected;
  if (operator === "greaterThanOrEqual") return actual >= expected;

  return actual > expected;
}
