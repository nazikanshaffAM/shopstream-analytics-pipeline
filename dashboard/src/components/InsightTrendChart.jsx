import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function InsightTrendChart({
  title,
  subtitle,
  data,
  primaryKey,
  primaryLabel,
  primaryColor,
  primaryFormatter,
  secondaryKey,
  secondaryLabel,
  secondaryColor
}) {
  return (
    <section className="chart-card">
      <div className="chart-heading">
        <h3 className="chart-title">{title}</h3>
        {subtitle ? <p className="chart-subtitle">{subtitle}</p> : null}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(43, 53, 77, 0.16)" />
          <XAxis dataKey="x" tick={{ fill: "#304058", fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: "#304058", fontSize: 12 }} />
          {secondaryKey ? (
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#304058", fontSize: 12 }} />
          ) : null}
          <Tooltip formatter={(value, name) => {
            if (name === primaryLabel) {
              return [primaryFormatter ? primaryFormatter(value) : value, name];
            }

            return [Number(value).toLocaleString(), name];
          }} />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey={primaryKey}
            name={primaryLabel}
            stroke={primaryColor}
            fill={primaryColor}
            fillOpacity={0.18}
            strokeWidth={3}
          />
          {secondaryKey ? (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={secondaryKey}
              name={secondaryLabel}
              stroke={secondaryColor}
              strokeWidth={3}
              dot={false}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
}

export default InsightTrendChart;