import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

export default async () => {
  render(<CheckoutUpsell />, document.body);
};

function CheckoutUpsell() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadUpsells() {
      try {
        const shop = shopify.shop.myshopifyDomain;

        const res = await fetch(
          `https://skippo.in/api/checkout-upsells?shop=${shop}`
        );

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Upsell fetch error", error);
      }
    }

    loadUpsells();
  }, []);

  if (!data?.enabled || !data?.products?.length) return null;

  async function addProduct(variantId) {
    await shopify.applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: variantId,
      quantity: 1,
    });
  }

  return (
    <s-stack gap="base">
      <s-stack gap="small">
        <s-text type="strong">{data.title || "Recommended for you"}</s-text>

        {data.description && (
          <s-text color="subdued">{data.description}</s-text>
        )}
      </s-stack>

      {data.products.map((product) => (
        <s-box border="base" borderRadius="base" padding="base" key={product.variantId}>
          <s-grid gridTemplateColumns="64px 1fr auto" gap="base" alignItems="center">
            <s-image src={product.image} alt={product.title} />

            <s-stack gap="small">
              <s-text type="strong">{product.title}</s-text>
              {product.description && (
                <s-text color="subdued">{product.description}</s-text>
              )}
              {product.discountLabel && (
                <s-text color="success">{product.discountLabel}</s-text>
              )}
            </s-stack>

            <s-stack gap="small">
              {product.price && <s-text type="strong">{product.price}</s-text>}

              <s-button
                variant="secondary"
                onClick={() => addProduct(product.variantId)}
              >
                Add
              </s-button>
            </s-stack>
          </s-grid>
        </s-box>
      ))}
    </s-stack>
  );
}