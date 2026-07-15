/* eslint-disable react/prop-types */
import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

const CHECKOUT_UPSELLS_METAFIELD = {
  namespace: "$app",
  key: "checkoutUpsells",
};

export default async () => {
  render(<CheckoutUpsell />, document.body);
};

// function CheckoutUpsell() {
//   const cartLines = shopify.lines.value;
//   const subtotal = Number(shopify.cost.subtotalAmount.value.amount || 0);
//   const cartQuantity = cartLines.reduce((total, line) => total + line.quantity, 0);
//   const upsells = getCheckoutUpsells().filter((upsell) =>
//     shouldShowUpsell(upsell, cartLines, subtotal, cartQuantity),
//   );

//   if (upsells.length === 0) return null;

//   return (
//     <s-stack gap="base">
//       {upsells.map((upsell) => (
//         <s-stack key={upsell.id} gap="base">
//           <s-stack gap="small">
//             <s-text type="strong">{upsell.title || "Recommended for you"}</s-text>
//           </s-stack>

//           <ProductsLayout upsell={upsell} cartLines={cartLines} />
//         </s-stack>
//       ))}
//     </s-stack>
//   );
// }

// function CheckoutUpsell() {
//   const cartLines = shopify.lines.value;
//   const subtotal = Number(
//     shopify.cost.subtotalAmount.value.amount || 0,
//   );

//   const cartQuantity = cartLines.reduce(
//     (total, line) => total + line.quantity,
//     0,
//   );

//   const [visibleUpsells, setVisibleUpsells] = useState([]);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadVisibleUpsells() {
//       const checkoutUpsells = getCheckoutUpsells();

//       const matchedUpsells = [];

//       for (const upsell of checkoutUpsells) {
//         const shouldShow = await shouldShowUpsell(
//           upsell,
//           cartLines,
//           subtotal,
//           cartQuantity,
//         );

//         if (shouldShow) {
//           matchedUpsells.push(upsell);
//         }
//       }

//       if (!cancelled) {
//         setVisibleUpsells(matchedUpsells);
//       }
//     }

//     loadVisibleUpsells();

//     return () => {
//       cancelled = true;
//     };
//   }, [cartLines, subtotal, cartQuantity]);

//   if (visibleUpsells.length === 0) return null;

//   return (
//     <s-stack gap="base">
//       {visibleUpsells.map((upsell) => (
//         <s-stack key={upsell.id} gap="base">
//           <s-stack gap="small">
//             <s-text type="strong">
//               {upsell.title || "Recommended for you"}
//             </s-text>

//             {upsell.description && (
//               <s-text>{upsell.description}</s-text>
//             )}
//           </s-stack>

//           <ProductsLayout
//             upsell={upsell}
//             cartLines={cartLines}
//           />
//         </s-stack>
//       ))}
//     </s-stack>
//   );
// }


function CheckoutUpsell() {
  const cartLines = shopify.lines.value;

  const subtotal = Number(
    shopify.cost.subtotalAmount.value.amount || 0,
  );

  const cartQuantity = cartLines.reduce(
    (total, line) => total + line.quantity,
    0,
  );

  const selectedUpsellId = String(
    shopify.settings.value?.upsell_id || "",
  ).trim();

  const [visibleUpsells, setVisibleUpsells] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadVisibleUpsells() {
      const checkoutUpsells = getCheckoutUpsells();

      const upsellsForThisBlock = checkoutUpsells.filter(
        (upsell) => {
          if (!selectedUpsellId) {
            return true;
          }

          return String(upsell.id) === selectedUpsellId;
        },
      );

      const matchedUpsells = [];

      for (const upsell of upsellsForThisBlock) {
        const shouldShow = await shouldShowUpsell(
          upsell,
          cartLines,
          subtotal,
          cartQuantity,
        );

        if (shouldShow) {
          matchedUpsells.push(upsell);
        }
      }

      if (!cancelled) {
        setVisibleUpsells(matchedUpsells);
      }
    }

    loadVisibleUpsells();

    return () => {
      cancelled = true;
    };
  }, [
    cartLines,
    subtotal,
    cartQuantity,
    selectedUpsellId,
  ]);

  if (visibleUpsells.length === 0) {
    return null;
  }

  return (
    <s-stack gap="base">
      {visibleUpsells.map((upsell) => (
        <s-stack key={upsell.id} gap="base">
          <s-stack gap="small">
            <s-text type="strong">
              {upsell.title || "Recommended for you"}
            </s-text>

            {upsell.description && (
              <s-text>{upsell.description}</s-text>
            )}
          </s-stack>

          <ProductsLayout
            upsell={upsell}
            cartLines={cartLines}
          />
        </s-stack>
      ))}
    </s-stack>
  );
}

