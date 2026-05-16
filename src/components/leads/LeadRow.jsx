export default function LeadRow({ company, detail, score }) {
  return (
    <div className="lead-row">
      <div><strong>{company}</strong><small>{detail}</small></div>
      <span className="score">{score}</span>
    </div>
  );
}
