import PropTypes from "prop-types";

const types = [
  ["Amount off products", "Discount selected products or collections."],
  ["Amount off order", "Discount the customer’s entire order."],
  ["Buy X get Y", "Create a buy quantity X, get quantity Y offer."],
  ["Free shipping", "Remove shipping charges with optional conditions."],
];

export default function DiscountTypeModal({ onSelect, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "grid", placeItems: "center", padding: "20px", background: "rgba(32,34,35,.55)" }}>
      <button type="button" aria-label="Close discount type picker" onClick={onClose} style={{ position: "absolute", inset: 0, border: 0, background: "none" }} />
      <section role="dialog" aria-modal="true" aria-labelledby="discount-type-title" style={{ position: "relative", width: "100%", maxWidth: "540px", borderRadius: "14px", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
          <div>
            <h2 id="discount-type-title" style={{ margin: 0, fontSize: "20px" }}>Select discount type</h2>
            <p style={{ margin: "6px 0 0", color: "#6d7175", fontSize: "14px" }}>Choose the Shopify-style discount you want to configure.</p>
          </div>
          <button type="button" onClick={onClose} style={{ border: 0, background: "none", fontSize: "24px", cursor: "pointer" }}>×</button>
        </div>
        {types.map(([name, description]) => (
          <button key={name} type="button" onClick={() => onSelect(name)} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", border: 0, borderTop: "1px solid #e1e3e5", background: "#fff", color: "#202223", textAlign: "left", cursor: "pointer" }}>
            <span><strong style={{ display: "block", marginBottom: "4px" }}>{name}</strong><span style={{ color: "#6d7175", fontSize: "14px" }}>{description}</span></span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </section>
    </div>
  );
}

DiscountTypeModal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
