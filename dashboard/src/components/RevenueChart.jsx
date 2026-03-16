import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function RevenueChart({ data }) {
  return (
    <section className="chart-card">
      <h3 className="chart-title">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(43, 53, 77, 0.16)" />
          <XAxis dataKey="x" tick={{ fill: "#304058", fontSize: 12 }} />
          <YAxis tick={{ fill: "#304058", fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#138a72" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

export default RevenueChart;
