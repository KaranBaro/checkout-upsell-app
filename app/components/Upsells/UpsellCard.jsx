import PropTypes from "prop-types";

export default function UpsellCard({ upsell, onEdit, onDelete, onToggle }) {
  const getTargetLabel = () => {
    if (upsell.targetType === "products") {
      return `${upsell.targetProducts?.length || 0} Products`;
    }
    if (upsell.targetType === "collections") {
      const totalProducts = (upsell.targetCollections || []).reduce((sum, c) => sum + (c.productCount || 0), 0);
      return `${upsell.targetCollections?.length || 0} Collections (${totalProducts} products)`;
    }
    return "All Products";
  };

  const layoutIcons = {
    grid: "⊞",
    stack: "≡",
    slider: "▶",
  };

  return (
    <article style={{ padding: "20px", border: "1px solid #e1e3e5", borderRadius: "12px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>{upsell.title}</h3>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "999px",
                background: upsell.status === "Active" ? "#d4f7dc" : "#e4e5e7",
                color: "#303030",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {upsell.status}
            </span>
          </div>

          <p style={{ margin: "4px 0", fontSize: "13px", color: "#6d7175" }}>{upsell.description}</p>

          <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#6d7175",
                }}
              >
                Block ID:
              </span>

              <code
                style={{
                  padding: "4px 7px",
                  background: "#f1f2f3",
                  borderRadius: "5px",
                  fontSize: "11px",
                  wordBreak: "break-all",
                }}
              >
                {String(upsell.id)}
              </code>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(String(upsell.id));
                  } catch (error) {
                    console.error("Failed to copy upsell ID:", error);
                  }
                }}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #c9cccf",
                  borderRadius: "6px",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Copy
              </button>
            </div>
            <div style={{ fontSize: "13px" }}>
              <span style={{ color: "#6d7175" }}>Target:</span> <strong>{getTargetLabel()}</strong>
            </div>
            <div style={{ fontSize: "13px" }}>
              <span style={{ color: "#6d7175" }}>Layout:</span> <strong>
                {layoutIcons[upsell.layout] || "⊞"}{" "}

              {String(upsell.layout || "grid")

                .charAt(0)

                .toUpperCase() +

                String(upsell.layout || "grid").slice(1)}</strong>
            </div>
            <div style={{ fontSize: "13px" }}>
              <span style={{ color: "#6d7175" }}>Discount:</span> <strong>{upsell.discountId ? "✓ Linked" : "No discount"}</strong>
            </div>
          </div>

          {upsell.rules && upsell.rules.length > 0 && (
            <div style={{ marginTop: "12px", padding: "10px", background: "#f6f6f7", borderRadius: "6px", fontSize: "12px" }}>
              <p style={{ margin: "0 0 6px", color: "#6d7175", fontWeight: 600 }}>Rules: {upsell.rules.length}</p>
              {upsell.rules.map((rule, idx) => (
                <p key={idx} style={{ margin: "2px 0", color: "#6d7175" }}>
                  • {rule.condition} {rule.operator} {rule.value}
                </p>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <button
            type="button"
            onClick={() =>
              onToggle?.(
                upsell.id,
                upsell.status === "Active" ? "Draft" : "Active",
              )
            }
            style={{
              padding: "8px 12px",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {upsell.status === "Active" ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            onClick={() => onEdit(upsell)}
            style={{
              padding: "8px 12px",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => window.confirm(`Delete "${upsell.title}"?`) && onDelete(upsell.id)}
            style={{
              padding: "8px 12px",
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              borderRadius: "6px",
              color: "#b42318",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

UpsellCard.propTypes = {
  upsell: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    layout: PropTypes.oneOf(["grid", "stack", "slider"]).isRequired,
    targetType: PropTypes.string,
    targetProducts: PropTypes.array,
    targetCollections: PropTypes.array,
    discountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    rules: PropTypes.array,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggle: PropTypes.func,
};
