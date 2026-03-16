import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

function InsightDonutChart({ title, subtitle, data, formatter, colors }) {
  return (
    <section className="chart-card">
      <div className="chart-heading">
        <h3 className="chart-title">{title}</h3>
        {subtitle ? <p className="chart-subtitle">{subtitle}</p> : null}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="x"
            innerRadius={72}
            outerRadius={108}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.x}-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatter ? formatter(value) : Number(value).toLocaleString()} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}

export default InsightDonutChart;