function KPIcards({ title, value, detail, accent = "sage" }) {
  return (
    <article className={`kpi-card accent-${accent}`}>
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
      {detail ? <p className="kpi-detail">{detail}</p> : null}
    </article>
  );
}

export default KPIcards;
