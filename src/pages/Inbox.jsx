import { useEffect, useState } from 'react';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import {
  claimConversation,
  fetchConversationMessages,
  fetchConversations,
  listConversationMessages,
  listConversations,
  sendConversationMessage,
} from '../services/crmService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Inbox({ path, navigate }) {
  const initialConversations = listConversations();
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(initialConversations[0]?.id || '');
  const [messages, setMessages] = useState(listConversationMessages());
  const [loadState, setLoadState] = useState({ status: 'loading', message: '' });
  const [draft, setDraft] = useState('');
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation?.id) loadMessages(activeConversation.id);
  }, [activeConversation?.id]);

  async function loadConversations() {
    setLoadState({ status: 'loading', message: 'Carregando conversas...' });

    try {
      const records = await fetchConversations();
      setConversations(records);
      setActiveConversationId((current) => current || records[0]?.id || '');
      setLoadState({ status: 'ready', message: records.length === 0 ? 'Nenhuma conversa encontrada.' : '' });
    } catch (error) {
      const fallback = listConversations();
      setConversations(fallback);
      setActiveConversationId(fallback[0]?.id || '');
      setLoadState({ status: 'fallback', message: `Inbox em modo demo: ${error.message}` });
    }
  }

  async function loadMessages(conversationId) {
    try {
      const records = await fetchConversationMessages(conversationId);
      setMessages(records.length > 0 ? records : listConversationMessages());
    } catch (error) {
      setMessages(listConversationMessages());
      setLoadState({ status: 'fallback', message: `Mensagens em modo demo: ${error.message}` });
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim()) return;

    const text = draft.trim();
    const optimisticMessage = {
      id: `pending-${Date.now()}`,
      from: 'agent',
      text,
      status: 'sending',
    };

    setDraft('');
    setMessages((current) => [...current, optimisticMessage]);

    try {
      const savedMessage = await sendConversationMessage(activeConversation, text);
      setMessages((current) => current.map((message) => (
        message.id === optimisticMessage.id ? savedMessage : message
      )));
      setLoadState({
        status: 'ready',
        message: savedMessage.mode === 'mock' ? 'Mensagem simulada no modo demo.' : 'Mensagem registrada no historico.',
      });
    } catch (error) {
      setMessages((current) => current.map((message) => (
        message.id === optimisticMessage.id ? { ...message, status: 'failed' } : message
      )));
      setLoadState({ status: 'fallback', message: `Nao foi possivel registrar a mensagem: ${error.message}` });
    }
  }

  async function handleClaimConversation() {
    if (!activeConversation) return;

    setConversations((current) => current.map((conversation) => (
      conversation.id === activeConversation.id
        ? { ...conversation, assignedToConsultant: true, status: 'success' }
        : conversation
    )));

    try {
      const result = await claimConversation(activeConversation.id);
      setLoadState({
        status: 'ready',
        message: result.mode === 'mock' ? 'Conversa assumida no modo demo.' : 'Conversa assumida pelo corretor.',
      });
    } catch (error) {
      setLoadState({ status: 'fallback', message: `Nao foi possivel assumir a conversa: ${error.message}` });
      await loadConversations();
    }
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Atendimento multiagente"
        title="Inbox de leads"
        subtitle="Conversas de WhatsApp, Instagram e Google com resumo e proxima acao."
        actions={[
          <select key="channel" className="select" aria-label="Canal"><option>Todos os canais</option><option>WhatsApp</option><option>Instagram</option><option>Google</option></select>,
          <button key="refresh" className="btn" type="button" onClick={loadConversations}>Atualizar</button>,
          <button key="claim" className="btn btn--primary" type="button" onClick={handleClaimConversation}>Assumir conversa</button>,
        ]}
      />

      {loadState.message && (
        <section className={`handoff-notice handoff-notice--${loadState.status}`} role="status">
          {loadState.message}
        </section>
      )}

      <section className="split">
        <aside className="list-panel" aria-label="Conversas">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`message-card inbox-card ${conversation.id === activeConversation?.id ? 'is-active' : ''}`}
              type="button"
              onClick={() => setActiveConversationId(conversation.id)}
            >
              <div className="toolbar toolbar-between">
                <strong>{conversation.company}</strong>
                <span className={`status status--${conversation.status}`}>{conversation.score}</span>
              </div>
              <p className="muted">{conversation.channel} · {conversation.summary}</p>
              <small>{conversation.assignedToConsultant ? 'Com corretor' : 'Aguardando assumir'}</small>
            </button>
          ))}
        </aside>

        <article className="card">
          <div className="toolbar toolbar-between">
            <div>
              <h3 className="flush">{activeConversation?.company}</h3>
              <p className="muted compact-text">{activeConversation?.meta}</p>
            </div>
            <span className="pill">{activeConversation?.assignedToConsultant ? 'Corretor assumiu' : 'Agente: qualificacao'}</span>
          </div>

          <div className="conversation message-stream">
            {messages.map((message) => (
              <div key={message.id} className={`bubble ${message.from === 'agent' ? 'bubble--agent' : ''}`}>
                {message.text}
                {message.status === 'failed' && <small className="bubble-status">Falha ao registrar</small>}
              </div>
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
