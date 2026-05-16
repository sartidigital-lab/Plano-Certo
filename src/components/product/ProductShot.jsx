import LeadList from '../leads/LeadList.jsx';
import Metric from '../ui/Metric.jsx';

export default function ProductShot() {
  return (
    <div className="product-shot" aria-label="Previa do dashboard Plano Certo">
      <div className="shot-bar">
        <div className="dot-row"><span className="dot" /><span className="dot" /><span className="dot" /></div>
        plano-certo.app/corretor
      </div>
      <div className="shot-body">
        <aside className="mini-sidebar">
          <strong>Fila comercial</strong>
          <div className="mini-nav">
            <span className="active">Leads qualificados</span>
            <span>Agente outbound</span>
            <span>WhatsApp</span>
            <span>Pipeline</span>
          </div>
        </aside>
        <div className="shot-content">
          <div className="kpi-row shot-kpis">
            <Metric value="42" label="empresas triadas hoje" />
            <Metric value="18" label="repasses para corretores" />
          </div>
          <LeadList />
        </div>
      </div>
    </div>
  );
}
