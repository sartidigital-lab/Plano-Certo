import ChannelPerformance from '../components/charts/ChannelPerformance.jsx';
import { LeadTriageCard } from '../components/outbound/OutboundCards.jsx';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import ProductShell from '../layouts/ProductShell.jsx';

export default function DesktopApp({ path, navigate }) {
  return (
    <div className="desktop-window">
      <ProductShell path={path || '/dashboard'} navigate={navigate}>
        <WorkspaceTop eyebrow="Console gestor" title="Operação comercial" subtitle="Visão densa para acompanhar corretores, canais e repasses em tempo real." />
        <section className="kpi-row">
          <Metric value="9" label="abordagens aguardando aprovação" />
          <Metric value="16" label="conversas abertas" />
          <Metric value="31" label="oportunidades no pipeline" />
          <Metric value="R$ 84k" label="premio estimado" />
        </section>
        <section className="data-grid">
          <LeadTriageCard />
          <ChannelPerformance />
        </section>
      </ProductShell>
    </div>
  );
}
