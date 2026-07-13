import { useMemo } from "react";
import PropTypes from "prop-types";
import { useLoaderData, useOutletContext } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const query = `#graphql
    query RecentOrdersWithCustomers($first: Int!) {
      orders(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            customer {
              email
              firstName
              lastName
            }
            shippingAddress {
              city
              province
              country
            }
          }
        }
      }
    }
  `;

  const response = await admin.graphql(query, { variables: { first: 10 } });
  const result = await response.json();
  const orders = result?.data?.orders?.edges?.map((edge) => edge.node).filter(Boolean) || [];

  const customerMap = new Map();
  const locationCounts = new Map();

  orders.forEach((order) => {
    const location = order?.shippingAddress
      ? [order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.country]
          .filter(Boolean)
          .join(", ")
      : "Unknown location";

    if (order?.customer?.email) {
      const email = order.customer.email;
      if (!customerMap.has(email)) {
        const name = [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ").trim();
        customerMap.set(email, {
          email,
          name: name || email,
          location,
        });
      }
    }

    locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  });

  const recentCustomers = Array.from(customerMap.values()).slice(0, 5);
  const topShippingLocations = Array.from(locationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  return {
    ordersCount: orders.length,
    uniqueCustomerCount: customerMap.size,
    recentCustomers,
    topShippingLocations,
  };
};

export default function Analytics() {
  const { messages, discounts, upsells } = useOutletContext();
  const { ordersCount, uniqueCustomerCount, recentCustomers, topShippingLocations } = useLoaderData();

  const metrics = useMemo(() => {
    const activeMessages = messages.filter((message) => message.status === "Active").length;
    const activeDiscounts = discounts.filter((discount) => discount.status === "Active").length;
    const totalUpsells = upsells.length;
    const activeUpsells = upsells.filter((upsell) => upsell.status === "Active").length;
    const directAddUpsells = upsells.filter((upsell) => upsell.actionType === "directAdd").length;
    const totalRules = upsells.reduce((sum, upsell) => sum + (upsell.rules?.length || 0), 0);

    return {
      activeMessages,
      activeDiscounts,
      totalUpsells,
      activeUpsells,
      directAddUpsells,
      totalRules,
      ordersCount,
      uniqueCustomerCount,
    };
  }, [messages, discounts, upsells, ordersCount, uniqueCustomerCount]);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Analytics</h1>
          <p style={{ margin: "8px 0 0", color: "#6d7175" }}>
            Review checkout performance and generated revenue.
          </p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <MetricCard
            label="Active Messages"
            value={metrics.activeMessages}
            detail={`${messages.length} total message${messages.length === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="Active Discounts"
            value={metrics.activeDiscounts}
            detail={`${discounts.length} total discount${discounts.length === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="Active Upsells"
            value={metrics.activeUpsells}
            detail={`${metrics.totalUpsells} total upsell${metrics.totalUpsells === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="Direct Add Upsells"
            value={metrics.directAddUpsells}
            detail={`${metrics.directAddUpsells} direct add configuration${metrics.directAddUpsells === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="Recent Orders"
            value={metrics.ordersCount}
            detail={`${metrics.ordersCount} latest order${metrics.ordersCount === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="Unique Customers"
            value={metrics.uniqueCustomerCount}
            detail={`${metrics.uniqueCustomerCount} distinct email${metrics.uniqueCustomerCount === 1 ? "" : "s"}`}
          />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          <div style={{ padding: "20px", borderRadius: "12px", background: "#fff", border: "1px solid #e1e3e5" }}>
            <h2 style={{ marginTop: 0, fontSize: "20px" }}>Upsell summary</h2>
            <p style={{ margin: "0 0 16px", color: "#6d7175" }}>
              Live analytics using checkout messages, discounts, and upsells stored in the app.
            </p>
            <dl style={{ display: "grid", gap: "12px" }}>
              <StatRow label="Recent orders" value={metrics.ordersCount} />
              <StatRow label="Unique customers" value={metrics.uniqueCustomerCount} />
              <StatRow label="Total upsells" value={metrics.totalUpsells} />
              <StatRow label="Active upsells" value={metrics.activeUpsells} />
              <StatRow label="Direct add upsells" value={metrics.directAddUpsells} />
              <StatRow label="Total rules" value={metrics.totalRules} />
            </dl>
          </div>

          <div style={{ padding: "20px", borderRadius: "12px", background: "#fff", border: "1px solid #e1e3e5" }}>
            <h2 style={{ marginTop: 0, fontSize: "20px" }}>Current data</h2>
            <p style={{ margin: "0 0 16px", color: "#6d7175" }}>
              This page reads the shared app state stored for this shop.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
              <ListItem label="Messages" value={messages.length} />
              <ListItem label="Discounts" value={discounts.length} />
              <ListItem label="Upsells" value={metrics.totalUpsells} />
              <ListItem label="Rules" value={metrics.totalRules} />
              <ListItem label="Recent orders" value={metrics.ordersCount} />
              <ListItem label="Unique customers" value={metrics.uniqueCustomerCount} />
            </ul>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginTop: "24px" }}>
          <div style={{ padding: "20px", borderRadius: "12px", background: "#fff", border: "1px solid #e1e3e5" }}>
            <h2 style={{ marginTop: 0, fontSize: "20px" }}>Recent customer activity</h2>
            <p style={{ margin: "0 0 16px", color: "#6d7175" }}>
              Latest customer emails and shipping locations from recent orders.
            </p>
            {recentCustomers.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
                {recentCustomers.map((customer) => (
                  <li key={customer.email} style={{ display: "grid", gap: "4px", padding: "12px", borderRadius: "10px", background: "#f9fafb" }}>
                    <strong>{customer.name}</strong>
                    <span style={{ color: "#6d7175", fontSize: "13px" }}>
                      {customer.email}
                    </span>
                    <span style={{ color: "#6d7175", fontSize: "13px" }}>
                      {customer.location}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: "#6d7175" }}>
                No recent customer data is available. Make sure the store has recent orders and the app has order access.
              </p>
            )}
          </div>

          <div style={{ padding: "20px", borderRadius: "12px", background: "#fff", border: "1px solid #e1e3e5" }}>
            <h2 style={{ marginTop: 0, fontSize: "20px" }}>Top shipping locations</h2>
            <p style={{ margin: "0 0 16px", color: "#6d7175" }}>
              Shipping destinations from the most recent orders.
            </p>
            {topShippingLocations.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
                {topShippingLocations.map((location) => (
                  <li key={location.location} style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "12px", borderRadius: "10px", background: "#f9fafb" }}>
                    <span style={{ color: "#6d7175" }}>{location.location}</span>
                    <strong>{location.count}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: "#6d7175" }}>
                No shipping location data found yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <div style={{ padding: "20px", borderRadius: "12px", background: "#fff", border: "1px solid #e1e3e5", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <p style={{ margin: 0, color: "#6d7175", fontSize: "13px" }}>{label}</p>
      <strong style={{ display: "block", marginTop: "12px", fontSize: "32px" }}>{value}</strong>
      <p style={{ margin: "8px 0 0", color: "#6d7175", fontSize: "13px" }}>{detail}</p>
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  detail: PropTypes.string.isRequired,
};

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#6d7175" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

StatRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

function ListItem({ label, value }) {
  return (
    <li style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
      <span style={{ color: "#6d7175" }}>{label}</span>
      <strong>{value}</strong>
    </li>
  );
}

ListItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};
