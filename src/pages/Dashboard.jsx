import { useState } from 'react';
import ChannelPerformance from '../components/charts/ChannelPerformance.jsx';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import { fetchLeads, listLeads } from '../services/crmService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Dashboard({ path, navigate }) {
  const { data: leads, status } = useAsyncResource(fetchLeads, listLeads(), []);
  const [filter, setFilter] = useState('');
  const [activeStatus, setActiveStatus] = useState('Quente');
  const visibleLeads = leads.filter((lead) => `${lead.company} ${lead.origin}`.toLowerCase().includes(filter.toLowerCase()));
  const hotLeads = leads.filter((lead) => lead.status === 'Quente').length;
  const averageScore = Math.round(leads.reduce((sum, lead) => sum + Number(lead.score || 0), 0) / Math.max(leads.length, 1));

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Operacao de hoje"
        title="Dashboard do corretor"
        subtitle="Leads empresariais capturados, qualificados e prontos para repasse."
        actions={[
          <input key="filter" className="input" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar empresa, origem ou cidade" aria-label="Filtrar leads" />,
          <span key="source" className="pill">{status === 'ready' ? 'Supabase' : 'Mock'}</span>,
          <button key="button" className="btn btn--primary">Distribuir proximos 5</button>,
        ]}
      />
      <section className="kpi-row" aria-label="Indicadores">
        <Metric value={leads.length} label="leads no radar" />
        <Metric value={hotLeads} label="prioridade alta" />
        <Metric value={averageScore} label="score medio" />
        <Metric value="11m" label="SLA medio de contato" />
      </section>
      <section className="data-grid">
        <div className="table-card">
          <div className="table-scroll">
            <div className="table-header"><span>Empresa</span><span>Origem</span><span>Vidas</span><span>Status</span><span>Score</span></div>
            {visibleLeads.map((lead, index) => {
              const currentStatus = index === 0 ? activeStatus : lead.status;
              return (
                <div className="table-row" key={lead.id || lead.company}>
                  <strong>{lead.company}</strong>
                  <span>{lead.origin}</span>
                  <span>{lead.lives}</span>
                  <span className={`status ${statusClass(currentStatus)}`}>{currentStatus}</span>
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
              <option>Atencao</option>
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
  if (status.includes('Atencao')) return 'status--warn';
  return 'status--info';
}
