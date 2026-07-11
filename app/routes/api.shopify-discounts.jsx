import { authenticate } from "../shopify.server";
import {
  deleteShopifyCodeDiscount,
  saveShopifyCodeDiscount,
} from "../services/shopify-discounts.server";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const body = await request.json();

  try {
    if (request.method === "DELETE" || body.action === "delete") {
      await deleteShopifyCodeDiscount(admin, body.shopifyDiscountId);
      return json({ ok: true });
    }

    const shopifyDiscount = await saveShopifyCodeDiscount(admin, body.discount || {});

    return json({
      ok: true,
      discount: {
        ...(body.discount || {}),
        ...shopifyDiscount,
        method: "Discount code",
        source: "native",
      },
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error.message || "Unable to save Shopify discount.",
      },
      { status: 422 },
    );
  }
}
