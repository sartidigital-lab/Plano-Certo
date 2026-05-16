import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import { fetchAgentProfiles, listAgentProfiles, listAgentReviewQueue, listAgentRuns, listVoicePrinciples } from '../services/agentService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function AgentConsole({ path, navigate }) {
  const { data: agentProfiles, status } = useAsyncResource(fetchAgentProfiles, listAgentProfiles(), []);
  const agentRuns = listAgentRuns();
  const voicePrinciples = listVoicePrinciples();
  const [activeAgentId, setActiveAgentId] = useState(agentProfiles[0]?.id || '');
  const [reviews, setReviews] = useState(listAgentReviewQueue());
  const activeAgent = useMemo(
    () => agentProfiles.find((agent) => agent.id === activeAgentId) || agentProfiles[0],
    [activeAgentId],
  );

  function updateReview(reviewId, status) {
    setReviews((current) => current.map((review) => review.id === reviewId ? { ...review, status } : review));
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Governança de IA"
        title="Console dos agentes"
        subtitle="Controle tom de voz, autonomia, revisões humanas e qualidade das respostas comerciais."
        actions={[
          <button key="pause" className="btn">Pausar automações</button>,
          <button key="publish" className="btn btn--primary">Publicar diretrizes</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value="4" label="agentes configurados" />
        <Metric value="89" label="score médio de humanização" />
        <Metric value={reviews.length} label="respostas em revisão" />
        <Metric value="1" label="bloqueio compliance hoje" />
      </section>

      <section className="agent-console-grid">
        <aside className="agent-list">
          {agentProfiles.map((agent) => (
            <button key={agent.id} className={`agent-console-card ${agent.id === activeAgentId ? 'is-active' : ''}`} onClick={() => setActiveAgentId(agent.id)}>
              <div className="toolbar toolbar-between">
                <strong>{agent.name}</strong>
                <span className={`status ${agent.status === 'Ativo' ? 'status--success' : 'status--warn'}`}>{agent.status}</span>
              </div>
              <p className="muted">{agent.role}</p>
            </button>
          ))}
        </aside>

        <article className="detail-panel">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Agente selecionado</p>
              <h3 className="flush">{activeAgent.name}</h3>
            </div>
            <span className="pill">{status === 'loading' ? 'Carregando' : activeAgent.autonomy}</span>
          </div>
          <dl className="detail-list">
            <div><dt>Tom de voz</dt><dd>{activeAgent.tone}</dd></div>
            <div><dt>Função</dt><dd>{activeAgent.role}</dd></div>
            <div><dt>Humanização</dt><dd>{activeAgent.humanScore}/100</dd></div>
          </dl>
          <div className="agent-skill-grid">
            {activeAgent.skills.map((skill) => <span key={skill} className="status status--info">{skill}</span>)}
          </div>
          <div className="guardrail-box">
            <span className="pill">Guardrails</span>
            <ul>
              {activeAgent.guardrails.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}
            </ul>
          </div>
        </article>

        <article className="card agent-console-wide">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Fila de revisão humana</h3>
            <span className="pill">Aprovação antes do envio</span>
          </div>
          <div className="review-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="toolbar toolbar-between">
                  <div>
                    <strong>{review.lead}</strong>
                    <p className="muted compact-text">{review.agent} · {review.type}</p>
                  </div>
                  <span className={`status ${review.risk === 'Alto' ? 'status--warn' : 'status--info'}`}>Risco {review.risk}</span>
                </div>
                <p className="review-message">{review.suggested}</p>
                <p className="muted">{review.whyHuman}</p>
                <div className="toolbar">
                  <button className="btn btn--primary" onClick={() => updateReview(review.id, 'Aprovado')}>Aprovar</button>
                  <button className="btn" onClick={() => updateReview(review.id, 'Reescrever')}>Pedir ajuste</button>
                  <span className="status status--success">{review.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Linguagem humanizada</h3>
            <span className="pill">Manual de voz</span>
          </div>
          <ul className="voice-list">
            {voicePrinciples.map((principle) => <li key={principle}>{principle}</li>)}
          </ul>
        </article>

        <article className="card">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Runs recentes</h3>
            <span className="pill">Auditoria</span>
          </div>
          <div className="run-list">
            {agentRuns.map(([time, agent, action, status]) => (
              <div key={`${time}-${agent}`} className="run-item">
                <strong>{time}</strong>
                <span>{agent}</span>
                <p>{action}</p>
                <em>{status}</em>
              </div>
            ))}
          </div>
        </article>
      </section>
    </ProductShell>
  );
}
