import LeadRow from './LeadRow.jsx';

export default function LeadList() {
  return (
    <div className="lead-list">
      <LeadRow company="Clinica Soma" detail="32 vidas · busca troca de operadora" score="92" />
      <LeadRow company="Ferrovia Norte" detail="118 vidas · handoff para corretor" score="87" />
      <LeadRow company="Studio Atlas" detail="14 vidas · primeiro plano PJ" score="74" />
    </div>
  );
}
