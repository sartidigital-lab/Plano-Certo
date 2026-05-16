import LeadRow from '../components/leads/LeadRow.jsx';
import AppLink from '../components/navigation/AppLink.jsx';

export default function MobileAndroid({ navigate }) {
  return (
    <main className="mobile-frame">
      <div className="android-status"><span>14:22</span><span>Plano Certo</span></div>
      <section className="mobile-screen">
        <p className="eyebrow">Fila do corretor</p>
        <h2>Próximas ações</h2>
        <div className="lead-list">
          <LeadRow company="Clinica Soma" detail="32 vidas · responder agora" score="92" />
          <LeadRow company="Logistica Vetta" detail="72 vidas · retorno 16h" score="81" />
          <LeadRow company="Studio Atlas" detail="14 vidas · nutrir" score="74" />
        </div>
      </section>
      <nav className="bottom-nav">
        {[
          ['Home', '/dashboard'],
          ['Inbox', '/inbox'],
          ['Outbound', '/outbound'],
          ['Pipeline', '/pipeline'],
        ].map(([label, to], index) => (
          <AppLink key={to} to={to} navigate={navigate} ariaCurrent={index === 0 ? 'page' : undefined}>{label}</AppLink>
        ))}
      </nav>
    </main>
  );
}
