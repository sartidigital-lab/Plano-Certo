export default function ChannelPerformance() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Performance por canal</h3>
        <span className="pill">7 dias</span>
      </div>
      <div className="chart" aria-label="Grafico de barras por canal">
        {[45, 78, 58, 92, 67, 84].map((height) => <span key={height} className="bar" style={{ height: `${height}%` }} />)}
      </div>
      <p className="muted chart-note">Google traz maior intenção; WhatsApp converte melhor quando o corretor responde até 15 minutos.</p>
    </article>
  );
}
