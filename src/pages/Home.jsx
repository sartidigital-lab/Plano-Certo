import AppLink from '../components/navigation/AppLink.jsx';
import ProductShot from '../components/product/ProductShot.jsx';
import MarketingShell from '../layouts/MarketingShell.jsx';
import { listLauncherScreens } from '../services/navigationService.js';

export default function Home({ navigate }) {
  const launcherScreens = listLauncherScreens();
  return (
    <MarketingShell navigate={navigate}>
      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div>
              <p className="eyebrow">SaaS para corretoras B2B</p>
              <h1>Agentes comerciais para transformar intenção em lead qualificado.</h1>
              <p className="lede">Plano Certo combina captação, qualificação, atendimento e pipeline para corretores de plano de saúde que vendem para empresas.</p>
              <div className="actions">
                <AppLink to="/landing" navigate={navigate} className="btn btn--primary">Ver landing</AppLink>
                <AppLink to="/dashboard" navigate={navigate} className="btn">Ver app web</AppLink>
              </div>
            </div>
            <ProductShot />
          </div>
        </section>
        <section className="section section--tight">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">App React</p>
              <h2>Superfícies separadas para evoluir produto, operação e experiência comercial.</h2>
            </div>
            <div className="launcher-grid">
              {launcherScreens.map(([title, to, text]) => (
                <AppLink key={to} to={to} navigate={navigate} className="screen-link">
                  <strong>{title}</strong>
                  <span>{text}</span>
                </AppLink>
              ))}
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
