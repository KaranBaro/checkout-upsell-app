import { useState } from "react";
import { useOutletContext } from "react-router";
import UpsellTable from "../components/Upsells/UpsellTable";
import RuleBuilder from "../components/Upsells/RuleBuilder";
import ProductSelector from "../components/Upsells/ProductSelector";
import CollectionSelector from "../components/Upsells/CollectionSelector";
import UpsellPreview from "../components/Upsells/UpsellPreview";

export default function Upsells() {
  const { upsells, createUpsell, updateUpsell, deleteUpsell, toggleUpsellStatus } = useOutletContext();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    layout: "grid",
    actionType: "recommend",
    targetType: "all",
    targetProducts: [],
    targetCollections: [],
    discountId: "",
    rules: [],
    status: "Draft",
    recommendedProducts: [],
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      layout: "grid",
      actionType: "recommend",
      targetType: "all",
      targetProducts: [],
      targetCollections: [],
      discountId: "",
      rules: [],
      status: "Draft",
      recommendedProducts: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (upsell) => {
    setFormData({
      ...upsell,
      layout: upsell.layout === "slider" ? "grid" : upsell.layout,
    });
    setEditingId(upsell.id);
    setShowForm(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (editingId) {
      updateUpsell(editingId, formData);
    } else {
      createUpsell(formData);
    }
    resetForm();
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "6px",
    padding: "11px 12px",
    border: "1px solid #c9cccf",
    borderRadius: "8px",
    background: "#fff",
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Upsells</h1>
            <p style={{ margin: "8px 0 0", color: "#6d7175" }}>Create and manage product upsell rules for checkout</p>
          </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: "10px 20px",
            border: 0,
            borderRadius: "8px",
            background: "#303030",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + New Upsell
        </button>
      </div>

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(32, 34, 35, 0.55)",
            overflow: "auto",
          }}
        >
          <button
            type="button"
            aria-label="Close form"
            onClick={resetForm}
            style={{ position: "absolute", inset: 0, border: 0, background: "none" }}
          />
          <section
            role="dialog"
            aria-modal="true"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              background: "#fff",
              borderRadius: "14px",
              boxShadow: "0 20px 50px rgba(0,0,0,.2)",
              overflow: "hidden",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", borderBottom: "1px solid #e1e3e5" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
                {editingId ? "Edit Upsell" : "Create New Upsell"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                style={{ border: 0, background: "none", fontSize: "24px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px", display: "grid", gap: "24px" }}>
              {/* Basic Info */}
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>Basic Information</h3>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label htmlFor="title" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                      Title
                    </label>
                    <input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Complementary Products"
                      required
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this upsell"
                      style={{ ...fieldStyle, minHeight: "80px" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label htmlFor="layout" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                        Layout
                      </label>
                      <select
                        id="layout"
                        value={formData.layout === "slider" ? "grid" : formData.layout}
                        onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                        style={fieldStyle}
                      >
                        <option value="grid">Grid (⊞)</option>
                        <option value="stack">Stack (≡)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                        Status
                      </label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={fieldStyle}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Type */}
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>Target Audience</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                  {[
                    { value: "all", label: "All Products", icon: "🌍" },
                    { value: "products", label: "Specific Products", icon: "📦" },
                    { value: "collections", label: "Collections", icon: "📚" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, targetType: option.value })}
                      style={{
                        padding: "16px",
                        border: formData.targetType === option.value ? "2px solid #005bd3" : "1px solid #c9cccf",
                        borderRadius: "8px",
                        background: formData.targetType === option.value ? "#f1f8ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "20px", marginBottom: "8px" }}>{option.icon}</div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{option.label}</div>
                    </button>
                  ))}
                </div>

                {formData.targetType === "products" && (
                  <ProductSelector
                    onProductsSelect={(products) => setFormData({ ...formData, targetProducts: products })}
                    initialProducts={formData.targetProducts}
                  />
                )}

                {formData.targetType === "collections" && (
                  <CollectionSelector
                    onCollectionsSelect={(collections) => setFormData({ ...formData, targetCollections: collections })}
                    initialCollections={formData.targetCollections}
                  />
                )}

                {formData.targetType === "all" && (
                  <div style={{ padding: "12px", background: "#f1f8ff", borderRadius: "8px", color: "#005bd3", fontSize: "13px" }}>
                    This upsell will appear for all products
                  </div>
                )}
              </div>

              {/* Action Type */}
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>Action Type</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  {[
                    { value: "recommend", label: "Recommend Products", helper: "Show product suggestions at checkout" },
                    { value: "directAdd", label: "Direct Add to Checkout", helper: "Add the upsell item directly to checkout" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, actionType: option.value })}
                      style={{
                        padding: "16px",
                        border: formData.actionType === option.value ? "2px solid #005bd3" : "1px solid #c9cccf",
                        borderRadius: "8px",
                        background: formData.actionType === option.value ? "#f1f8ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>{option.label}</div>
                      <div style={{ fontSize: "12px", color: "#6d7175" }}>{option.helper}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upsell Products */}
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>
                  Products To Show In Checkout
                </h3>

                <ProductSelector
                  onProductsSelect={(products) =>
                    setFormData({
                      ...formData,
                      recommendedProducts: products,
                    })
                  }
                  initialProducts={formData.recommendedProducts}
                />

                {formData.recommendedProducts?.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "#f6f6f7",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  >
                    {formData.recommendedProducts.length} product(s) selected for checkout upsell.
                  </div>
                )}
              </div>

              {/* Trigger Rules */}
              <RuleBuilder
                onRulesChange={(rules) => setFormData({ ...formData, rules })}
                initialRules={formData.rules}
              />

              {/* Discount */}
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>Linked Discount</h3>
                <select
                  value={formData.discountId}
                  onChange={(e) => setFormData({ ...formData, discountId: e.target.value })}
                  style={fieldStyle}
                >
                  <option value="">-- No discount --</option>
                  <option value="discount-1">10% Off Bundle</option>
                  <option value="discount-2">₹500 Off</option>
                  <option value="discount-3">Free Shipping</option>
                </select>
              </div>

              {/* Preview */}
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>Preview</h3>
                <UpsellPreview
                  layout={formData.layout}
                  title={formData.title}
                  description={formData.description}
                  actionType={formData.actionType}
                  recommendedProducts={formData.recommendedProducts}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "16px", borderTop: "1px solid #e1e3e5" }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "10px 16px",
                    border: "1px solid #c9cccf",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 16px",
                    border: 0,
                    borderRadius: "8px",
                    background: "#303030",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {editingId ? "Update Upsell" : "Create Upsell"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <UpsellTable
        upsells={upsells}
        onEdit={handleEdit}
        onDelete={deleteUpsell}
        onToggle={toggleUpsellStatus}
      />
      </div>
    </div>
  );
}
