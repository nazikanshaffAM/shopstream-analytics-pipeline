import { useEffect, useState } from "react";
import cubeApi from "../services/cubeApi";
import KPIcards from "../components/KPIcards";
import InsightTrendChart from "../components/InsightTrendChart";
import InsightBarChart from "../components/InsightBarChart";
import InsightDonutChart from "../components/InsightDonutChart";
import "../styles/dashboard.css";

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "365", label: "Last 12 months" },
  { value: "180", label: "Last 6 months" },
  { value: "90", label: "Last 90 days" }
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" }
];

const CHANNEL_OPTIONS = [
  { value: "all", label: "All channels" },
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "store", label: "Store" }
];

const COUNTRY_OPTIONS = [
  { value: "all", label: "All countries" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "DE", label: "Germany" }
];

const DEVICE_OPTIONS = [
  { value: "all", label: "All devices" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" }
];

const EVENT_ORDER = [
  "page_view",
  "search",
  "product_view",
  "add_to_cart",
  "checkout_start",
  "purchase"
];

function formatDisplayValue(value, prefix = "") {
  if (value === null || value === undefined) {
    return "Loading...";
  }

  return `${prefix}${Number(value).toLocaleString()}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatMonthLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function toTitleCase(value) {
  return String(value || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function safePercent(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return (numerator / denominator) * 100;
}

function buildDateRange(dateRange) {
  if (dateRange === "all") {
    return undefined;
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - Number(dateRange));

  return [
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10)
  ];
}

function buildTimeDimensions(dimension, dateRange, granularity) {
  const resolvedDateRange = buildDateRange(dateRange);

  if (!granularity && !resolvedDateRange) {
    return [];
  }

  return [
    {
      dimension,
      ...(granularity ? { granularity } : {}),
      ...(resolvedDateRange ? { dateRange: resolvedDateRange } : {})
    }
  ];
}

function buildEqualsFilter(cubeName, memberName, selectedValue) {
  if (selectedValue === "all") {
    return [];
  }

  return [
    {
      member: `${cubeName}.${memberName}`,
      operator: "equals",
      values: [selectedValue]
    }
  ];
}

function mergeMonthlySeries(revenueRows, orderRows) {
  const merged = new Map();

  revenueRows.forEach((item) => {
    const monthKey = item["FactSales.orderDate.month"];
    merged.set(monthKey, {
      monthKey,
      x: formatMonthLabel(monthKey),
      revenue: Number(item["FactSales.totalRevenue"] || 0),
      orders: 0
    });
  });

  orderRows.forEach((item) => {
    const monthKey = item["Orders.orderDate.month"];
    const existing = merged.get(monthKey) || {
      monthKey,
      x: formatMonthLabel(monthKey),
      revenue: 0,
      orders: 0
    };

    existing.orders = Number(item["Orders.count"] || 0);
    merged.set(monthKey, existing);
  });

  return Array.from(merged.values()).sort(
    (left, right) => new Date(left.monthKey) - new Date(right.monthKey)
  );
}

function buildHighlight(label, headline, detail, tone) {
  return { label, headline, detail, tone };
}

function buildHighlights({ categoryData, channelData, countryData, tierData, funnelData }) {
  const topCategory = categoryData[0];
  const topChannel = channelData[0];
  const topCountry = countryData[0];
  const topTier = tierData[0];
  const pageViews = funnelData.find((item) => item.x === "Page View")?.value || 0;
  const purchases = funnelData.find((item) => item.x === "Purchase")?.value || 0;
  const conversionRate = safePercent(purchases, pageViews);
  const categoryTotal = categoryData.reduce((sum, item) => sum + item.value, 0);
  const channelTotal = channelData.reduce((sum, item) => sum + item.value, 0);

  return [
    buildHighlight(
      "Category leader",
      topCategory ? `${topCategory.x} contributes ${formatPercent(safePercent(topCategory.value, categoryTotal))}` : "No category signal",
      topCategory ? `${formatCurrency(topCategory.value)} in attributed revenue.` : "Adjust filters to inspect category mix.",
      "sage"
    ),
    buildHighlight(
      "Channel mix",
      topChannel ? `${topChannel.x} is the strongest sales channel` : "No channel signal",
      topChannel ? `${formatPercent(safePercent(topChannel.value, channelTotal))} of filtered revenue flows through this channel.` : "Try removing filters to view the mix.",
      "sunrise"
    ),
    buildHighlight(
      "Geographic demand",
      topCountry ? `${topCountry.x} leads current demand` : "No geography signal",
      topCountry ? `${formatCurrency(topCountry.value)} in revenue from this market.` : "Country-level revenue is not available for the current selection.",
      "ocean"
    ),
    buildHighlight(
      "Behavior health",
      `${formatPercent(conversionRate)} page-view to purchase ratio`,
      topTier ? `${topTier.x} is the largest customer tier in the filtered signup cohort.` : "Customer tier mix appears once signup data is available.",
      "plum"
    )
  ];
}

function Dashboard() {
  const [kpis, setKpis] = useState({
    revenue: null,
    orders: null,
    quantity: null,
    avgOrderValue: null,
    returnRate: null,
    avgDiscountPct: null
  });
  const [dateRange, setDateRange] = useState("all");
  const [statusFilter, setStatusFilter] = useState("completed");
  const [channelFilter, setChannelFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [customerTrend, setCustomerTrend] = useState([]);
  const [tierData, setTierData] = useState([]);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const salesTimeDimensions = buildTimeDimensions(
          "FactSales.orderDate",
          dateRange
        );
        const orderTimeDimensions = buildTimeDimensions(
          "Orders.orderDate",
          dateRange
        );
        const customerTimeDimensions = buildTimeDimensions(
          "Customers.signupDate",
          dateRange
        );
        const eventTimeDimensions = buildTimeDimensions(
          "Events.timestamp",
          dateRange
        );
        const salesFilters = [
          ...buildEqualsFilter("FactSales", "status", statusFilter),
          ...buildEqualsFilter("FactSales", "channel", channelFilter),
          ...buildEqualsFilter("FactSales", "shippingCountry", countryFilter)
        ];
        const orderFilters = [
          ...buildEqualsFilter("Orders", "status", statusFilter),
          ...buildEqualsFilter("Orders", "channel", channelFilter),
          ...buildEqualsFilter("Orders", "shippingCountry", countryFilter)
        ];
        const customerFilters = buildEqualsFilter("Customers", "country", countryFilter);
        const eventFilters = buildEqualsFilter("Events", "device", deviceFilter);

        const [
          salesSummaryResult,
          orderSummaryResult,
          revenueTrendResult,
          ordersTrendResult,
          categoryResult,
          channelResult,
          countryResult,
          statusResult,
          eventsResult,
          customerTrendResult,
          tierResult
        ] = await Promise.all([
          cubeApi.load({
            measures: [
              "FactSales.totalRevenue",
              "FactSales.totalQuantity",
              "FactSales.returnedItems",
              "FactSales.count"
            ],
            timeDimensions: salesTimeDimensions,
            filters: salesFilters
          }),
          cubeApi.load({
            measures: ["Orders.count", "Orders.avgDiscountPct"],
            timeDimensions: orderTimeDimensions,
            filters: orderFilters
          }),
          cubeApi.load({
            measures: ["FactSales.totalRevenue"],
            timeDimensions: buildTimeDimensions(
              "FactSales.orderDate",
              dateRange,
              "month"
            ),
            filters: salesFilters
          }),
          cubeApi.load({
            measures: ["Orders.count"],
            timeDimensions: buildTimeDimensions(
              "Orders.orderDate",
              dateRange,
              "month"
            ),
            filters: orderFilters
          }),
          cubeApi.load({
            measures: ["FactSales.totalRevenue"],
            dimensions: ["FactSales.category"],
            timeDimensions: salesTimeDimensions,
            filters: salesFilters
          }),
          cubeApi.load({
            measures: ["FactSales.totalRevenue"],
            dimensions: ["FactSales.channel"],
            timeDimensions: salesTimeDimensions,
            filters: salesFilters
          }),
          cubeApi.load({
            measures: ["FactSales.totalRevenue"],
            dimensions: ["FactSales.shippingCountry"],
            timeDimensions: salesTimeDimensions,
            filters: salesFilters
          }),
          cubeApi.load({
            measures: ["Orders.count"],
            dimensions: ["Orders.status"],
            timeDimensions: orderTimeDimensions,
            filters: [
              ...buildEqualsFilter("Orders", "channel", channelFilter),
              ...buildEqualsFilter("Orders", "shippingCountry", countryFilter)
            ]
          }),
          cubeApi.load({
            measures: ["Events.count"],
            dimensions: ["Events.eventType"],
            timeDimensions: eventTimeDimensions,
            filters: eventFilters
          }),
          cubeApi.load({
            measures: ["Customers.count"],
            timeDimensions: buildTimeDimensions(
              "Customers.signupDate",
              dateRange,
              "month"
            ),
            filters: customerFilters
          }),
          cubeApi.load({
            measures: ["Customers.count"],
            dimensions: ["Customers.tier"],
            timeDimensions: customerTimeDimensions,
            filters: customerFilters
          })
        ]);

        const salesSummary = salesSummaryResult.rawData()[0] || {};
        const orderSummary = orderSummaryResult.rawData()[0] || {};
        const totalRevenue = Number(salesSummary["FactSales.totalRevenue"] || 0);
        const totalOrders = Number(orderSummary["Orders.count"] || 0);
        const totalQuantity = Number(salesSummary["FactSales.totalQuantity"] || 0);
        const returnedItems = Number(salesSummary["FactSales.returnedItems"] || 0);
        const factRows = Number(salesSummary["FactSales.count"] || 0);
        const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
        const returnRate = safePercent(returnedItems, factRows);
        const avgDiscountPct = Number(orderSummary["Orders.avgDiscountPct"] || 0) * 100;

        setKpis({
          revenue: totalRevenue.toFixed(2),
          orders: totalOrders,
          quantity: totalQuantity,
          avgOrderValue,
          returnRate,
          avgDiscountPct
        });

        const nextPerformanceTrend = mergeMonthlySeries(
          revenueTrendResult.rawData(),
          ordersTrendResult.rawData()
        );
        setPerformanceTrend(nextPerformanceTrend);

        const nextCategoryData = categoryResult.rawData().map((item) => ({
          x: item["FactSales.category"],
          value: Number(item["FactSales.totalRevenue"])
        })).sort((left, right) => right.value - left.value);
        setCategoryData(nextCategoryData);

        const nextChannelData = channelResult.rawData().map((item) => ({
          x: toTitleCase(item["FactSales.channel"]),
          value: Number(item["FactSales.totalRevenue"])
        })).sort((left, right) => right.value - left.value);
        setChannelData(nextChannelData);

        const nextCountryData = countryResult.rawData().map((item) => ({
          x: item["FactSales.shippingCountry"],
          value: Number(item["FactSales.totalRevenue"])
        })).sort((left, right) => right.value - left.value);
        setCountryData(nextCountryData);

        const nextStatusData = statusResult.rawData().map((item) => ({
          x: toTitleCase(item["Orders.status"]),
          value: Number(item["Orders.count"])
        })).sort((left, right) => right.value - left.value);
        setStatusData(nextStatusData);

        const nextFunnelData = eventsResult.rawData().map((item) => ({
          x: toTitleCase(item["Events.eventType"]),
          rawKey: item["Events.eventType"],
          value: Number(item["Events.count"])
        })).sort(
          (left, right) => EVENT_ORDER.indexOf(left.rawKey) - EVENT_ORDER.indexOf(right.rawKey)
        );
        setFunnelData(nextFunnelData);

        const nextCustomerTrend = customerTrendResult.rawData().map((item) => ({
          monthKey: item["Customers.signupDate.month"],
          x: formatMonthLabel(item["Customers.signupDate.month"]),
          revenue: Number(item["Customers.count"] || 0)
        })).sort((left, right) => new Date(left.monthKey) - new Date(right.monthKey));
        setCustomerTrend(nextCustomerTrend);

        const nextTierData = tierResult.rawData().map((item) => ({
          x: toTitleCase(item["Customers.tier"]),
          value: Number(item["Customers.count"])
        })).sort((left, right) => right.value - left.value);
        setTierData(nextTierData);

        setHighlights(
          buildHighlights({
            categoryData: nextCategoryData,
            channelData: nextChannelData,
            countryData: nextCountryData,
            tierData: nextTierData,
            funnelData: nextFunnelData
          })
        );
      } catch (error) {
        console.error("Dashboard data load error:", error);
        setError("Could not load dashboard data. Make sure Cube API is running on localhost:4000.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange, statusFilter, channelFilter, countryFilter, deviceFilter]);

  return (
    <div className="dashboard-shell">
      <div className="dashboard-backdrop" aria-hidden="true" />

      <header className="dashboard-header">
        <p className="eyebrow">shopstream analytics</p>
        <h1>Commerce Intelligence Dashboard</h1>
        <p className="subtitle">
          A broader operating view across demand, fulfillment quality, geography,
          customer acquisition, and behavioral intent.
        </p>
      </header>

      <section className="filters-panel">
        <div className="filters-row">
          <label className="filter-control">
            <span>Date Range</span>
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Order Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Sales Channel</span>
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
            >
              {CHANNEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Shipping Country</span>
            <select
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
            >
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Event Device</span>
            <select
              value={deviceFilter}
              onChange={(event) => setDeviceFilter(event.target.value)}
            >
              {DEVICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="filter-note">
          Date range applies across sales, customer signup, and event behavior. Status, channel, and country reshape commercial views, while device narrows the behavior model.
        </p>
      </section>

      {error ? <div className="dashboard-alert">{error}</div> : null}

      <section className="kpi-grid">
        <KPIcards
          title="Total Revenue"
          value={loading ? "Loading..." : formatDisplayValue(kpis.revenue, "$")}
          detail="Gross revenue for the selected sales scope."
          accent="sage"
        />
        <KPIcards
          title="Orders"
          value={loading ? "Loading..." : formatDisplayValue(kpis.orders)}
          detail="Completed, pending, cancelled, or refunded depending on the filter."
          accent="sunrise"
        />
        <KPIcards
          title="Average Order Value"
          value={loading ? "Loading..." : formatCurrency(kpis.avgOrderValue)}
          detail="Revenue divided by total orders."
          accent="ocean"
        />
        <KPIcards
          title="Units Sold"
          value={loading ? "Loading..." : formatDisplayValue(kpis.quantity)}
          detail="Total product quantity moved through the selected scope."
          accent="plum"
        />
        <KPIcards
          title="Return Rate"
          value={loading ? "Loading..." : formatPercent(kpis.returnRate)}
          detail="Returned item rows as a share of fact sales rows."
          accent="ember"
        />
        <KPIcards
          title="Average Discount"
          value={loading ? "Loading..." : formatPercent(kpis.avgDiscountPct)}
          detail="Mean discount applied to filtered orders."
          accent="sage"
        />
      </section>

      <section className="highlight-grid">
        {highlights.map((item) => (
          <article key={item.label} className={`highlight-card tone-${item.tone}`}>
            <p className="highlight-label">{item.label}</p>
            <h3>{item.headline}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="chart-grid">
        <div className="chart-cell chart-wide">
          <InsightTrendChart
            title="Revenue and Order Momentum"
            subtitle="Monthly view of commercial throughput over the selected period."
            data={performanceTrend}
            primaryKey="revenue"
            primaryLabel="Revenue"
            primaryColor="#138a72"
            primaryFormatter={formatCurrency}
            secondaryKey="orders"
            secondaryLabel="Orders"
            secondaryColor="#1c6dd0"
          />
        </div>

        <div className="chart-cell">
          <InsightBarChart
            title="Revenue by Category"
            subtitle="Which product families are creating the most value."
            data={categoryData.slice(0, 6)}
            color="#f07f13"
            formatter={formatCurrency}
            layout="horizontal"
          />
        </div>

        <div className="chart-cell">
          <InsightBarChart
            title="Revenue by Shipping Country"
            subtitle="Market demand based on delivery destination."
            data={countryData}
            color="#1c6dd0"
            formatter={formatCurrency}
            layout="horizontal"
          />
        </div>

        <div className="chart-cell">
          <InsightDonutChart
            title="Order Status Mix"
            subtitle="Operational quality across the filtered order set."
            data={statusData}
            formatter={(value) => Number(value).toLocaleString()}
            colors={["#138a72", "#f07f13", "#d5533f", "#6e4bde"]}
          />
        </div>

        <div className="chart-cell">
          <InsightBarChart
            title="Revenue by Channel"
            subtitle="Channel contribution after current sales filters."
            data={channelData}
            color="#6e4bde"
            formatter={formatCurrency}
          />
        </div>

        <div className="chart-cell chart-wide">
          <InsightBarChart
            title="Behavior Funnel"
            subtitle="Intent signals across the selected event device and date range."
            data={funnelData}
            color="#c7526d"
            formatter={(value) => Number(value).toLocaleString()}
          />
        </div>

        <div className="chart-cell chart-wide">
          <InsightTrendChart
            title="Customer Signup Momentum"
            subtitle="Monthly acquisition trend from the customer model."
            data={customerTrend}
            primaryKey="revenue"
            primaryLabel="Signups"
            primaryColor="#ff8c42"
            primaryFormatter={(value) => Number(value).toLocaleString()}
          />
        </div>

        <div className="chart-cell">
          <InsightDonutChart
            title="Customer Tier Distribution"
            subtitle="Mix of customer cohorts within the selected signup scope."
            data={tierData}
            formatter={(value) => Number(value).toLocaleString()}
            colors={["#c7526d", "#f0a202", "#138a72", "#1c6dd0"]}
          />
        </div>

        <div className="chart-cell chart-note-card">
          <div className="chart-card chart-note">
            <h3 className="chart-title">How to Read This Dashboard</h3>
            <p>
              Use status, channel, and country to inspect commercial performance,
              then use the device filter to isolate behavioral intent. The mix of
              sales, customer, and event views helps explain not just revenue,
              but why commercial performance is changing.
            </p>
            <ul className="dashboard-notes">
              <li>Rising revenue with flat orders usually signals a larger basket size.</li>
              <li>High refunded or cancelled share points to fulfillment or pricing issues.</li>
              <li>Strong page views with weak purchase volume suggests conversion friction.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="dashboard-footnote">
        Powered by Cube semantic models on PostgreSQL views.
      </footer>
    </div>
  );
}

export default Dashboard;
