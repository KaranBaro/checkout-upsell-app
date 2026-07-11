import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

const API_BASE_URL = "https://skippo.in";

export default async () => {
  render(<CheckoutMessage />, document.body);
};

function CheckoutMessage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const shop = shopify.shop.myshopifyDomain;
        const response = await fetch(
          `${API_BASE_URL}/api/checkout-messages?shop=${encodeURIComponent(shop)}`,
        );
        const data = await response.json();

        setMessages(data.enabled ? data.messages : []);
      } catch (error) {
        console.error("Checkout message fetch error", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, []);

  if (isLoading || messages.length === 0) return null;

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

function getBannerTone(type) {
  if (type === "Discount") return "success";
  if (type === "Shipping") return "info";

  return "info";
}
