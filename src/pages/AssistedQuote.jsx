import { useEffect, useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import { getPlansByIds, getPriceTableById, listPriceTables } from '../services/catalogService.js';
import { fetchLeads, listLeads } from '../services/crmService.js';
import {
  buildBrokerHandoffSummary,
  buildPendingQuestions,
  buildSuggestedPaths,
  classifyLeadForHandoff,
  createBrokerHandoff,
  fetchBrokerHandoffs,
  getHandoffUrgency,
  inferRegion,
  listBrokerHandoffs,
  updateBrokerHandoffStatus,
} from '../services/handoffService.js';
import { listAnsKnowledge } from '../services/knowledgeService.js';
import ProductShell from '../layouts/ProductShell.jsx';

const defaultPlanIds = ['pc-amil-s250-sp', 'pc-sulamerica-exato-rj', 'pc-bradesco-efetivo-pr'];

export default function AssistedQuote({ path, navigate }) {
  const { data: leads, status } = useAsyncResource(fetchLeads, listLeads(), []);
  const ansKnowledge = listAnsKnowledge();
  const priceTables = listPriceTables();
  const [activeLeadId, setActiveLeadId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState(priceTables[0]?.id || '');
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const [handoffs, setHandoffs] = useState(listBrokerHandoffs());
  const [queueState, setQueueState] = useState({ status: 'loading', message: '' });
  const activeLead = leads.find((lead) => lead.id === activeLeadId) || leads[0];
  const selectedTable = getPriceTableById(selectedTableId);
  const selectedPlans = getPlansByIds(defaultPlanIds);
  const pendingQuestions = useMemo(() => buildPendingQuestions(activeLead), [activeLead]);
  const suggestedPaths = useMemo(() => buildSuggestedPaths(activeLead, selectedPlans), [activeLead, selectedPlans]);
  const handoffSummary = useMemo(() => buildBrokerHandoffSummary(activeLead), [activeLead]);
  const urgency = getHandoffUrgency(activeLead);
  const classification = classifyLeadForHandoff(activeLead);

  useEffect(() => {
    loadHandoffs();
  }, []);

  async function loadHandoffs() {
    setQueueState({ status: 'loading', message: 'Carregando repasses...' });

    try {
      const records = await fetchBrokerHandoffs();
      setHandoffs(records);
      setQueueState({
        status: 'ready',
        message: records.length === 0 ? 'Nenhum handoff salvo ainda.' : '',
      });
    } catch (error) {
      setHandoffs(listBrokerHandoffs());
      setQueueState({
        status: 'fallback',
        message: `Fila em modo demo: ${error.message}`,
      });
    }
  }

  async function saveHandoff() {
    setSaveState({ status: 'saving', message: 'Gravando handoff...' });

    try {
      const result = await createBrokerHandoff({
        lead: activeLead,
        pendingQuestions,
        suggestedPaths,
        selectedTable,
      });

      setSaveState({
        status: 'saved',
        message: result.mode === 'supabase'
          ? `Handoff salvo para o corretor. ID ${result.id.slice(0, 8)}.`
          : 'Handoff simulado no modo demo.',
      });
      await loadHandoffs();
    } catch (error) {
      setSaveState({
        status: 'error',
        message: `Nao foi possivel salvar o handoff: ${error.message}`,
      });
    }
  }

  async function changeHandoffStatus(id, nextStatus) {
    setHandoffs((current) => current.map((handoff) => (
      handoff.id === id ? { ...handoff, status: nextStatus } : handoff
    )));

    try {
      await updateBrokerHandoffStatus(id, nextStatus);
      setQueueState({ status: 'ready', message: 'Status do repasse atualizado.' });
    } catch (error) {
      setQueueState({ status: 'fallback', message: `Nao foi possivel atualizar: ${error.message}` });
      await loadHandoffs();
    }
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Triagem assistida"
        title="Handoff para corretor"
        subtitle="Selecione um lead, organize contexto e gere um resumo seguro para o corretor confirmar tabela, operadora e regiao."
        actions={[
          <select key="lead" className="select" value={activeLead?.id || ''} onChange={(event) => setActiveLeadId(event.target.value)} aria-label="Selecionar lead">
            {leads.map((lead) => <option key={lead.id || lead.company} value={lead.id || lead.company}>{lead.company}</option>)}
          </select>,
          <select key="table" className="select" value={selectedTableId} onChange={(event) => setSelectedTableId(event.target.value)} aria-label="Selecionar referencia interna">
            {priceTables.map((table) => <option key={table.id} value={table.id}>{table.product} · {table.region}</option>)}
          </select>,
          <button key="save" className="btn btn--primary" type="button" onClick={saveHandoff} disabled={saveState.status === 'saving'}>
            {saveState.status === 'saving' ? 'Salvando...' : 'Salvar handoff'}
          </button>,
          <span key="source" className="pill">{status === 'ready' ? 'Supabase' : 'Mock'}</span>,
        ]}
      />

      {saveState.message && (
        <section className={`handoff-notice handoff-notice--${saveState.status}`} role="status">
          {saveState.message}
        </section>
      )}

      <section className="kpi-row">
        <Metric value={activeLead?.lives || 'N/D'} label="vidas estimadas" />
        <Metric value={inferRegion(activeLead)} label="regiao informada" />
        <Metric value={urgency} label="urgencia sugerida" />
        <Metric value="Humano" label="confirmacao de tabela" />
      </section>

      <section className="quote-layout">
        <article className="card">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Lead classificado</p>
              <h3 className="flush">{activeLead?.company}</h3>
            </div>
            <span className="pill">{classification}</span>
          </div>
          <div className="priority-list">
            <span className="status status--info">{activeLead?.origin}</span>
            <span className="status status--success">Score {activeLead?.score}</span>
            <span className="status status--warn">{activeLead?.status}</span>
          </div>
          <div className="citation-box">
            <strong>Resumo para o corretor</strong>
            <p>{handoffSummary}</p>
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
            {suggestedPaths.map((option) => (
              <div key={option.title} className="mini-record">
                <strong>{option.title}</strong>
                <span>{option.meta}</span>
                <small>{option.note}</small>
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

        <article className="card quote-wide">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Fila do corretor</p>
              <h3 className="flush">Repasses pendentes</h3>
            </div>
            <button className="btn" type="button" onClick={loadHandoffs}>Atualizar fila</button>
          </div>

          {queueState.message && (
            <p className={`handoff-queue-message handoff-queue-message--${queueState.status}`}>
              {queueState.message}
            </p>
          )}

          <div className="handoff-queue">
            {handoffs.map((handoff) => (
              <article key={handoff.id} className="handoff-card">
                <div className="toolbar toolbar-between">
                  <div>
                    <strong>{handoff.company}</strong>
                    <p>{handoff.region} · {handoff.estimatedLives} vidas · {handoff.urgency}</p>
                  </div>
                  <span className={`status ${getStatusClass(handoff.status)}`}>{formatHandoffStatus(handoff.status)}</span>
                </div>
                <p className="handoff-card__summary">{handoff.summary}</p>
                <div className="handoff-card__meta">
                  <span>{handoff.classification}</span>
                  <span>Tabela: {handoff.tableConfirmationStatus === 'pending' ? 'confirmar' : handoff.tableConfirmationStatus}</span>
                  <span>{formatDateTime(handoff.createdAt)}</span>
                </div>
                <div className="approval-panel">
                  <button className="btn" type="button" onClick={() => changeHandoffStatus(handoff.id, 'assigned')}>Assumir</button>
                  <button className="btn" type="button" onClick={() => changeHandoffStatus(handoff.id, 'in_progress')}>Em andamento</button>
                  <button className="btn btn--primary" type="button" onClick={() => changeHandoffStatus(handoff.id, 'completed')}>Concluir</button>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </ProductShell>
  );
}

function formatHandoffStatus(status) {
  const labels = {
    pending: 'Pendente',
    assigned: 'Assumido',
    in_progress: 'Em andamento',
    completed: 'Concluido',
    canceled: 'Cancelado',
  };

  return labels[status] || status;
}

function getStatusClass(status) {
  if (status === 'completed') return 'status--success';
  if (status === 'pending') return 'status--warn';
  if (status === 'canceled') return 'status--danger';
  return 'status--info';
}

function formatDateTime(value) {
  if (!value) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
