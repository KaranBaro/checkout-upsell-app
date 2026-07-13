import {
  APP_METAFIELD_NAMESPACE,
  readShopJsonMetafield,
  setShopJsonMetafields,
} from "./shop-metafields.server";

export const CHECKOUT_UPSELLS_METAFIELD = {
  namespace: APP_METAFIELD_NAMESPACE,
  key: "checkoutUpsells",
};

export const DASHBOARD_UPSELLS_METAFIELD = {
  namespace: APP_METAFIELD_NAMESPACE,
  key: "dashboardUpsells",
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
      layout: upsell.layout === "stack" ? "stack" : "grid",
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

export async function loadDashboardUpsells(admin) {
  const dashboardUpsells = await readShopJsonMetafield(
    admin,
    DASHBOARD_UPSELLS_METAFIELD,
    null,
  );

  if (dashboardUpsells) {
    return dashboardUpsells;
  }

  const checkoutUpsells = await readShopJsonMetafield(admin, CHECKOUT_UPSELLS_METAFIELD, []);

  return checkoutUpsells.map((upsell) => ({
    ...upsell,
    status: upsell.status || "Active",
  }));
}

export async function syncCheckoutUpsellsMetafield(admin, upsells = []) {
  const activeUpsells = getActiveCheckoutUpsells(upsells);

  await setShopJsonMetafields(admin, [
    {
      ...DASHBOARD_UPSELLS_METAFIELD,
      value: upsells,
    },
    {
      ...CHECKOUT_UPSELLS_METAFIELD,
      value: activeUpsells,
    },
  ]);

  return activeUpsells;
}

export async function syncDashboardUpsellsMetafield(admin, upsells = []) {
  await setShopJsonMetafields(admin, [
    {
      ...DASHBOARD_UPSELLS_METAFIELD,
      value: upsells,
    },
  ]);

  return upsells;
}