function ProductsLayout({ upsell, cartLines }) {
  const products = upsell.recommendedProducts || [];
  const layout = upsell.layout === "stack" ? "stack" : "grid";

  if (layout === "stack") {
    return (
      <s-scroll-box overflow="auto auto" maxBlockSize="430px" maxInlineSize="100%">
        <s-stack gap="base">
          {products.map((product) => (
            <ProductCard
              key={product.id || product.title}
              product={product}
              cartLine={findCartLine(product, cartLines)}
            />
          ))}
        </s-stack>
      </s-scroll-box>
    );
  }

  return (
    <s-scroll-box overflow="auto auto" maxBlockSize="430px" maxInlineSize="100%">
      <s-grid gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap="base">
        {products.map((product) => (
          <ProductCard
            key={product.id || product.title}
            product={product}
            cartLine={findCartLine(product, cartLines)}
          />
        ))}
      </s-grid>
    </s-scroll-box>
  );
}

function ProductCard({ product, cartLine }) {
  const canAdd = Boolean(product.variantId);
  const canRemove = Boolean(cartLine?.id);
  const productTitle = titleCase(product.title);

  return (
    <s-box border="base" borderRadius="base" padding="base">
      <s-grid
        gridTemplateColumns={product.image ? "56px 1fr auto" : "1fr auto"}
        gap="base"
        alignItems="center"
      >
        {product.image && (
          <s-image
            src={product.image}
            alt={product.title}
            inlineSize="56px"
            aspectRatio={1}
            borderRadius="base"
          />
        )}

        <s-stack gap="small">
          <s-text>{productTitle}</s-text>
          {product.price && <s-text>{product.price}</s-text>}
        </s-stack>

        <s-grid gridTemplateColumns="auto auto" gap="small" alignItems="center">
          {canAdd && (
            <s-button
              variant="primary"
              inlineSize="fit-content"
              onClick={() => addProduct(product.variantId)}
            >
              Add
            </s-button>
          )}

          {canRemove && (
            <s-button
              variant="tertiary"
              inlineSize="fit-content"
              accessibilityLabel={`Remove ${productTitle}`}
              onClick={() => removeProduct(cartLine)}
            >
              ×
            </s-button>
          )}
        </s-grid>
      </s-grid>
    </s-box>
  );
}

