import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { getPlansByIds, getTablesForPlans } from '../services/catalogService.js';
import { getLeadProfileById, listLeadProfiles } from '../services/crmService.js';
import { getAnsKnowledgeByIds } from '../services/knowledgeService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Lead360({ path, navigate }) {
  const leadProfiles = listLeadProfiles();
  const [activeId, setActiveId] = useState(leadProfiles[0].id);
  const activeLead = getLeadProfileById(activeId);

  const compatiblePlans = useMemo(
    () => getPlansByIds(activeLead.compatiblePlanIds),
    [activeLead],
  );
  const ansAlerts = useMemo(
    () => getAnsKnowledgeByIds(activeLead.ansDocIds),
    [activeLead],
  );
  const applicableTables = useMemo(
    () => getTablesForPlans(compatiblePlans),
    [compatiblePlans],
  );

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Visao CRM"
        title="Lead 360"
        subtitle="Empresa, historico, caminhos possiveis, referencias internas e alertas para preparar repasse humano."
        actions={[
          <select key="lead" className="select" value={activeId} onChange={(event) => setActiveId(event.target.value)} aria-label="Selecionar lead">
            {leadProfiles.map((lead) => <option key={lead.id} value={lead.id}>{lead.company}</option>)}
          </select>,
          <button key="quote" className="btn btn--primary" onClick={() => navigate('/handoff')}>Preparar handoff</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value={activeLead.score} label="score comercial" />
        <Metric value={activeLead.lives} label="vidas estimadas" />
        <Metric value={compatiblePlans.length} label="caminhos possiveis" />
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
            <h3 className="flush">Proxima acao do agente</h3>
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
            <h3 className="flush">Caminhos possiveis</h3>
            <span className="pill">Catalogo</span>
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
            <h3 className="flush">Referencias internas</h3>
            <span className="pill">Corretor confirma</span>
          </div>
          <div className="stack-list">
            {applicableTables.map((table) => (
              <div key={table.id} className="stack-item">
                <strong>{table.product}</strong>
                <span>{table.region} · {table.validity}</span>
                <small>Tabela deve ser validada pelo corretor antes da proposta.</small>
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
