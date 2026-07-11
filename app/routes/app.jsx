import { useState } from "react";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import useUpsells from "../hooks/useUpsells";

/* global process */

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
};

export default function App() {
  const { apiKey } = useLoaderData();
  const upsellState = useUpsells();
  const [messages, setMessages] = useState([
    {
      id: 1,
      category: "Amount off order",
      method: "Discount code",
      title: "Free Shipping Above ₹5000",
      type: "Shipping",
      message: "Free shipping on orders above ₹5000",
      status: "Active",
    },
    {
      id: 2,
      title: "Save 10% With UPI",
      type: "Discount",
      message: "Pay with UPI and save 10% on your order",
      status: "Active",
    },
  ]);
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