function titleCase(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function findCartLine(product, cartLines) {
  if (!product.variantId) return null;

  return cartLines.find((line) => line.merchandise?.id === product.variantId);
}

async function addProduct(variantId) {
  await shopify.applyCartLinesChange({
    type: "addCartLine",
    merchandiseId: variantId,
    quantity: 1,
  });
}

async function removeProduct(cartLine) {
  await shopify.applyCartLinesChange({
    type: "removeCartLine",
    id: cartLine.id,
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

// function shouldShowUpsell(upsell, cartLines, subtotal, cartQuantity) {
//   if (!targetMatches(upsell, cartLines)) return false;
//   if (!upsell.rules?.length) return true;

//   return upsell.rules.every((rule) =>
//     ruleMatches(rule, cartLines, subtotal, cartQuantity),
//   );
// }

async function shouldShowUpsell(
  upsell,
  cartLines,
  subtotal,
  cartQuantity,
) {
  const matchesTarget = await targetMatches(
    upsell,
    cartLines,
  );

  if (!matchesTarget) {
    return false;
  }

  if (!upsell.rules?.length) {
    return true;
  }

  return upsell.rules.every((rule) =>
    ruleMatches(
      rule,
      cartLines,
      subtotal,
      cartQuantity,
    ),
  );
}

// function targetMatches(upsell, cartLines) {
//   if (upsell.targetType !== "products") return true;

//   const targetProductIds = (upsell.targetProducts || []).map((product) => product.id);
//   if (targetProductIds.length === 0) return true;

//   return cartLines.some((line) =>
//     targetProductIds.includes(line.merchandise?.product?.id),
//   );
// }

// async function targetMatches(upsell, cartLines) {
//   if (upsell.targetType === "all") {
//     return true;
//   }

//   if (upsell.targetType === "products") {
//     const targetProductIds = (
//       upsell.targetProducts || []
//     )
//       .map((product) => String(product.id || ""))
//       .filter(Boolean);

//     if (targetProductIds.length === 0) {
//       return false;
//     }

//     return cartLines.some((line) =>
//       targetProductIds.includes(
//         String(
//           line.merchandise?.product?.id || "",
//         ),
//       ),
//     );
//   }

//   if (upsell.targetType === "collections") {
//     const targetCollectionIds = (
//       upsell.targetCollections || []
//     )
//       .map((collection) =>
//         String(collection.id || ""),
//       )
//       .filter(Boolean);

//     if (targetCollectionIds.length === 0) {
//       return false;
//     }

//     const cartProductIds = [
//       ...new Set(
//         cartLines
//           .map((line) =>
//             String(
//               line.merchandise?.product?.id || "",
//             ),
//           )
//           .filter(Boolean),
//       ),
//     ];

//     if (cartProductIds.length === 0) {
//       return false;
//     }

//     return cartContainsTargetCollection(
//       cartProductIds,
//       targetCollectionIds,
//     );
//   }

//   return true;
// }

// async function cartContainsTargetCollection(
//   productIds,
//   targetCollectionIds,
// ) {
//   try {
//     const response = await shopify.query(
//       `#graphql
//         query CheckoutUpsellProductCollections(
//           $productIds: [ID!]!
//         ) {
//           nodes(ids: $productIds) {
//             ... on Product {
//               id
//               collections(first: 100) {
//                 nodes {
//                   id
//                 }
//               }
//             }
//           }
//         }
//       `,
//       {
//         variables: {
//           productIds,
//         },
//       },
//     );

//     const nodes = response?.data?.nodes || [];

//     return nodes.some((product) => {
//       const productCollectionIds =
//         product?.collections?.nodes?.map(
//           (collection) =>
//             String(collection.id || ""),
//         ) || [];

//       return productCollectionIds.some(
//         (collectionId) =>
//           targetCollectionIds.includes(
//             collectionId,
//           ),
//       );
//     });
//   } catch (error) {
//     console.error(
//       "Failed to check cart product collections:",
//       error,
//     );

//     return false;
//   }
// }

async function targetMatches(upsell, cartLines) {
  const targetType = String(
    upsell.targetType || "all",
  ).toLowerCase();

  /*
   * All-products targeting
   */
  if (
    targetType === "all" ||
    targetType === "allproducts" ||
    targetType === "all-products"
  ) {
    return true;
  }

  /*
   * Specific-product targeting
   */
  if (
    targetType === "products" ||
    targetType === "product"
  ) {
    const targetProductIds = (
      upsell.targetProducts || []
    )
      .map((product) =>
        normalizeShopifyId(
          product?.id ||
            product?.value ||
            product?.admin_graphql_api_id,
          "Product",
        ),
      )
      .filter(Boolean);

    if (targetProductIds.length === 0) {
      return false;
    }

    return cartLines.some((line) => {
      const cartProductId = normalizeShopifyId(
        line.merchandise?.product?.id,
        "Product",
      );

      return targetProductIds.includes(
        cartProductId,
      );
    });
  }

  /*
   * Collection targeting
   */
  if (
    targetType === "collections" ||
    targetType === "collection"
  ) {
    const targetCollectionIds = (
      upsell.targetCollections || []
    )
      .map((collection) =>
        normalizeShopifyId(
          collection?.id ||
            collection?.value ||
            collection?.admin_graphql_api_id,
          "Collection",
        ),
      )
      .filter(Boolean);

    if (targetCollectionIds.length === 0) {
      return false;
    }

    const cartProductIds = [
      ...new Set(
        cartLines
          .map((line) =>
            normalizeShopifyId(
              line.merchandise?.product?.id,
              "Product",
            ),
          )
          .filter(Boolean),
      ),
    ];

    if (cartProductIds.length === 0) {
      return false;
    }

    return await cartContainsTargetCollection(
      cartProductIds,
      targetCollectionIds,
    );
  }

  /*
   * Do not show an upsell when an unsupported
   * target type is saved.
   */
  return false;
}

async function cartContainsTargetCollection(
  productIds,
  targetCollectionIds,
) {
  if (
    productIds.length === 0 ||
    targetCollectionIds.length === 0
  ) {
    return false;
  }

  try {
    const response = await shopify.query(
      `#graphql
        query CheckoutUpsellProductCollections(
          $productIds: [ID!]!
        ) {
          nodes(ids: $productIds) {
            ... on Product {
              id
              collections(first: 250) {
                nodes {
                  id
                }
              }
            }
          }
        }
      `,
      {
        variables: {
          productIds,
        },
      },
    );

    if (response?.errors?.length) {
      console.error(
        "Collection targeting GraphQL error:",
        response.errors,
      );

      return false;
    }

    const products = (
      response?.data?.nodes || []
    ).filter(Boolean);

    return products.some((product) => {
      const productCollectionIds = (
        product?.collections?.nodes || []
      )
        .map((collection) =>
          normalizeShopifyId(
            collection?.id,
            "Collection",
          ),
        )
        .filter(Boolean);

      return productCollectionIds.some(
        (collectionId) =>
          targetCollectionIds.includes(
            collectionId,
          ),
      );
    });
  } catch (error) {
    console.error(
      "Failed to check cart product collections:",
      error,
    );

    return false;
  }
}

function normalizeShopifyId(value, resourceType) {
  if (value === null || value === undefined) {
    return "";
  }

  const id = String(value).trim();

  if (!id) {
    return "";
  }

  if (id.startsWith("gid://shopify/")) {
    return id;
  }

  const numericId = id.match(/\d+$/)?.[0];

  if (!numericId) {
    return id;
  }

  return `gid://shopify/${resourceType}/${numericId}`;
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
