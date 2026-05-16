import AppLink from './AppLink.jsx';

export default function Brand({ navigate }) {
  return (
    <AppLink to="/" navigate={navigate} className="brand" aria-label="Plano Certo">
      <span className="brand__mark">PC</span>
      <span>Plano Certo</span>
    </AppLink>
  );
}
