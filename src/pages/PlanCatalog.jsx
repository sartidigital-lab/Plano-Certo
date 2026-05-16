import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { planCatalog } from '../data/mockData.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function PlanCatalog({ path, navigate }) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(planCatalog[0].id);

  const filteredPlans = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return planCatalog;
    return planCatalog.filter((plan) => Object.values(plan).join(' ').toLowerCase().includes(term));
  }, [query]);

  const activePlan = planCatalog.find((plan) => plan.id === activeId) || filteredPlans[0] || planCatalog[0];

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Catálogo técnico"
        title="Catálogo de planos"
        subtitle="Produtos, registros, abrangência, rede e regras comerciais para consulta dos agentes."
        actions={[
          <input key="search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar operadora, região, registro ou produto" aria-label="Buscar planos" />,
          <button key="new" className="btn btn--primary">Novo produto</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value={planCatalog.length} label="produtos no catálogo" />
        <Metric value="4" label="operadoras mapeadas" />
        <Metric value="3" label="regiões com preço vigente" />
        <Metric value="92%" label="dados com confiança alta" />
      </section>

      <section className="catalog-layout">
        <div className="table-card">
          <div className="table-scroll">
            <div className="catalog-header"><span>Produto</span><span>Operadora</span><span>Região</span><span>Vidas</span><span>Status</span></div>
            {filteredPlans.map((plan) => (
              <button key={plan.id} className={`catalog-row ${plan.id === activePlan.id ? 'is-active' : ''}`} onClick={() => setActiveId(plan.id)}>
                <strong>{plan.product}</strong>
                <span>{plan.operator}</span>
                <span>{plan.region}</span>
                <span>{plan.lives}</span>
                <span className={`status ${plan.status === 'Ativo' ? 'status--success' : 'status--warn'}`}>{plan.status}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="detail-panel">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Produto selecionado</p>
              <h3 className="flush">{activePlan.product}</h3>
            </div>
            <span className="pill">{activePlan.confidence}</span>
          </div>
          <dl className="detail-list">
            <div><dt>Registro ANS</dt><dd>{activePlan.ansRegister}</dd></div>
            <div><dt>Administradora</dt><dd>{activePlan.administrator}</dd></div>
            <div><dt>Contratação</dt><dd>{activePlan.contractType}</dd></div>
            <div><dt>Segmentação</dt><dd>{activePlan.segment}</dd></div>
            <div><dt>Coparticipação</dt><dd>{activePlan.copay}</dd></div>
            <div><dt>Rede</dt><dd>{activePlan.network}</dd></div>
          </dl>
          <div className="agent-readiness">
            <span className="status status--info">Disponível para agente</span>
            <span className="status status--warn">Validar preço por tabela vigente</span>
          </div>
        </aside>
      </section>
    </ProductShell>
  );
}
