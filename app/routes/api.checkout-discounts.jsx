import { authenticate } from "../shopify.server";
import {
  getActiveCheckoutDiscounts,
  syncCheckoutDiscountsMetafield,
} from "../services/discounts.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...init.headers,
    },
  });
}

export async function loader() {
  return json({
    enabled: false,
    discounts: [],
  });
}

export async function action({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { admin } = await authenticate.admin(request);
  const body = await request.json();
  const discounts = Array.isArray(body.discounts) ? body.discounts : [];
  const checkoutDiscounts = await syncCheckoutDiscountsMetafield(admin, discounts);

  return json({
    ok: true,
    enabled: checkoutDiscounts.length > 0,
    discounts: checkoutDiscounts,
    preview: getActiveCheckoutDiscounts(discounts),
  });
}
