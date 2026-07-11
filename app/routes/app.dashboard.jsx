import { Link, useOutletContext } from "react-router";

const colors = {
  blue: { background: "#eff6ff", foreground: "#2563eb" },
  green: { background: "#ecfdf5", foreground: "#059669" },
  purple: { background: "#f5f3ff", foreground: "#7c3aed" },
  amber: { background: "#fffbeb", foreground: "#d97706" },
};

export default function Dashboard() {
  const { messages, discounts, upsells } = useOutletContext();
  const activeMessages = messages.filter(
    (message) => message.status === "Active",
  ).length;
  const draftMessages = messages.length - activeMessages;
  const activeDiscounts = discounts.filter(
    (discount) => discount.status === "Active",
  ).length;
  const activeUpsells = upsells.filter(
    (upsell) => upsell.status === "Active",
  ).length;
  const draftUpsells = upsells.length - activeUpsells;

  const stats = [
    {
      title: "Active messages",
      value: activeMessages,
      detail: `${messages.length} total · ${draftMessages} draft`,
      to: "/app/messages",
      icon: "M",
      color: colors.blue,
    },
    {
      title: "Active discounts",
      value: activeDiscounts,
      detail: `${discounts.length} total discount${discounts.length === 1 ? "" : "s"}`,
      to: "/app/discounts",
      icon: "%",
      color: colors.green,
    },
    {
      title: "Upsell rules",
      value: upsells.length,
      detail: `${activeUpsells} active · ${draftUpsells} draft`,
      to: "/app/upsells",
      icon: "↗",
      color: colors.purple,
    },
    {
      title: "Revenue generated",
      value: "₹0",
      detail: "All-time attributed revenue",
      to: "/app/analytics",
      icon: "₹",
      color: colors.amber,
    },
  ];

  const quickActions = [
    {
      title: "Create checkout message",
      description: "Show shipping, payment, or promotional information.",
      action: "Manage messages",
      to: "/app/messages",
    },
    {
      title: "Configure a discount",
      description: "Build an offer that helps improve conversion.",
      action: "Manage discounts",
      to: "/app/discounts",
    },
    {
      title: "Add an upsell rule",
      description: "Recommend relevant products during checkout.",
      action: "Manage upsells",
      to: "/app/upsells",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100%",
        padding: "32px 24px 48px",
        background: "#f6f6f7",
        color: "#202223",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: 1.2,
                fontWeight: 700,
              }}
            >
              CHECKOUT UPSELL
            </h1>
            <p style={{ margin: "8px 0 0", color: "#6d7175" }}>
              Here’s a snapshot of your checkout experience.
            </p>
          </div>

          <Link
            to="/app/settings"
            style={{
              padding: "10px 14px",
              border: "1px solid #c9cccf",
              borderRadius: "8px",
              background: "#fff",
              color: "#202223",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
            }}
          >
            App settings
          </Link>
        </header>

        <section
          aria-label="Performance summary"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {stats.map((stat) => (
            <Link
              key={stat.title}
              to={stat.to}
              style={{
                display: "block",
                padding: "20px",
                border: "1px solid #e1e3e5",
                borderRadius: "12px",
                background: "#fff",
                color: "inherit",
                textDecoration: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <span style={{ color: "#6d7175", fontSize: "14px" }}>
                  {stat.title}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    display: "grid",
                    width: "34px",
                    height: "34px",
                    placeItems: "center",
                    borderRadius: "9px",
                    background: stat.color.background,
                    color: stat.color.foreground,
                    fontWeight: 700,
                  }}
                >
                  {stat.icon}
                </span>
              </div>
              <strong
                style={{
                  display: "block",
                  fontSize: "28px",
                  lineHeight: 1.1,
                  marginBottom: "8px",
                }}
              >
                {stat.value}
              </strong>
              <span style={{ color: "#8c9196", fontSize: "13px" }}>
                {stat.detail}
              </span>
            </Link>
          ))}
        </section>

        <section
          style={{
            marginTop: "24px",
            padding: "24px",
            border: "1px solid #e1e3e5",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "20px" }}>Quick actions</h2>
            <p style={{ margin: "6px 0 0", color: "#6d7175" }}>
              Continue building your checkout experience.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
            }}
          >
            {quickActions.map((item) => (
              <div
                key={item.to}
                style={{
                  padding: "18px",
                  border: "1px solid #e1e3e5",
                  borderRadius: "10px",
                  background: "#fafbfb",
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>
                  {item.title}
                </h3>
                <p
                  style={{
                    minHeight: "40px",
                    margin: "0 0 16px",
                    color: "#6d7175",
                    fontSize: "14px",
                    lineHeight: 1.45,
                  }}
                >
                  {item.description}
                </p>
                <Link
                  to={item.to}
                  style={{
                    color: "#005bd3",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {item.action} →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
