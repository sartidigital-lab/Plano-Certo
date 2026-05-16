import { useState } from 'react';
import ChannelPerformance from '../components/charts/ChannelPerformance.jsx';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { listLeads } from '../services/crmService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Dashboard({ path, navigate }) {
  const leads = listLeads();
  const [filter, setFilter] = useState('');
  const [activeStatus, setActiveStatus] = useState('Quente');
  const visibleLeads = leads.filter((lead) => `${lead.company} ${lead.origin}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Operação de hoje"
        title="Dashboard do corretor"
        subtitle="Leads empresariais capturados, qualificados e prontos para repasse."
        actions={[
          <input key="filter" className="input" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar empresa, origem ou cidade" aria-label="Filtrar leads" />,
          <button key="button" className="btn btn--primary">Distribuir próximos 5</button>,
        ]}
      />
      <section className="kpi-row" aria-label="Indicadores">
        <Metric value="42" label="empresas qualificadas" />
        <Metric value="18" label="repasses para corretor" />
        <Metric value="27%" label="com reunião agendada" />
        <Metric value="11m" label="SLA médio de contato" />
      </section>
      <section className="data-grid">
        <div className="table-card">
          <div className="table-scroll">
            <div className="table-header"><span>Empresa</span><span>Origem</span><span>Vidas</span><span>Status</span><span>Score</span></div>
            {visibleLeads.map((lead, index) => {
              const status = index === 0 ? activeStatus : lead.status;
              return (
                <div className="table-row" key={lead.company}>
                  <strong>{lead.company}</strong>
                  <span>{lead.origin}</span>
                  <span>{lead.lives}</span>
                  <span className={`status ${statusClass(status)}`}>{status}</span>
                  <span className="score">{lead.score}</span>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="grid">
          <ChannelPerformance />
          <article className="card">
            <h3>Ajustar status do lead ativo</h3>
            <select className="select" value={activeStatus} onChange={(event) => setActiveStatus(event.target.value)} aria-label="Alterar status">
              <option>Quente</option>
              <option>Atenção</option>
              <option>Nutrir</option>
            </select>
          </article>
        </aside>
      </section>
    </ProductShell>
  );
}

function statusClass(status) {
  if (status.includes('Quente')) return 'status--success';
  if (status.includes('Atenção')) return 'status--warn';
  return 'status--info';
}
