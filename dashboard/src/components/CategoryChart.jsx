import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function CategoryChart({ data }) {
  return (
    <section className="chart-card">
      <h3 className="chart-title">Revenue by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(43, 53, 77, 0.16)" />
          <XAxis dataKey="x" tick={{ fill: "#304058", fontSize: 12 }} />
          <YAxis tick={{ fill: "#304058", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#f07f13" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default CategoryChart;
