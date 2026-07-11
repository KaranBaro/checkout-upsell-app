import PropTypes from "prop-types";

function formatOffer(discount) {
  if (discount.category === "Buy X get Y") {
    return `Buy ${discount.buyQuantity || 1}, get ${discount.getQuantity || 1}`;
  }

  if (discount.category === "Free shipping" || discount.type === "Free shipping") {
    return "Free shipping";
  }

  if (discount.type === "Percentage") {
    return `${discount.value || 0}% off`;
  }

  return `₹${Number(discount.value || 0).toLocaleString("en-IN")} off`;
}

function formatMinimum(discount) {
  if (discount.minimumRequirement === "quantity") {
    return `${discount.minimumQuantity || 1} item minimum`;
  }

  if ((discount.minimumRequirement === "amount" || discount.minimumPurchase > 0) && discount.minimumPurchase > 0) {
    return `Minimum purchase ₹${Number(discount.minimumPurchase).toLocaleString("en-IN")}`;
  }

  return "No minimum requirement";
}

function formatCombinations(combinesWith = {}) {
  const enabled = [
    combinesWith.productDiscounts && "product",
    combinesWith.orderDiscounts && "order",
    combinesWith.shippingDiscounts && "shipping",
  ].filter(Boolean);

  return enabled.length ? `Combines with ${enabled.join(", ")}` : "No combinations";
}

export default function DiscountCard({ discount, onEdit, onDelete }) {
  const offer = formatOffer(discount);
  const codeLabel = discount.method === "Automatic discount" ? "AUTOMATIC" : discount.code;

  return (
    <article style={{ padding: "20px", border: "1px solid #e1e3e5", borderRadius: "12px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "17px" }}>{discount.title}</h3>
            <span style={{ padding: "3px 8px", borderRadius: "999px", background: discount.status === "Active" ? "#d4f7dc" : "#e4e5e7", color: "#303030", fontSize: "12px", fontWeight: 600 }}>{discount.status}</span>
            {discount.source === "native" && (
              <span style={{ padding: "3px 8px", borderRadius: "999px", background: "#fff9e6", color: "#8b5900", fontSize: "12px", fontWeight: 600 }}>Shopify native</span>
            )}
          </div>

          <p style={{ margin: "10px 0 6px", fontSize: "20px", fontWeight: 700 }}>{offer}</p>
          <code style={{ padding: "4px 8px", border: "1px dashed #8c9196", borderRadius: "5px", background: "#f6f6f7" }}>
            {codeLabel || "NO CODE"}
          </code>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px", color: "#6d7175", fontSize: "13px" }}>
            <span>{discount.category || "Amount off order"}</span>
            <span>•</span>
            <span>{formatMinimum(discount)}</span>
            <span>•</span>
            <span>{discount.eligibility === "all" || !discount.eligibility ? "All customers" : discount.eligibility}</span>
            <span>•</span>
            <span>{formatCombinations(discount.combinesWith)}</span>
          </div>

          {(discount.usageLimit || discount.oneUsePerCustomer || discount.startsAt || discount.endsAt) && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px", color: "#6d7175", fontSize: "13px" }}>
              {discount.usageLimit && <span>{discount.usageLimit} total uses</span>}
              {discount.oneUsePerCustomer && <span>One use per customer</span>}
              {discount.startsAt && <span>Starts {discount.startsAt}</span>}
              {discount.endsAt && <span>Ends {discount.endsAt}</span>}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <button type="button" onClick={() => onEdit(discount)} style={buttonStyle}>Edit</button>
          <button
            type="button"
            onClick={() => onDelete(discount)}
            style={{ ...buttonStyle, background: "#fff5f5", borderColor: "#fed7d7", color: "#b42318" }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

const buttonStyle = {
  padding: "7px 12px",
  border: "1px solid #c9cccf",
  borderRadius: "7px",
  background: "#f6f6f7",
  fontWeight: 600,
  cursor: "pointer",
};

DiscountCard.propTypes = {
  discount: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    code: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.number,
    minimumPurchase: PropTypes.number,
    minimumQuantity: PropTypes.number,
    minimumRequirement: PropTypes.string,
    status: PropTypes.string.isRequired,
    category: PropTypes.string,
    method: PropTypes.string,
    source: PropTypes.string,
    appliesTo: PropTypes.string,
    eligibility: PropTypes.string,
    usageLimit: PropTypes.number,
    oneUsePerCustomer: PropTypes.bool,
    combinesWith: PropTypes.shape({
      orderDiscounts: PropTypes.bool,
      productDiscounts: PropTypes.bool,
      shippingDiscounts: PropTypes.bool,
    }),
    startsAt: PropTypes.string,
    endsAt: PropTypes.string,
    buyQuantity: PropTypes.number,
    getQuantity: PropTypes.number,
    rewardType: PropTypes.string,
    rewardValue: PropTypes.number,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
