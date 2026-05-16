import AppLink from '../components/navigation/AppLink.jsx';
import Brand from '../components/navigation/Brand.jsx';
import { getRuntimeDataMode } from '../services/dataModeService.js';

const productNav = [
  ['Dashboard', '/dashboard', '42'],
  ['Inbox', '/inbox', '16'],
  ['Outbound', '/outbound', '9'],
  ['Pipeline', '/pipeline', '31'],
  ['Agentes', '/agentes', '4'],
  ['Lead 360', '/lead-360', '5'],
  ['Cotação', '/cotacao', '3'],
  ['Catálogo', '/catalogo', '24'],
  ['Tabelas', '/tabelas', '8'],
  ['Base ANS', '/ans', '36'],
  ['Widgets', '/widgets', '3'],
];

export default function ProductShell({ path, navigate, children }) {
  const dataMode = getRuntimeDataMode();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand navigate={navigate} />
        <nav className="side-nav" aria-label="Produto">
          {productNav.map(([label, to, count]) => (
            <AppLink key={to} to={to} navigate={navigate} ariaCurrent={path === to ? 'page' : undefined}>
              <span>{label}</span>
              <strong>{count}</strong>
            </AppLink>
          ))}
        </nav>
        <div className="card sidebar-note">
          <span className="pill">{dataMode.mode === 'supabase-configured' ? 'Supabase cfg' : 'Mock'}</span>
          <p className="muted">Prioridade para leads com mais de 70 pontos sem contato humano.</p>
        </div>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
}
