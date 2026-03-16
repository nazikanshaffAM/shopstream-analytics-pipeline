import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function InsightBarChart({
  title,
  subtitle,
  data,
  color,
  formatter,
  layout = "vertical"
}) {
  const isHorizontal = layout === "horizontal";

  return (
    <section className="chart-card">
      <div className="chart-heading">
        <h3 className="chart-title">{title}</h3>
        {subtitle ? <p className="chart-subtitle">{subtitle}</p> : null}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={isHorizontal ? { left: 24, right: 8, top: 4, bottom: 4 } : undefined}
        >
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(43, 53, 77, 0.16)" />
          <XAxis
            type={isHorizontal ? "number" : "category"}
            dataKey={isHorizontal ? undefined : "x"}
            tick={{ fill: "#304058", fontSize: 12 }}
          />
          <YAxis
            type={isHorizontal ? "category" : "number"}
            dataKey={isHorizontal ? "x" : undefined}
            width={isHorizontal ? 96 : 48}
            tick={{ fill: "#304058", fontSize: 12 }}
          />
          <Tooltip formatter={(value) => formatter ? formatter(value) : Number(value).toLocaleString()} />
          <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default InsightBarChart;