import { useState } from 'react';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { listConversations } from '../services/crmService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Inbox({ path, navigate }) {
  const conversations = listConversations();
  const [messages, setMessages] = useState([
    ['lead', 'Bom dia. Temos 32 colaboradores e queremos rever o plano atual.'],
    ['agent', 'Perfeito. Vocês têm operadora atual e alguma preferência de hospitais na região?'],
    ['lead', 'Hoje usamos Notredame, mas o reajuste veio alto. Precisamos de rede em Pinheiros e Osasco.'],
    ['agent', 'Entendi. Vou encaminhar para um corretor com experiência em PME e rede oeste de SP.'],
  ]);
  const [draft, setDraft] = useState('');

  function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((current) => [...current, ['agent', draft.trim()]]);
    setDraft('');
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Atendimento multiagente"
        title="Inbox de leads"
        subtitle="Conversas de WhatsApp, Instagram e Google com resumo e próxima ação."
        actions={[
          <select key="channel" className="select" aria-label="Canal"><option>Todos os canais</option><option>WhatsApp</option><option>Instagram</option><option>Google</option></select>,
          <button key="claim" className="btn btn--primary">Assumir conversa</button>,
        ]}
      />
      <section className="split">
        <aside className="list-panel" aria-label="Conversas">
          {conversations.map((conversation, index) => (
            <article key={conversation.company} className={`message-card ${index === 0 ? 'is-active' : ''}`}>
              <div className="toolbar toolbar-between"><strong>{conversation.company}</strong><span className={`status status--${conversation.status}`}>{conversation.score}</span></div>
              <p className="muted">{conversation.channel} · {conversation.summary}</p>
            </article>
          ))}
        </aside>
        <article className="card">
          <div className="toolbar toolbar-between">
            <div><h3 className="flush">Clinica Soma</h3><p className="muted compact-text">32 vidas · São Paulo · decisor financeiro</p></div>
            <span className="pill">Agente: qualificação</span>
          </div>
          <div className="conversation message-stream">
            {messages.map(([from, text], index) => (
              <div key={`${from}-${index}`} className={`bubble ${from === 'agent' ? 'bubble--agent' : ''}`}>{text}</div>
            ))}
          </div>
          <form className="composer" onSubmit={sendMessage}>
            <input className="input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Responder com contexto do agente" aria-label="Mensagem" />
            <button className="btn btn--primary" type="submit">Enviar</button>
          </form>
        </article>
      </section>
    </ProductShell>
  );
}
