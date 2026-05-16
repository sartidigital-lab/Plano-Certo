import LeadRow from '../leads/LeadRow.jsx';

export function LeadTriageCard() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Lista Google em triagem</h3>
        <span className="pill">SP capital</span>
      </div>
      <div className="lead-list card-list">
        <LeadRow company="Clinica Soma" detail="Google Business ativo · 32 vidas estimadas · telefone publico" score="92" />
        <LeadRow company="Logistica Vetta" detail="Nova filial · 72 vidas estimadas · site com RH" score="84" />
        <LeadRow company="Studio Atlas" detail="Equipe em expansão · primeira contratação PJ provável" score="76" />
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
