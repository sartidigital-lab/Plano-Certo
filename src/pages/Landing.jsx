import AppLink from '../components/navigation/AppLink.jsx';
import ProductShot from '../components/product/ProductShot.jsx';
import MarketingShell from '../layouts/MarketingShell.jsx';

export default function Landing({ navigate }) {
  return (
    <MarketingShell navigate={navigate}>
      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div>
              <p className="eyebrow">Plano Certo</p>
              <h1>Mais leads empresariais qualificados para corretores de saúde.</h1>
              <p className="lede">Agentes capturam intenção, qualificam empresas, resumem conversas e ajudam o corretor chegar no momento certo.</p>
              <div className="actions">
                <AppLink to="/outbound" navigate={navigate} className="btn btn--primary">Ver agente outbound</AppLink>
                <AppLink to="/dashboard" navigate={navigate} className="btn">Abrir dashboard</AppLink>
              </div>
            </div>
            <ProductShot />
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
