import { getActiveCheckoutMessages, saveMessages } from "../services/messages.server";

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

  const body = await request.json();
  const messages = saveMessages(body.shop, body.messages);

  return json({
    ok: true,
    messages,
  });
}
