import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { ansKnowledge, leadProfiles, planCatalog, priceTables } from '../data/mockData.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Lead360({ path, navigate }) {
  const [activeId, setActiveId] = useState(leadProfiles[0].id);
  const activeLead = leadProfiles.find((lead) => lead.id === activeId) || leadProfiles[0];

  const compatiblePlans = useMemo(
    () => planCatalog.filter((plan) => activeLead.compatiblePlanIds.includes(plan.id)),
    [activeLead],
  );
  const ansAlerts = useMemo(
    () => ansKnowledge.filter((doc) => activeLead.ansDocIds.includes(doc.id)),
    [activeLead],
  );
  const applicableTables = useMemo(
    () => priceTables.filter((table) => compatiblePlans.some((plan) => plan.product === table.product || plan.operator === table.operator)),
    [compatiblePlans],
  );

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Visão CRM"
        title="Lead 360"
        subtitle="Empresa, histórico, produtos compatíveis, tabelas aplicáveis e alertas ANS em uma tela."
        actions={[
          <select key="lead" className="select" value={activeId} onChange={(event) => setActiveId(event.target.value)} aria-label="Selecionar lead">
            {leadProfiles.map((lead) => <option key={lead.id} value={lead.id}>{lead.company}</option>)}
          </select>,
          <button key="quote" className="btn btn--primary" onClick={() => navigate('/cotacao')}>Gerar cotação</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value={activeLead.score} label="score comercial" />
        <Metric value={activeLead.lives} label="vidas estimadas" />
        <Metric value={compatiblePlans.length} label="planos compatíveis" />
        <Metric value={ansAlerts.length} label="alertas ANS" />
      </section>

      <section className="lead360-grid">
        <article className="card lead-profile-card">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Empresa</p>
              <h3 className="flush">{activeLead.company}</h3>
            </div>
            <span className={`status ${activeLead.status === 'Quente' ? 'status--success' : 'status--warn'}`}>{activeLead.status}</span>
          </div>
          <dl className="detail-list">
            <div><dt>Segmento</dt><dd>{activeLead.segment}</dd></div>
            <div><dt>Localidade</dt><dd>{activeLead.city} · {activeLead.state}</dd></div>
            <div><dt>Contato</dt><dd>{activeLead.contact}</dd></div>
            <div><dt>Telefone</dt><dd>{activeLead.phone}</dd></div>
            <div><dt>Operadora atual</dt><dd>{activeLead.currentProvider}</dd></div>
            <div><dt>Dor principal</dt><dd>{activeLead.pain}</dd></div>
          </dl>
        </article>

        <article className="card">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Próxima ação do agente</h3>
            <span className="pill">{activeLead.origin}</span>
          </div>
          <p className="agent-output">{activeLead.nextAction}</p>
          <div className="timeline-list">
            {activeLead.timeline.map(([time, text]) => (
              <div key={`${time}-${text}`} className="timeline-item">
                <strong>{time}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card lead360-wide">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Planos compatíveis</h3>
            <span className="pill">Catálogo</span>
          </div>
          <div className="mini-card-grid">
            {compatiblePlans.map((plan) => (
              <div key={plan.id} className="mini-record">
                <strong>{plan.product}</strong>
                <span>{plan.operator} · {plan.region}</span>
                <small>{plan.segment}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Tabelas aplicáveis</h3>
            <span className="pill">Preço</span>
          </div>
          <div className="stack-list">
            {applicableTables.map((table) => (
              <div key={table.id} className="stack-item">
                <strong>{table.product}</strong>
                <span>{table.region} · {table.validity}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Alertas ANS</h3>
            <span className="pill">Compliance</span>
          </div>
          <div className="stack-list">
            {ansAlerts.map((doc) => (
              <div key={doc.id} className="stack-item">
                <strong>{doc.title}</strong>
                <span>{doc.usage}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </ProductShell>
  );
}
