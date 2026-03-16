import { useEffect, useState } from "react";
import cubeApi from "../services/cubeApi";
import KPIcards from "../components/KPIcards";
import RevenueChart from "../components/RevenueChart";
import CategoryChart from "../components/CategoryChart";
import FunnelChart from "../components/FunnelChart";
import ChannelChart from "../components/ChannelChart";
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

function formatDisplayValue(value, prefix = "") {
  if (value === null || value === undefined) {
    return "Loading...";
  }

  return `${prefix}${Number(value).toLocaleString()}`;
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

function buildStatusFilter(cubeName, statusFilter) {
  if (statusFilter === "all") {
    return [];
  }

  return [
    {
      member: `${cubeName}.status`,
      operator: "equals",
      values: [statusFilter]
    }
  ];
}

function Dashboard() {
  const [kpis, setKpis] = useState({
    revenue: null,
    orders: null,
    quantity: null
  });
  const [dateRange, setDateRange] = useState("365");
  const [statusFilter, setStatusFilter] = useState("completed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);

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
        const eventTimeDimensions = buildTimeDimensions(
          "Events.timestamp",
          dateRange
        );
        const salesFilters = buildStatusFilter("FactSales", statusFilter);
        const orderFilters = buildStatusFilter("Orders", statusFilter);

        const [
          revenueResult,
          ordersResult,
          quantityResult,
          trendResult,
          categoryResult,
          channelResult,
          eventsResult
        ] = await Promise.all([
          cubeApi.load({
            measures: ["FactSales.totalRevenue"],
            timeDimensions: salesTimeDimensions,
            filters: salesFilters
          }),
          cubeApi.load({
            measures: ["Orders.count"],
            timeDimensions: orderTimeDimensions,
            filters: orderFilters
          }),
          cubeApi.load({
            measures: ["FactSales.totalQuantity"],
            timeDimensions: salesTimeDimensions,
            filters: salesFilters
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
            measures: ["Events.count"],
            dimensions: ["Events.eventType"],
            timeDimensions: eventTimeDimensions
          })
        ]);

        setKpis({
          revenue: Number(
            revenueResult.rawData()[0]?.["FactSales.totalRevenue"] || 0
          ).toFixed(2),
          orders: ordersResult.rawData()[0]?.["Orders.count"] || 0,
          quantity: quantityResult.rawData()[0]?.["FactSales.totalQuantity"] || 0
        });

        setRevenueTrend(
          trendResult.rawData().map((item) => ({
            x: item["FactSales.orderDate.month"],
            value: Number(item["FactSales.totalRevenue"])
          }))
        );

        setCategoryData(
          categoryResult.rawData().map((item) => ({
            x: item["FactSales.category"],
            value: Number(item["FactSales.totalRevenue"])
          })).sort((left, right) => right.value - left.value)
        );

        setChannelData(
          channelResult.rawData().map((item) => ({
            x: item["FactSales.channel"],
            value: Number(item["FactSales.totalRevenue"])
          })).sort((left, right) => right.value - left.value)
        );

        setFunnelData(
          eventsResult.rawData().map((item) => ({
            x: item["Events.eventType"],
            value: Number(item["Events.count"])
          })).sort((left, right) => right.value - left.value)
        );
      } catch (error) {
        console.error("Dashboard data load error:", error);
        setError("Could not load dashboard data. Make sure Cube API is running on localhost:4000.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange, statusFilter]);

  return (
    <div className="dashboard-shell">
      <div className="dashboard-backdrop" aria-hidden="true" />

      <header className="dashboard-header">
        <p className="eyebrow">shopstream analytics</p>
        <h1>Commerce Pulse Dashboard</h1>
        <p className="subtitle">
          Live performance snapshot across sales, category contribution, and
          behavioral funnel stages.
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
        </div>

        <p className="filter-note">
          Date range updates all charts. Order status updates sales KPIs and sales charts.
        </p>
      </section>

      {error ? <div className="dashboard-alert">{error}</div> : null}

      <section className="kpi-grid">
        <KPIcards title="Total Revenue" value={loading ? "Loading..." : formatDisplayValue(kpis.revenue, "$" )} />
        <KPIcards title="Total Orders" value={loading ? "Loading..." : formatDisplayValue(kpis.orders)} />
        <KPIcards
          title="Total Quantity Sold"
          value={loading ? "Loading..." : formatDisplayValue(kpis.quantity)}
        />
      </section>

      <section className="chart-grid">
        <div className="chart-cell chart-wide">
          <RevenueChart data={revenueTrend} />
        </div>

        <div className="chart-cell">
          <CategoryChart data={categoryData} />
        </div>

        <div className="chart-cell">
          <ChannelChart data={channelData} />
        </div>

        <div className="chart-cell chart-wide">
          <FunnelChart data={funnelData} />
        </div>
      </section>

      <footer className="dashboard-footnote">
        Powered by Cube semantic models on PostgreSQL views.
      </footer>
    </div>
  );
}

export default Dashboard;
