import { useCallback, useState } from "react";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import useUpsells from "../hooks/useUpsells";
import {
  getMessages,
  syncCheckoutMessagesMetafield,
} from "../services/messages.server";

/* global process */

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const messages = getMessages(session.shop);
  await syncCheckoutMessagesMetafield(admin, session.shop, messages);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop,
    messages,
  };
};

export default function App() {
  const { apiKey, shop, messages: initialMessages } = useLoaderData();
  const syncUpsells = useCallback(async (nextUpsells) => {
    try {
      await fetch("/api/checkout-upsells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, upsells: nextUpsells }),
      });
    } catch (error) {
      console.error("Failed to sync checkout upsells:", error);
    }
  }, [shop]);
  const upsellState = useUpsells({ onChange: syncUpsells });
  const [messages, setMessages] = useState(initialMessages);
  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      title: "Welcome offer",
      code: "WELCOME10",
      type: "Percentage",
      value: 10,
      minimumPurchase: 1000,
      status: "Active",
    },
  ]);

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app/dashboard">Dashboard</s-link>
        <s-link href="/app/messages">Checkout Messages</s-link>
        <s-link href="/app/discounts">Discounts</s-link>
        <s-link href="/app/upsells">Upsells</s-link>
        <s-link href="/app/analytics">Analytics</s-link>
        <s-link href="/app/settings">Settings</s-link>
      </s-app-nav>

      <Outlet
        context={{
          messages,
          setMessages,
          shop,
          discounts,
          setDiscounts,
          ...upsellState,
        }}
      />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
