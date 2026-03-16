import { useEffect, useState } from "react";
import cubeApi from "../services/cubeApi";
import KPIcards from "../components/KPIcards";
import RevenueChart from "../components/RevenueChart";
import CategoryChart from "../components/CategoryChart";
import FunnelChart from "../components/FunnelChart";
import "../styles/dashboard.css";

function Dashboard() {
  const [kpis, setKpis] = useState({
    revenue: "Loading...",
    orders: "Loading...",
    quantity: "Loading..."
  });

  const [revenueTrend, setRevenueTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const revenueResult = await cubeApi.load({
          measures: ["FactSales.totalRevenue"]
        });

        const ordersResult = await cubeApi.load({
          measures: ["Orders.count"]
        });

        const quantityResult = await cubeApi.load({
          measures: ["FactSales.totalQuantity"]
        });

        const trendResult = await cubeApi.load({
          measures: ["FactSales.totalRevenue"],
          timeDimensions: [
            {
              dimension: "FactSales.orderDate",
              granularity: "month"
            }
          ]
        });

        const categoryResult = await cubeApi.load({
          measures: ["FactSales.totalRevenue"],
          dimensions: ["FactSales.category"]
        });

        const eventsResult = await cubeApi.load({
          measures: ["Events.count"],
          dimensions: ["Events.eventType"]
        });

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
          }))
        );

        setFunnelData(
          eventsResult.rawData().map((item) => ({
            x: item["Events.eventType"],
            value: Number(item["Events.count"])
          }))
        );
      } catch (error) {
        console.error("Dashboard data load error:", error);
      }
    }

    fetchData();
  }, []);

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

      <section className="kpi-grid">
        <KPIcards title="Total Revenue" value={`$${Number(kpis.revenue).toLocaleString()}`} />
        <KPIcards title="Total Orders" value={Number(kpis.orders).toLocaleString()} />
        <KPIcards
          title="Total Quantity Sold"
          value={Number(kpis.quantity).toLocaleString()}
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
