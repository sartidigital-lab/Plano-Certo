import LeadList from '../components/leads/LeadList.jsx';
import AppLink from '../components/navigation/AppLink.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Widgets({ path, navigate }) {
  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop eyebrow="Atalhos nativos" title="Widgets comerciais" subtitle="Blocos compactos para acompanhar urgências fora do app." />
      <section className="widget-grid">
        <article className="widget widget--small">
          <span className="pill">Agora</span>
          <h3>9 aprovações</h3>
          <p className="muted">Abordagens outbound prontas para envio.</p>
        </article>
        <article className="widget widget--medium">
          <span className="pill">Fila quente</span>
          <LeadList />
        </article>
        <article className="widget widget--lock">
          <span className="pill">SLA crítico</span>
          <h3>Ferrovia Norte</h3>
          <p>118 vidas · corretor Rafael</p>
          <AppLink to="/inbox" navigate={navigate} className="btn widget-button">Ver resumo</AppLink>
        </article>
      </section>
    </ProductShell>
  );
}
