import { json } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ enabled: false, products: [] });
  }

  // Temporary static data for testing checkout extension
  return json({
    enabled: true,
    title: "Recommended for you",
    description: "Add these products before checkout",
    layout: "stack",
    products: [
      {
        title: "Sample Upsell Product",
        description: "Perfect add-on for your order",
        image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
        price: "₹999",
        variantId: "gid://shopify/ProductVariant/YOUR_VARIANT_ID",
        discountLabel: "Special checkout offer",
      },
    ],
  });
}