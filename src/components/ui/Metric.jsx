export default function Metric({ value, label }) {
  return <article className="card metric"><strong>{value}</strong><span>{label}</span></article>;
}
