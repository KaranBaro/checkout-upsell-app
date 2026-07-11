import { useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import DiscountCard from "../components/Discounts/DiscountCard";
import DiscountForm from "../components/Discounts/DiscountForm";
import DiscountTypeModal from "../components/Discounts/DiscountTypeModal";

export default function Discounts() {
  const { discounts, setDiscounts } = useOutletContext();
  const [formOpen, setFormOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const visibleDiscounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return discounts.filter(
      (discount) =>
        (status === "All" || discount.status === status) &&
        (!query ||
          discount.title.toLowerCase().includes(query) ||
          discount.code.toLowerCase().includes(query)),
    );
  }, [discounts, search, status]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingDiscount(null);
    setSelectedType(null);
  };

  const saveDiscount = async (savedDiscount) => {
    setSaving(true);
    setError("");

    let result;
    let response;

    try {
      response = await fetch("/api/shopify-discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discount: {
            ...savedDiscount,
            shopifyDiscountId: editingDiscount?.shopifyDiscountId,
            shopifyDiscountClass: editingDiscount?.shopifyDiscountClass,
            method: "Discount code",
          },
        }),
      });
      result = await response.json();
    } catch (saveError) {
      setSaving(false);
      setError(saveError.message || "Could not create this discount in Shopify.");
      return;
    }

    setSaving(false);

    if (!response.ok || !result.ok) {
      setError(result.error || "Could not create this discount in Shopify.");
      return;
    }

    const nativeDiscount = result.discount;
    setDiscounts((current) =>
      editingDiscount
        ? current.map((discount) =>
            discount.id === nativeDiscount.id ? nativeDiscount : discount,
          )
        : [...current, nativeDiscount],
    );
    closeForm();
  };

  const deleteDiscount = async (discount) => {
    if (!window.confirm(`Delete "${discount.title}"?`)) return;

    setError("");
    if (discount.shopifyDiscountId) {
      const response = await fetch("/api/shopify-discounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          shopifyDiscountId: discount.shopifyDiscountId,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.error || "Could not delete this discount in Shopify.");
        return;
      }
    }

    setDiscounts((current) => current.filter((item) => item.id !== discount.id));
  };

  return (
    <main style={{ minHeight: "100%", padding: "32px 24px 48px", background: "#f6f6f7" }}>
      {typePickerOpen && <DiscountTypeModal onClose={() => setTypePickerOpen(false)} onSelect={(type) => { setSelectedType(type); setTypePickerOpen(false); setFormOpen(true); }} />}
      {formOpen && <DiscountForm initialDiscount={editingDiscount} selectedType={selectedType} onSave={saveDiscount} onClose={closeForm} saving={saving} />}
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>Discounts</h1>
            <p style={{ margin: "8px 0 0", color: "#6d7175" }}>Create and manage offers for your checkout experience.</p>
          </div>
          <button type="button" onClick={() => setTypePickerOpen(true)} style={{ padding: "11px 16px", border: 0, borderRadius: "8px", background: "#303030", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Create discount</button>
        </header>

        {error && (
          <div role="alert" style={{ marginBottom: "16px", padding: "12px 14px", border: "1px solid #fed3d1", borderRadius: "8px", background: "#fff4f4", color: "#8e1f0b" }}>
            {error}
          </div>
        )}

        <section style={{ border: "1px solid #e1e3e5", borderRadius: "12px", background: "#fff", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: "12px", padding: "16px", borderBottom: "1px solid #e1e3e5" }}>
            <input type="search" aria-label="Search discounts" placeholder="Search by title or code" value={search} onChange={(event) => setSearch(event.target.value)} style={{ flex: 1, minWidth: 0, padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: "8px" }} />
            <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: "8px", background: "#fff" }}>
              <option>All</option><option>Active</option><option>Draft</option>
            </select>
          </div>
          <div style={{ display: "grid", gap: "12px", padding: "16px" }}>
            {visibleDiscounts.length ? visibleDiscounts.map((discount) => (
              <DiscountCard key={discount.id} discount={discount} onEdit={(item) => { setEditingDiscount(item); setFormOpen(true); }} onDelete={deleteDiscount} />
            )) : (
              <div style={{ padding: "42px 20px", textAlign: "center" }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>No discounts found</h2>
                <p style={{ margin: 0, color: "#6d7175" }}>Create a discount or adjust your search filters.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
