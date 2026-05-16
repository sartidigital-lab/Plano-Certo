import { useState } from 'react';
import { GuardrailsCard, LeadTriageCard, SequenceCard } from '../components/outbound/OutboundCards.jsx';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { listOutboundSteps } from '../services/agentService.js';
import ProductShell from '../layouts/ProductShell.jsx';

const defaultMessage = 'Ola, Clinica Soma. Vi que voces atendem empresas na regiao e parecem ter uma equipe em crescimento. Empresas de saude com 30 a 50 vidas costumam perder muito tempo comparando rede, reajuste e coparticipacao. Posso te enviar uma analise objetiva com 3 caminhos de plano empresarial?';

export default function Outbound({ path, navigate }) {
  const outboundSteps = listOutboundSteps();
  const [brief, setBrief] = useState({
    company: '',
    segment: '',
    size: '',
    channel: 'WhatsApp',
    signal: '',
  });
  const [message, setMessage] = useState(defaultMessage);
  const [copyLabel, setCopyLabel] = useState('Copiar');

  function updateBrief(field, value) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  function generateMessage(event) {
    event.preventDefault();
    const company = brief.company || 'empresa-alvo';
    const segment = brief.segment || 'serviços';
    const size = brief.size || '50 vidas';
    const opener = brief.channel === 'Ligação assistida' ? 'Bom dia' : 'Ola';
    const signal = brief.signal ? ` Vi este sinal publico: ${brief.signal}.` : '';
    setMessage(`${opener}, ${company}.${signal} Notei que empresas de ${segment} com cerca de ${size} costumam perder tempo comparando rede credenciada, reajuste e coparticipacao. Posso te enviar uma analise objetiva com 3 caminhos de plano empresarial?`);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyLabel('Copiado');
      setTimeout(() => setCopyLabel('Copiar'), 1400);
    } catch {
      setCopyLabel('Selecione e copie');
    }
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Outbound assistido"
        title="Google encontra. WhatsApp converte."
        subtitle="Estruture listas locais, sinais públicos, abordagens consultivas e follow-ups com controle humano."
        actions={[
          <button key="pause" className="btn">Pausar agente</button>,
          <button key="approve" className="btn btn--primary">Aprovar 9 abordagens</button>,
        ]}
      />
      <section className="kpi-row" aria-label="Indicadores do agente outbound">
        <Metric value="126" label="empresas mapeadas no Google" />
        <Metric value="41" label="com telefone validado" />
        <Metric value="9" label="prontas para aprovação" />
        <Metric value="18%" label="resposta em sequências WhatsApp" />
      </section>
      <section className="outbound-flow" aria-label="Fluxo outbound">
        {outboundSteps.map(([pill, title, text], index) => (
          <article key={pill} className={`flow-step ${index === 0 ? 'is-active' : ''}`}>
            <span className="pill">{pill}</span>
            <h3>{title}</h3>
            <p className="muted">{text}</p>
          </article>
        ))}
      </section>
      <section className="data-grid">
        <form className="card grid" onSubmit={generateMessage}>
          <div>
            <p className="eyebrow">Briefing do agente</p>
            <h3>Gerar abordagem consultiva</h3>
          </div>
          <input className="input" value={brief.company} onChange={(event) => updateBrief('company', event.target.value)} placeholder="Empresa alvo, e.g. Clinica Soma" aria-label="Empresa alvo" />
          <input className="input" value={brief.segment} onChange={(event) => updateBrief('segment', event.target.value)} placeholder="Segmento, e.g. clinicas odontologicas" aria-label="Segmento" />
          <input className="input" value={brief.size} onChange={(event) => updateBrief('size', event.target.value)} placeholder="Porte, e.g. 30 a 50 vidas" aria-label="Porte" />
          <select className="select" value={brief.channel} onChange={(event) => updateBrief('channel', event.target.value)} aria-label="Canal">
            <option>WhatsApp</option>
            <option>Ligação assistida</option>
            <option>Email comercial</option>
          </select>
          <textarea className="textarea" value={brief.signal} onChange={(event) => updateBrief('signal', event.target.value)} placeholder="Sinal encontrado: abriu nova unidade, tem 32 colaboradores, reclama de reajuste..." aria-label="Sinal comercial" />
          <button className="btn btn--primary" type="submit">Gerar abordagem</button>
        </form>
        <article className="card">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Mensagem sugerida</p>
              <h3 className="flush">Primeiro toque</h3>
            </div>
            <button className="btn" onClick={copyMessage}>{copyLabel}</button>
          </div>
          <p className="agent-output">{message}</p>
          <div className="approval-panel">
            <span className="status status--success">Seguro para revisar</span>
            <span className="status status--info">Sem promessa comercial</span>
            <span className="status status--warn">Checar opt-in antes do envio</span>
          </div>
        </article>
      </section>
      <section className="section section--tight">
        <div className="outbound-board">
          <LeadTriageCard />
          <SequenceCard />
          <GuardrailsCard />
        </div>
      </section>
    </ProductShell>
  );
}
