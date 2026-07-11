const defaultMessages = [
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
];

const messageStore = global.checkoutMessageStore ?? new Map();
global.checkoutMessageStore = messageStore;

function normalizeShop(shop) {
  return shop || "default";
}

function cloneMessages(messages) {
  return messages.map((message) => ({ ...message }));
}

export function getMessages(shop) {
  const key = normalizeShop(shop);
  const messages = messageStore.get(key) ?? defaultMessages;

  return cloneMessages(messages);
}

export function saveMessages(shop, messages) {
  const key = normalizeShop(shop);
  const cleanMessages = Array.isArray(messages)
    ? messages.map((message) => ({
        id: message.id,
        category: message.category,
        method: message.method,
        title: message.title || "",
        type: message.type || "Info",
        message: message.message || "",
        status: message.status || "Draft",
      }))
    : [];

  messageStore.set(key, cleanMessages);

  return cloneMessages(cleanMessages);
}

export function getActiveCheckoutMessages(shop) {
  return getMessages(shop).filter(
    (message) => message.status === "Active" && message.message,
  );
}
