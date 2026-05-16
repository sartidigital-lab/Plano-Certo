import AppLink from '../components/navigation/AppLink.jsx';
import Brand from '../components/navigation/Brand.jsx';

const navItems = [
  ['Landing', '/landing'],
  ['Dashboard', '/dashboard'],
  ['Inbox', '/inbox'],
  ['Outbound', '/outbound'],
  ['Pipeline', '/pipeline'],
];

export default function MarketingShell({ navigate, children }) {
  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Brand navigate={navigate} />
          <nav className="nav" aria-label="Superficies">
            {navItems.map(([label, to]) => (
              <AppLink key={to} to={to} navigate={navigate}>{label}</AppLink>
            ))}
          </nav>
          <AppLink to="/dashboard" navigate={navigate} className="btn btn--primary">Abrir produto</AppLink>
        </div>
      </header>
      {children}
    </>
  );
}
