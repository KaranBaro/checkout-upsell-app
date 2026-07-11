import { authenticate } from "../shopify.server";
import {
  getActiveCheckoutUpsells,
  syncCheckoutUpsellsMetafield,
} from "../services/upsells.server";

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
    upsells: [],
  });
}

export async function action({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { admin } = await authenticate.admin(request);
  const body = await request.json();
  const upsells = Array.isArray(body.upsells) ? body.upsells : [];
  const checkoutUpsells = await syncCheckoutUpsellsMetafield(admin, upsells);

  return json({
    ok: true,
    enabled: checkoutUpsells.length > 0,
    upsells: checkoutUpsells,
    preview: getActiveCheckoutUpsells(upsells),
  });
}
