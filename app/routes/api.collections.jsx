import { authenticate } from "../shopify.server";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
        query GetCollections {
          collections(first: 100, sortKey: TITLE) {
            nodes {
              id
              title
              handle
              productsCount {
                count
              }
            }
          }
        }
      `,
    );

    const body = await response.json();

    if (body.errors?.length) {
      throw new Error(
        body.errors.map((error) => error.message).join(", "),
      );
    }

    const collections =
      body.data?.collections?.nodes?.map((collection) => ({
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        productCount: collection.productsCount?.count || 0,
      })) || [];

    return json({
      ok: true,
      collections,
    });
  } catch (error) {
    console.error("Failed to load collections:", error);

    return json(
      {
        ok: false,
        collections: [],
        error: error?.message || "Failed to load collections",
      },
      {
        status: 500,
      },
    );
  }
}
