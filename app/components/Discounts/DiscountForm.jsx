import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const defaultStartsAt = () => new Date().toISOString().slice(0, 10);

const sectionStyle = {
  padding: "18px",
  border: "1px solid #e1e3e5",
  borderRadius: "10px",
  background: "#fff",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#202223",
  fontSize: "13px",
  fontWeight: 600,
};

const helperStyle = {
  margin: "6px 0 0",
  color: "#6d7175",
  fontSize: "12px",
  lineHeight: 1.45,
};

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #c9cccf",
  borderRadius: "8px",
  background: "#fff",
};

const radioRowStyle = {
  display: "grid",
  gap: "10px",
};

const pillButtonStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  width: "100%",
  padding: "12px",
  border: "1px solid #c9cccf",
  borderRadius: "8px",
  background: "#fff",
  color: "#202223",
  textAlign: "left",
  cursor: "pointer",
};

function generateCode() {
  return `SAVE${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function NativeRadio({ checked, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...pillButtonStyle,
        borderColor: checked ? "#005bd3" : "#c9cccf",
        background: checked ? "#f1f8ff" : "#fff",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "16px",
          height: "16px",
          marginTop: "2px",
          borderRadius: "999px",
          border: checked ? "5px solid #005bd3" : "1px solid #8c9196",
          boxSizing: "border-box",
          flex: "0 0 auto",
        }}
      />
      <span>
        <strong style={{ display: "block", marginBottom: "3px", fontSize: "13px" }}>
          {title}
        </strong>
        {description && <span style={{ color: "#6d7175", fontSize: "12px" }}>{description}</span>}
      </span>
    </button>
  );
}

NativeRadio.propTypes = {
  checked: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default function DiscountForm({
  initialDiscount,
  selectedType,
  onSave,
  onClose,
  discountSource = "custom",
}) {
  const category = initialDiscount?.category ?? selectedType ?? "Amount off order";
  const [method, setMethod] = useState(initialDiscount?.method ?? "Discount code");
  const [title, setTitle] = useState(initialDiscount?.title ?? "");
  const [code, setCode] = useState(initialDiscount?.code ?? "");
  const [valueType, setValueType] = useState(initialDiscount?.type ?? "Percentage");
  const [value, setValue] = useState(initialDiscount?.value ?? 10);
  const [appliesTo, setAppliesTo] = useState(initialDiscount?.appliesTo ?? "all");
  const [purchaseType, setPurchaseType] = useState(initialDiscount?.purchaseType ?? "oneTime");
  const [minimumRequirement, setMinimumRequirement] = useState(
    initialDiscount?.minimumRequirement ?? (initialDiscount?.minimumPurchase > 0 ? "amount" : "none"),
  );
  const [minimumPurchase, setMinimumPurchase] = useState(initialDiscount?.minimumPurchase ?? 0);
  const [minimumQuantity, setMinimumQuantity] = useState(initialDiscount?.minimumQuantity ?? 1);
  const [eligibility, setEligibility] = useState(initialDiscount?.eligibility ?? "all");
  const [limitTotalUses, setLimitTotalUses] = useState(Boolean(initialDiscount?.usageLimit));
  const [usageLimit, setUsageLimit] = useState(initialDiscount?.usageLimit ?? 100);
  const [oneUsePerCustomer, setOneUsePerCustomer] = useState(
    Boolean(initialDiscount?.oneUsePerCustomer),
  );
  const [combinesWith, setCombinesWith] = useState(
    initialDiscount?.combinesWith ?? {
      orderDiscounts: false,
      productDiscounts: false,
      shippingDiscounts: false,
    },
  );
  const [startsAt, setStartsAt] = useState(initialDiscount?.startsAt ?? defaultStartsAt());
  const [startsTime, setStartsTime] = useState(initialDiscount?.startsTime ?? "00:00");
  const [hasEndDate, setHasEndDate] = useState(Boolean(initialDiscount?.endsAt));
  const [endsAt, setEndsAt] = useState(initialDiscount?.endsAt ?? "");
  const [endsTime, setEndsTime] = useState(initialDiscount?.endsTime ?? "23:59");
  const [status, setStatus] = useState(initialDiscount?.status ?? "Active");
  const [source] = useState(initialDiscount?.source ?? discountSource);

  const [buyQuantity, setBuyQuantity] = useState(initialDiscount?.buyQuantity ?? 1);
  const [getQuantity, setGetQuantity] = useState(initialDiscount?.getQuantity ?? 1);
  const [customerGets, setCustomerGets] = useState(initialDiscount?.customerGets ?? "percentage");
  const [rewardValue, setRewardValue] = useState(initialDiscount?.rewardValue ?? 100);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const isShipping = category === "Free shipping";
  const isBuyXGetY = category === "Buy X get Y";
  const isProductDiscount = category === "Amount off products";

  const discountSummary = useMemo(() => {
    if (isShipping) return "Free shipping";
    if (isBuyXGetY) {
      return `Buy ${buyQuantity || 1}, get ${getQuantity || 1}`;
    }

    return valueType === "Percentage"
      ? `${value || 0}% off`
      : `₹${Number(value || 0).toLocaleString("en-IN")} off`;
  }, [buyQuantity, getQuantity, isBuyXGetY, isShipping, value, valueType]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const discountData = {
      id: initialDiscount?.id ?? Date.now(),
      category,
      method,
      source,
      title: title.trim(),
      code: method === "Discount code" ? code.trim().toUpperCase() : "",
      type: isShipping ? "Free shipping" : valueType,
      value: isShipping ? 0 : Number(value || 0),
      appliesTo,
      purchaseType,
      minimumRequirement,
      minimumPurchase: minimumRequirement === "amount" ? Number(minimumPurchase || 0) : 0,
      minimumQuantity: minimumRequirement === "quantity" ? Number(minimumQuantity || 1) : 0,
      eligibility,
      usageLimit: limitTotalUses ? Number(usageLimit || 0) : null,
      oneUsePerCustomer,
      combinesWith,
      startsAt,
      startsTime,
      endsAt: hasEndDate ? endsAt : "",
      endsTime: hasEndDate ? endsTime : "",
      status,
    };

    if (isBuyXGetY) {
      Object.assign(discountData, {
        buyQuantity: Number(buyQuantity || 1),
        getQuantity: Number(getQuantity || 1),
        buyItemType: appliesTo,
        getItemType: "same",
        customerGets,
        rewardType: customerGets === "free" ? "Free" : valueType,
        rewardValue: customerGets === "free" ? 100 : Number(rewardValue || 0),
      });
    }

    onSave(discountData);
    onClose();
  };

  const toggleCombination = (key) => {
    setCombinesWith((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        padding: "20px",
        background: "rgba(32, 34, 35, 0.55)",
      }}
    >
      <button
        type="button"
        aria-label="Close discount form"
        onClick={onClose}
        style={{ position: "absolute", inset: 0, border: 0, background: "none" }}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-form-title"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "980px",
          maxHeight: "92vh",
          overflow: "hidden",
          borderRadius: "14px",
          background: "#f6f6f7",
          boxShadow: "0 20px 50px rgba(0,0,0,.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            padding: "20px 24px",
            borderBottom: "1px solid #e1e3e5",
            background: "#fff",
          }}
        >
          <div>
            <h2 id="discount-form-title" style={{ margin: 0, fontSize: "20px" }}>
              {initialDiscount ? "Edit discount" : category}
            </h2>
            <p style={{ margin: "6px 0 0", color: "#6d7175", fontSize: "14px" }}>
              Configure a checkout-ready discount using Shopify-style options.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 0, background: "none", fontSize: "24px", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            maxHeight: "calc(92vh - 78px)",
            overflowY: "auto",
            padding: "20px 24px 24px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "20px", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Method</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <NativeRadio
                    checked={method === "Discount code"}
                    title="Discount code"
                    description="Customers enter a code at checkout."
                    onClick={() => setMethod("Discount code")}
                  />
                  <NativeRadio
                    checked={method === "Automatic discount"}
                    title="Automatic discount"
                    description="Discount applies when conditions are met."
                    onClick={() => setMethod("Automatic discount")}
                  />
                </div>
              </section>

              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Details</h3>
                <div style={{ display: "grid", gap: "14px" }}>
                  <div>
                    <label htmlFor="discount-title" style={labelStyle}>
                      Title
                    </label>
                    <input
                      id="discount-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={method === "Automatic discount" ? "Weekend sale" : "Summer promotion"}
                      required
                      style={fieldStyle}
                    />
                    <p style={helperStyle}>
                      Used internally and shown in the app dashboard.
                    </p>
                  </div>

                  {method === "Discount code" && (
                    <div>
                      <label htmlFor="discount-code" style={labelStyle}>
                        Discount code
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px" }}>
                        <input
                          id="discount-code"
                          value={code}
                          onChange={(event) => setCode(event.target.value)}
                          placeholder="SUMMER20"
                          required
                          style={{ ...fieldStyle, textTransform: "uppercase" }}
                        />
                        <button
                          type="button"
                          onClick={() => setCode(generateCode())}
                          style={{
                            padding: "10px 14px",
                            border: "1px solid #c9cccf",
                            borderRadius: "8px",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {!isShipping && !isBuyXGetY && (
                <section style={sectionStyle}>
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Discount value</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label htmlFor="discount-type" style={labelStyle}>
                        Type
                      </label>
                      <select
                        id="discount-type"
                        value={valueType}
                        onChange={(event) => setValueType(event.target.value)}
                        style={fieldStyle}
                      >
                        <option>Percentage</option>
                        <option>Fixed amount</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="discount-value" style={labelStyle}>
                        {valueType === "Percentage" ? "Percentage" : "Amount"}
                      </label>
                      <input
                        id="discount-value"
                        type="number"
                        min="1"
                        max={valueType === "Percentage" ? 100 : undefined}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        required
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                </section>
              )}

              {isBuyXGetY && (
                <section style={sectionStyle}>
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Customer buys and gets</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                    <div>
                      <label htmlFor="buy-quantity" style={labelStyle}>
                        Customer buys quantity
                      </label>
                      <input
                        id="buy-quantity"
                        type="number"
                        min="1"
                        value={buyQuantity}
                        onChange={(event) => setBuyQuantity(event.target.value)}
                        required
                        style={fieldStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="get-quantity" style={labelStyle}>
                        Customer gets quantity
                      </label>
                      <input
                        id="get-quantity"
                        type="number"
                        min="1"
                        value={getQuantity}
                        onChange={(event) => setGetQuantity(event.target.value)}
                        required
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label htmlFor="customer-gets" style={labelStyle}>
                        Discounted value
                      </label>
                      <select
                        id="customer-gets"
                        value={customerGets}
                        onChange={(event) => setCustomerGets(event.target.value)}
                        style={fieldStyle}
                      >
                        <option value="free">Free</option>
                        <option value="percentage">Percentage off</option>
                        <option value="fixed">Fixed amount off</option>
                      </select>
                    </div>
                    {customerGets !== "free" && (
                      <div>
                        <label htmlFor="reward-value" style={labelStyle}>
                          {customerGets === "percentage" ? "Percentage" : "Amount"}
                        </label>
                        <input
                          id="reward-value"
                          type="number"
                          min="1"
                          max={customerGets === "percentage" ? 100 : undefined}
                          value={rewardValue}
                          onChange={(event) => setRewardValue(event.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {(isProductDiscount || isBuyXGetY) && (
                <section style={sectionStyle}>
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Applies to</h3>
                  <div style={radioRowStyle}>
                    <NativeRadio
                      checked={appliesTo === "all"}
                      title="All products"
                      description="Every product in the checkout can qualify."
                      onClick={() => setAppliesTo("all")}
                    />
                    <NativeRadio
                      checked={appliesTo === "collections"}
                      title="Specific collections"
                      description="Use this when the offer should be limited to collections."
                      onClick={() => setAppliesTo("collections")}
                    />
                    <NativeRadio
                      checked={appliesTo === "products"}
                      title="Specific products"
                      description="Use this when the offer should be limited to products."
                      onClick={() => setAppliesTo("products")}
                    />
                  </div>
                </section>
              )}

              {!isShipping && (
                <section style={sectionStyle}>
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Purchase type</h3>
                  <div style={radioRowStyle}>
                    <NativeRadio
                      checked={purchaseType === "oneTime"}
                      title="One-time purchase"
                      description="Apply this discount to regular checkout purchases."
                      onClick={() => setPurchaseType("oneTime")}
                    />
                    <NativeRadio
                      checked={purchaseType === "subscription"}
                      title="Subscription"
                      description="Prepared for subscription purchase discounts."
                      onClick={() => setPurchaseType("subscription")}
                    />
                    <NativeRadio
                      checked={purchaseType === "both"}
                      title="Both"
                      description="Prepared for one-time purchases and subscriptions."
                      onClick={() => setPurchaseType("both")}
                    />
                  </div>
                </section>
              )}

              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Minimum purchase requirements</h3>
                <div style={radioRowStyle}>
                  <NativeRadio
                    checked={minimumRequirement === "none"}
                    title="No minimum requirements"
                    onClick={() => setMinimumRequirement("none")}
                  />
                  <NativeRadio
                    checked={minimumRequirement === "amount"}
                    title="Minimum purchase amount"
                    description="Customer subtotal must reach a minimum value."
                    onClick={() => setMinimumRequirement("amount")}
                  />
                  {minimumRequirement === "amount" && (
                    <input
                      type="number"
                      min="0"
                      value={minimumPurchase}
                      onChange={(event) => setMinimumPurchase(event.target.value)}
                      aria-label="Minimum purchase amount"
                      style={fieldStyle}
                    />
                  )}
                  <NativeRadio
                    checked={minimumRequirement === "quantity"}
                    title="Minimum quantity of items"
                    description="Customer must have a minimum item quantity."
                    onClick={() => setMinimumRequirement("quantity")}
                  />
                  {minimumRequirement === "quantity" && (
                    <input
                      type="number"
                      min="1"
                      value={minimumQuantity}
                      onChange={(event) => setMinimumQuantity(event.target.value)}
                      aria-label="Minimum quantity"
                      style={fieldStyle}
                    />
                  )}
                </div>
              </section>

              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Customer eligibility</h3>
                <div style={radioRowStyle}>
                  <NativeRadio
                    checked={eligibility === "all"}
                    title="All customers"
                    onClick={() => setEligibility("all")}
                  />
                  <NativeRadio
                    checked={eligibility === "segments"}
                    title="Specific customer segments"
                    description="Prepared for segment-based targeting."
                    onClick={() => setEligibility("segments")}
                  />
                  <NativeRadio
                    checked={eligibility === "customers"}
                    title="Specific customers"
                    description="Prepared for customer-based targeting."
                    onClick={() => setEligibility("customers")}
                  />
                </div>
              </section>

              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Maximum discount uses</h3>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <input
                    type="checkbox"
                    checked={limitTotalUses}
                    onChange={(event) => setLimitTotalUses(event.target.checked)}
                  />
                  <span>Limit number of times this discount can be used in total</span>
                </label>
                {limitTotalUses && (
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(event) => setUsageLimit(event.target.value)}
                    aria-label="Total usage limit"
                    style={{ ...fieldStyle, marginBottom: "12px" }}
                  />
                )}
                <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={oneUsePerCustomer}
                    onChange={(event) => setOneUsePerCustomer(event.target.checked)}
                  />
                  <span>Limit to one use per customer</span>
                </label>
              </section>

              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Combinations</h3>
                {[
                  ["productDiscounts", "Product discounts"],
                  ["orderDiscounts", "Order discounts"],
                  ["shippingDiscounts", "Shipping discounts"],
                ].map(([key, label]) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(combinesWith[key])}
                      onChange={() => toggleCombination(key)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </section>

              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Active dates</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label htmlFor="starts-at" style={labelStyle}>
                      Start date
                    </label>
                    <input
                      id="starts-at"
                      type="date"
                      value={startsAt}
                      onChange={(event) => setStartsAt(event.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="starts-time" style={labelStyle}>
                      Start time
                    </label>
                    <input
                      id="starts-time"
                      type="time"
                      value={startsTime}
                      onChange={(event) => setStartsTime(event.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: hasEndDate ? "14px" : 0 }}>
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(event) => setHasEndDate(event.target.checked)}
                  />
                  <span>Set end date</span>
                </label>
                {hasEndDate && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label htmlFor="ends-at" style={labelStyle}>
                        End date
                      </label>
                      <input
                        id="ends-at"
                        type="date"
                        value={endsAt}
                        onChange={(event) => setEndsAt(event.target.value)}
                        style={fieldStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="ends-time" style={labelStyle}>
                        End time
                      </label>
                      <input
                        id="ends-time"
                        type="time"
                        value={endsTime}
                        onChange={(event) => setEndsTime(event.target.value)}
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>

            <aside style={{ display: "grid", gap: "16px", position: "sticky", top: 0 }}>
              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px" }}>Status</h3>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  style={fieldStyle}
                >
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </section>

              <section style={sectionStyle}>
                <h3 style={{ margin: "0 0 12px", fontSize: "15px" }}>Summary</h3>
                <div style={{ display: "grid", gap: "10px", color: "#6d7175", fontSize: "13px" }}>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "#202223" }}>{discountSummary}</strong>
                  </p>
                  <p style={{ margin: 0 }}>Type: {category}</p>
                  <p style={{ margin: 0 }}>Method: {method}</p>
                  <p style={{ margin: 0 }}>
                    Code: {method === "Discount code" ? code.trim().toUpperCase() || "Not set" : "Automatic"}
                  </p>
                  <p style={{ margin: 0 }}>
                    Minimum: {minimumRequirement === "none"
                      ? "None"
                      : minimumRequirement === "amount"
                        ? `₹${Number(minimumPurchase || 0).toLocaleString("en-IN")}`
                        : `${minimumQuantity || 1} item(s)`}
                  </p>
                  <p style={{ margin: 0 }}>
                    Active from: {startsAt || "Not set"} {startsTime}
                  </p>
                  <p style={{ margin: 0 }}>
                    Ends: {hasEndDate ? `${endsAt || "Not set"} ${endsTime}` : "No end date"}
                  </p>
                </div>
              </section>

              {source === "native" && (
                <section style={{ ...sectionStyle, background: "#fff9e6", color: "#8b5900" }}>
                  <strong style={{ display: "block", marginBottom: "6px" }}>Shopify native discount</strong>
                  <span style={{ fontSize: "13px" }}>This discount is linked to Shopify discount data.</span>
                </section>
              )}
            </aside>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #e1e3e5",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 16px",
                border: "1px solid #c9cccf",
                borderRadius: "8px",
                background: "#fff",
                cursor: "pointer",
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
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {initialDiscount ? "Update discount" : "Create discount"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

DiscountForm.propTypes = {
  initialDiscount: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    code: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.number,
    minimumPurchase: PropTypes.number,
    minimumQuantity: PropTypes.number,
    status: PropTypes.string.isRequired,
    category: PropTypes.string,
    method: PropTypes.string,
    source: PropTypes.string,
    appliesTo: PropTypes.string,
    purchaseType: PropTypes.string,
    minimumRequirement: PropTypes.string,
    eligibility: PropTypes.string,
    usageLimit: PropTypes.number,
    oneUsePerCustomer: PropTypes.bool,
    combinesWith: PropTypes.shape({
      orderDiscounts: PropTypes.bool,
      productDiscounts: PropTypes.bool,
      shippingDiscounts: PropTypes.bool,
    }),
    startsAt: PropTypes.string,
    startsTime: PropTypes.string,
    endsAt: PropTypes.string,
    endsTime: PropTypes.string,
    buyQuantity: PropTypes.number,
    getQuantity: PropTypes.number,
    customerGets: PropTypes.string,
    rewardType: PropTypes.string,
    rewardValue: PropTypes.number,
  }),
  selectedType: PropTypes.string,
  discountSource: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
