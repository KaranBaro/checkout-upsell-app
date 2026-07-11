export const CHECKOUT_UPSELLS_METAFIELD = {
  namespace: "$app",
  key: "checkoutUpsells",
};

function normalizeProduct(product) {
  return {
    id: product.id,
    variantId: product.variantId,
    title: product.title || "Recommended product",
    handle: product.handle,
    description: product.description,
    image: product.image,
    price: product.price,
    discountLabel: product.discountLabel,
  };
}

export function getActiveCheckoutUpsells(upsells = []) {
  return upsells
    .filter((upsell) => upsell.status === "Active")
    .map((upsell) => ({
      id: upsell.id,
      title: upsell.title || "Recommended for you",
      description: upsell.description || "",
      layout: upsell.layout || "stack",
      actionType: upsell.actionType || "recommend",
      targetType: upsell.targetType || "all",
      targetProducts: (upsell.targetProducts || []).map(normalizeProduct),
      targetCollections: upsell.targetCollections || [],
      rules: upsell.rules || [],
      discountId: upsell.discountId || "",
      recommendedProducts: (upsell.recommendedProducts || []).map(normalizeProduct),
    }))
    .filter((upsell) => upsell.recommendedProducts.length > 0);
}

export async function syncCheckoutUpsellsMetafield(admin, upsells = []) {
  const activeUpsells = getActiveCheckoutUpsells(upsells);

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
      mutation SyncCheckoutUpsells($metafields: [MetafieldsSetInput!]!) {
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
            namespace: CHECKOUT_UPSELLS_METAFIELD.namespace,
            key: CHECKOUT_UPSELLS_METAFIELD.key,
            type: "json",
            value: JSON.stringify(activeUpsells),
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

  return activeUpsells;
}
