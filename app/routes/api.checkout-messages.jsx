import { authenticate } from "../shopify.server";
import {
  getActiveCheckoutMessages,
  saveMessages,
  syncCheckoutMessagesMetafield,
} from "../services/messages.server";

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

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const messages = getActiveCheckoutMessages(shop);

  return json({
    enabled: messages.length > 0,
    messages,
  });
}

export async function action({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { admin, session } = await authenticate.admin(request);
  const body = await request.json();
  const shop = body.shop || session.shop;
  const messages = saveMessages(shop, body.messages);
  await syncCheckoutMessagesMetafield(admin, shop, messages);

  return json({
    ok: true,
    messages,
  });
}
