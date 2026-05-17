import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { getPlansByIds, getPriceTableById, listPriceTables } from '../services/catalogService.js';
import { listAnsKnowledge } from '../services/knowledgeService.js';
import { getDefaultQuoteScenario } from '../services/quoteService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function AssistedQuote({ path, navigate }) {
  const scenario = getDefaultQuoteScenario();
  const ansKnowledge = listAnsKnowledge();
  const priceTables = listPriceTables();
  const [selectedTableId, setSelectedTableId] = useState(scenario.selectedTableIds[0]);
  const selectedTable = getPriceTableById(selectedTableId);
  const selectedPlans = getPlansByIds(scenario.selectedPlanIds);
  const pendingQuestions = useMemo(() => [
    'Confirmar UF/regiao exata de contratacao e abrangencia desejada.',
    'Validar quantidade de vidas, dependentes e faixa etaria predominante.',
    'Checar operadora atual, reajuste recebido e rede indispensavel.',
    'Confirmar tabela vigente com o corretor antes de falar em preco.',
  ], []);

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Triagem assistida"
        title="Handoff para corretor"
        subtitle="Classifique o lead, organize contexto e gere um resumo seguro para o corretor confirmar tabela, operadora e regiao."
        actions={[
          <select key="table" className="select" value={selectedTableId} onChange={(event) => setSelectedTableId(event.target.value)} aria-label="Selecionar referencia interna">
            {priceTables.map((table) => <option key={table.id} value={table.id}>{table.product} · {table.region}</option>)}
          </select>,
          <button key="handoff" className="btn btn--primary">Encaminhar para corretor</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value={scenario.lives} label="vidas estimadas" />
        <Metric value={scenario.region} label="regiao informada" />
        <Metric value={selectedPlans.length} label="caminhos possiveis" />
        <Metric value="Humano" label="confirmacao de tabela" />
      </section>

      <section className="quote-layout">
        <article className="card">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Lead classificado</p>
              <h3 className="flush">{scenario.company}</h3>
            </div>
            <span className="pill">{scenario.region}</span>
          </div>
          <div className="priority-list">
            {scenario.priorities.map((priority) => <span key={priority} className="status status--info">{priority}</span>)}
          </div>
          <div className="citation-box">
            <strong>Resumo para o corretor</strong>
            <p>Empresa com {scenario.lives} vidas estimadas em {scenario.region}. Lead deve ser conduzido por corretor humano para confirmar operadoras disponiveis, tabela vigente por regiao, rede desejada e premissas antes de proposta.</p>
          </div>
        </article>

        <aside className="detail-panel">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Referencia interna</p>
              <h3 className="flush">{selectedTable.product}</h3>
            </div>
            <span className="status status--warn">Confirmar</span>
          </div>
          <dl className="detail-list">
            <div><dt>Operadora</dt><dd>{selectedTable.operator}</dd></div>
            <div><dt>Administradora</dt><dd>{selectedTable.administrator}</dd></div>
            <div><dt>Regiao</dt><dd>{selectedTable.region}</dd></div>
            <div><dt>Origem</dt><dd>{selectedTable.source}</dd></div>
          </dl>
          <div className="agent-readiness">
            <span className="status status--warn">Nao enviar preco automatico</span>
            <span className="status status--info">Corretor valida tabela</span>
          </div>
        </aside>

        <article className="card quote-wide">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Caminhos possiveis de atendimento</h3>
            <span className="pill">Sem promessa de preco</span>
          </div>
          <div className="mini-card-grid">
            {selectedPlans.map((plan) => (
              <div key={plan.id} className="mini-record">
                <strong>{plan.product}</strong>
                <span>{plan.operator} · {plan.copay}</span>
                <small>{plan.network}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Perguntas pendentes</h3>
            <span className="pill">Antes da proposta</span>
          </div>
          <ul className="check-list">
            {pendingQuestions.map((question) => <li key={question}>{question}</li>)}
          </ul>
        </article>

        <article className="card">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Cuidados ANS</h3>
            <span className="pill">Compliance</span>
          </div>
          <div className="stack-list">
            {ansKnowledge.slice(0, 3).map((doc) => (
              <div key={doc.id} className="stack-item">
                <strong>{doc.title}</strong>
                <span>{doc.excerpt}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </ProductShell>
  );
}
