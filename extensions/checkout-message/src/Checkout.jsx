import "@shopify/ui-extensions/preact";
import { render } from "preact";

const CHECKOUT_MESSAGES_METAFIELD = {
  namespace: "$app",
  key: "checkoutMessages",
};

export default async () => {
  render(<CheckoutMessage />, document.body);
};

function CheckoutMessage() {
  const messages = getCheckoutMessages();

  if (messages.length === 0) return null;

  return (
    <s-stack gap="small">
      {messages.map((message) => (
        <s-banner
          key={message.id}
          heading={message.title || "Checkout message"}
          tone={getBannerTone(message.type)}
        >
          <s-text>{message.message}</s-text>
        </s-banner>
      ))}
    </s-stack>
  );
}

function getCheckoutMessages() {
  const checkoutMessages = shopify.appMetafields.value.find(
    (appMetafield) =>
      appMetafield.target.type === "shop" &&
      appMetafield.metafield.namespace === CHECKOUT_MESSAGES_METAFIELD.namespace &&
      appMetafield.metafield.key === CHECKOUT_MESSAGES_METAFIELD.key,
  );

  if (!checkoutMessages?.metafield?.value) return [];

  try {
    const messages = JSON.parse(checkoutMessages.metafield.value);

    return Array.isArray(messages)
      ? messages.filter((message) => message.message)
      : [];
  } catch (error) {
    console.error("Checkout message metafield parse error", error);
    return [];
  }
}

function getBannerTone(type) {
  if (type === "Discount") return "success";
  if (type === "Shipping") return "info";

  return "info";
}
