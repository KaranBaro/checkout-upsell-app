import {
  APP_METAFIELD_NAMESPACE,
  readShopJsonMetafield,
  setShopJsonMetafields,
} from "./shop-metafields.server";

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

export const CHECKOUT_MESSAGES_METAFIELD = {
  namespace: APP_METAFIELD_NAMESPACE,
  key: "checkoutMessages",
};

export const DASHBOARD_MESSAGES_METAFIELD = {
  namespace: APP_METAFIELD_NAMESPACE,
  key: "dashboardMessages",
};

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

function normalizeDashboardMessages(messages = []) {
  return Array.isArray(messages)
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
}

export function getCheckoutMessagePayload(shop, messages) {
  return (messages ?? getActiveCheckoutMessages(shop))
    .filter((message) => message.status === "Active" && message.message)
    .map((message) => ({
      id: message.id,
      title: message.title,
      type: message.type,
      message: message.message,
    }));
}

export async function loadDashboardMessages(admin, shop) {
  const dashboardMessages = await readShopJsonMetafield(
    admin,
    DASHBOARD_MESSAGES_METAFIELD,
    null,
  );

  if (dashboardMessages) {
    saveMessages(shop, dashboardMessages);
    return normalizeDashboardMessages(dashboardMessages);
  }

  const checkoutMessages = await readShopJsonMetafield(
    admin,
    CHECKOUT_MESSAGES_METAFIELD,
    null,
  );

  if (checkoutMessages) {
    saveMessages(shop, checkoutMessages);
    return normalizeDashboardMessages(checkoutMessages);
  }

  return getMessages(shop);
}

export async function syncCheckoutMessagesMetafield(admin, shop, messages) {
  const activeMessages = getCheckoutMessagePayload(shop, messages);
  await setShopJsonMetafields(admin, [
    {
      ...CHECKOUT_MESSAGES_METAFIELD,
      value: activeMessages,
    },
  ]);

  return activeMessages;
}

export async function syncMessagesMetafields(admin, shop, messages) {
  const dashboardMessages = normalizeDashboardMessages(messages);
  const activeMessages = getCheckoutMessagePayload(shop, dashboardMessages);

  await setShopJsonMetafields(admin, [
    {
      ...DASHBOARD_MESSAGES_METAFIELD,
      value: dashboardMessages,
    },
    {
      ...CHECKOUT_MESSAGES_METAFIELD,
      value: activeMessages,
    },
  ]);

  return dashboardMessages;
}
