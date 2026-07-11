import PropTypes from "prop-types";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

function formatProduct(product) {
  const firstVariant = product.variants?.[0];
  const image = product.images?.[0] || firstVariant?.image;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.descriptionHtml?.replace(/<[^>]*>/g, "") || "",
    image: image?.originalSrc || image?.url,
    price: firstVariant?.price ? `₹${firstVariant.price}` : "",
    variantId: firstVariant?.id,
  };
}

export default function ProductSelector({ onProductsSelect, initialProducts = [] }) {
  const shopify = useAppBridge();
  const [selectedProducts, setSelectedProducts] = useState(initialProducts);

  const handleSelectProducts = async () => {
    const selection = await shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
      filter: {
        hidden: false,
        variants: true,
        draft: false,
        archived: false,
      },
      selectionIds: selectedProducts.map((product) => ({
        id: product.id,
        variants: product.variantId ? [{ id: product.variantId }] : undefined,
      })),
    });

    if (!selection) return;

    const products = selection.map(formatProduct);
    setSelectedProducts(products);
    onProductsSelect(products);
  };

  const removeProduct = (productId) => {
    const updated = selectedProducts.filter((product) => product.id !== productId);
    setSelectedProducts(updated);
    onProductsSelect(updated);
  };

  return (
    <div style={{ padding: "16px", background: "#f6f6f7", borderRadius: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>
            Select Products ({selectedProducts.length})
          </h3>
          <p style={{ margin: 0, color: "#6d7175", fontSize: "13px" }}>
            Choose products from this Shopify store
          </p>
        </div>

        <button
          type="button"
          onClick={handleSelectProducts}
          style={{
            padding: "10px 14px",
            border: 0,
            borderRadius: "8px",
            background: "#303030",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Select products
        </button>
      </div>

      {selectedProducts.length > 0 && (
        <div style={{ display: "grid", gap: "10px" }}>
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              style={{
                display: "grid",
                gridTemplateColumns: product.image ? "48px 1fr auto" : "1fr auto",
                gap: "12px",
                alignItems: "center",
                padding: "12px",
                background: "#fff",
                border: "1px solid #e1e3e5",
                borderRadius: "8px",
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px" }}
                />
              )}

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{product.title}</div>
                <div style={{ fontSize: "12px", color: "#6d7175" }}>
                  {product.handle}
                  {product.variantId ? " · Addable in checkout" : " · Missing variant"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                style={{
                  padding: "8px 10px",
                  border: "1px solid #ffd6d6",
                  borderRadius: "8px",
                  background: "#fff5f5",
                  color: "#d72c0d",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ProductSelector.propTypes = {
  onProductsSelect: PropTypes.func.isRequired,
  initialProducts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      handle: PropTypes.string,
      description: PropTypes.string,
      image: PropTypes.string,
      price: PropTypes.string,
      variantId: PropTypes.string,
    })
  ),
};
