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
  namespace: "$app",
  key: "checkoutMessages",
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

export async function syncCheckoutMessagesMetafield(admin, shop, messages) {
  const activeMessages = (messages ?? getActiveCheckoutMessages(shop))
    .filter((message) => message.status === "Active" && message.message)
    .map((message) => ({
      id: message.id,
      title: message.title,
      type: message.type,
      message: message.message,
    }));

  const installationResponse = await admin.graphql(
    `#graphql
      query CurrentAppInstallation {
        currentAppInstallation {
          id
        }
      }
    `,
  );
  const installationBody = await installationResponse.json();
  const ownerId = installationBody.data?.currentAppInstallation?.id;

  if (!ownerId) {
    throw new Error("Unable to find current app installation");
  }

  const metafieldResponse = await admin.graphql(
    `#graphql
      mutation SyncCheckoutMessages($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace: CHECKOUT_MESSAGES_METAFIELD.namespace,
            key: CHECKOUT_MESSAGES_METAFIELD.key,
            type: "json",
            value: JSON.stringify(activeMessages),
          },
        ],
      },
    },
  );
  const metafieldBody = await metafieldResponse.json();
  const errors = metafieldBody.data?.metafieldsSet?.userErrors ?? [];

  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return activeMessages;
}
