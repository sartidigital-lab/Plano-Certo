import LeadRow from '../leads/LeadRow.jsx';

export function LeadTriageCard({ prospects = [], onDiscard, onConvert }) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="toolbar toolbar-between">
        <h3 className="flush">Lista Google em triagem</h3>
        <span className="pill">{prospects.length} pendentes</span>
      </div>
      <div className="lead-list card-list" style={{ display: 'grid', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
        {prospects.length === 0 ? (
          <p className="muted" style={{ padding: '8px' }}>Nenhum prospect pendente.</p>
        ) : (
          prospects.map((prospect) => (
            <div key={prospect.id} className="lead-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', padding: '14px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)' }}>
              <div>
                <strong style={{ fontSize: '15px' }}>{prospect.name}</strong>
                <div className="muted" style={{ fontSize: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>📍 {prospect.city} · {prospect.state}</span>
                  <span>💼 {prospect.segment}</span>
                  {prospect.phone && <span>📞 {prospect.phone}</span>}
                  {prospect.website && <span>🌐 {prospect.website}</span>}
                </div>
              </div>
              <div className="toolbar" style={{ gap: '8px' }}>
                <button className="btn btn--primary" style={{ minHeight: '32px', fontSize: '12px', padding: '0 12px' }} onClick={() => onConvert(prospect)}>
                  Converter em Lead
                </button>
                <button className="btn" style={{ minHeight: '32px', fontSize: '12px', padding: '0 12px', color: 'var(--danger)', borderColor: 'var(--border)' }} onClick={() => onDiscard(prospect.id)}>
                  Descartar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

export function SequenceCard() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Sequência WhatsApp</h3>
        <span className="pill">3 toques</span>
      </div>
      <div className="sequence-list card-list">
        <div className="sequence-item"><strong>D0</strong><span>Contexto real + pergunta de permissão</span></div>
        <div className="sequence-item"><strong>D2</strong><span>Resumo útil: rede, reajuste, coparticipação</span></div>
        <div className="sequence-item"><strong>D5</strong><span>Encerramento elegante e opção de sair</span></div>
      </div>
    </article>
  );
}

export function GuardrailsCard() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Guardrails</h3>
        <span className="pill">LGPD</span>
      </div>
      <ul className="check-list">
        <li>Registrar fonte pública e justificativa do contato.</li>
        <li>Evitar disparo automatizado sem base legal ou aprovação.</li>
        <li>Parar sequência ao receber negativa, silêncio prolongado ou pedido de remoção.</li>
        <li>Entregar ao corretor apenas oportunidades com contexto verificável.</li>
      </ul>
    </article>
  );
}
