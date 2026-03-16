function KPIcards({ title, value }) {
  return (
    <article className="kpi-card">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
    </article>
  );
}

export default KPIcards;
