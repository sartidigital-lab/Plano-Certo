import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css_plano-certo.css';
import './react.css';

const routes = {
  '/': Home,
  '/landing': Landing,
  '/dashboard': Dashboard,
  '/inbox': Inbox,
  '/outbound': Outbound,
  '/pipeline': Pipeline,
  '/mobile': MobileAndroid,
  '/desktop': DesktopApp,
  '/widgets': Widgets,
};

const leads = [
  { company: 'Clinica Soma', origin: 'Google · SP', lives: '32', status: 'Quente', score: 92 },
  { company: 'Ferrovia Norte', origin: 'Outbound · PR', lives: '118', status: 'Atenção', score: 87 },
  { company: 'Studio Atlas', origin: 'Instagram · RJ', lives: '14', status: 'Nutrir', score: 74 },
  { company: 'Grupo Kairos', origin: 'WhatsApp · MG', lives: '46', status: 'Quente', score: 89 },
  { company: 'Logistica Vetta', origin: 'Google · SC', lives: '72', status: 'Atenção', score: 81 },
];

const conversations = [
  { company: 'Clinica Soma', channel: 'WhatsApp', summary: 'quer cotar 32 vidas ate sexta.', score: 92, status: 'success' },
  { company: 'Logistica Vetta', channel: 'Google', summary: 'comparando rede credenciada.', score: 81, status: 'warn' },
  { company: 'Studio Atlas', channel: 'Instagram', summary: 'primeira contratacao PJ.', score: 74, status: 'info' },
];

const pipelineColumns = [
  {
    title: 'Qualificado',
    meta: '2 empresas',
    cards: [
      { company: 'Studio Atlas', note: '14 vidas · precisa entender coparticipação', status: 'Nutrir', tone: 'info' },
      { company: 'Grupo Kairos', note: '46 vidas · decisão em 30 dias', status: 'Quente', tone: 'success' },
    ],
  },
  {
    title: 'Em cotação',
    meta: '5 empresas',
    cards: [
      { company: 'Clinica Soma', note: '32 vidas · rede Pinheiros e Osasco', status: 'Prioridade', tone: 'success' },
      { company: 'Logistica Vetta', note: '72 vidas · troca por reajuste', status: 'Atenção', tone: 'warn' },
    ],
  },
  {
    title: 'Proposta enviada',
    meta: '3 empresas',
    cards: [
      { company: 'Ferrovia Norte', note: '118 vidas · diretoria revisando', status: 'Retorno 16h', tone: 'warn' },
    ],
  },
  {
    title: 'Fechamento',
    meta: '2 empresas',
    cards: [
      { company: 'Rede Terra', note: '24 vidas · aguardando documentação', status: 'Assinatura', tone: 'success' },
    ],
  },
];

function App() {
  const [path, setPath] = useState(normalizePath(window.location.pathname));
  const Page = routes[path] || Home;

  function navigate(nextPath) {
    const normalized = normalizePath(nextPath);
    window.history.pushState({}, '', normalized === '/' ? '/' : normalized);
    setPath(normalized);
  }

  React.useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return <Page path={path} navigate={navigate} />;
}

function normalizePath(path) {
  const clean = path.replace(/\.html$/, '');
  if (clean === '/index') return '/';
  if (clean === '/mobile-android') return '/mobile';
  if (clean === '/desktop-app') return '/desktop';
  return clean || '/';
}

function AppLink({ to, navigate, children, className, ariaCurrent }) {
  return (
    <a
      href={to}
      className={className}
      aria-current={ariaCurrent}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function Brand({ navigate }) {
  return (
    <AppLink to="/" navigate={navigate} className="brand" aria-label="Plano Certo">
      <span className="brand__mark">PC</span>
      <span>Plano Certo</span>
    </AppLink>
  );
}

function MarketingShell({ navigate, children }) {
  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Brand navigate={navigate} />
          <nav className="nav" aria-label="Superficies">
            {[
              ['Landing', '/landing'],
              ['Dashboard', '/dashboard'],
              ['Inbox', '/inbox'],
              ['Outbound', '/outbound'],
              ['Pipeline', '/pipeline'],
            ].map(([label, to]) => (
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

function ProductShell({ path, navigate, children }) {
  const nav = [
    ['Dashboard', '/dashboard', '42'],
    ['Inbox', '/inbox', '16'],
    ['Outbound', '/outbound', '9'],
    ['Pipeline', '/pipeline', '31'],
    ['Widgets', '/widgets', '3'],
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand navigate={navigate} />
        <nav className="side-nav" aria-label="Produto">
          {nav.map(([label, to, count]) => (
            <AppLink key={to} to={to} navigate={navigate} ariaCurrent={path === to ? 'page' : undefined}>
              <span>{label}</span>
              <strong>{count}</strong>
            </AppLink>
          ))}
        </nav>
        <div className="card sidebar-note">
          <span className="pill">SLA</span>
          <p className="muted">Prioridade para leads com mais de 70 pontos sem contato humano.</p>
        </div>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
}

function WorkspaceTop({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="workspace__top">
      <div className="workspace__title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {actions ? <div className="toolbar">{actions}</div> : null}
    </div>
  );
}

function Home({ navigate }) {
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
              <h2>Superficies separadas para evoluir produto, operação e experiência comercial.</h2>
            </div>
            <div className="launcher-grid">
              {[
                ['Landing page', '/landing', 'Captação com prova de produto e CTA comercial.'],
                ['Dashboard do corretor', '/dashboard', 'Visão operacional dos leads e filas.'],
                ['Inbox multiagente', '/inbox', 'WhatsApp, Instagram e Google em uma fila.'],
                ['Agente outbound', '/outbound', 'Pesquisa de empresas e geração de abordagem.'],
                ['Pipeline de vendas', '/pipeline', 'Etapas do lead ao repasse.'],
                ['Android', '/mobile', 'Operação compacta para o corretor em campo.'],
                ['Desktop app', '/desktop', 'Console denso para gestor de corretora.'],
                ['Widgets nativos', '/widgets', 'Atalhos fora do app para urgências comerciais.'],
              ].map(([title, to, text]) => (
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

function ProductShot() {
  return (
    <div className="product-shot" aria-label="Previa do dashboard Plano Certo">
      <div className="shot-bar">
        <div className="dot-row"><span className="dot" /><span className="dot" /><span className="dot" /></div>
        plano-certo.app/corretor
      </div>
      <div className="shot-body">
        <aside className="mini-sidebar">
          <strong>Fila comercial</strong>
          <div className="mini-nav">
            <span className="active">Leads qualificados</span>
            <span>Agente outbound</span>
            <span>WhatsApp</span>
            <span>Pipeline</span>
          </div>
        </aside>
        <div className="shot-content">
          <div className="kpi-row shot-kpis">
            <Metric value="42" label="empresas triadas hoje" />
            <Metric value="18" label="repasses para corretores" />
          </div>
          <LeadList compact />
        </div>
      </div>
    </div>
  );
}

function Landing({ navigate }) {
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

function Dashboard({ path, navigate }) {
  const [filter, setFilter] = useState('');
  const [activeStatus, setActiveStatus] = useState('Quente');
  const visibleLeads = leads.filter((lead) => `${lead.company} ${lead.origin}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Operação de hoje"
        title="Dashboard do corretor"
        subtitle="Leads empresariais capturados, qualificados e prontos para repasse."
        actions={[
          <input key="filter" className="input" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar empresa, origem ou cidade" aria-label="Filtrar leads" />,
          <button key="button" className="btn btn--primary">Distribuir próximos 5</button>,
        ]}
      />
      <section className="kpi-row" aria-label="Indicadores">
        <Metric value="42" label="empresas qualificadas" />
        <Metric value="18" label="repasses para corretor" />
        <Metric value="27%" label="com reunião agendada" />
        <Metric value="11m" label="SLA médio de contato" />
      </section>
      <section className="data-grid">
        <div className="table-card">
          <div className="table-scroll">
            <div className="table-header"><span>Empresa</span><span>Origem</span><span>Vidas</span><span>Status</span><span>Score</span></div>
            {visibleLeads.map((lead, index) => (
              <div className="table-row" key={lead.company}>
                <strong>{lead.company}</strong>
                <span>{lead.origin}</span>
                <span>{lead.lives}</span>
                <span className={`status ${statusClass(index === 0 ? activeStatus : lead.status)}`}>{index === 0 ? activeStatus : lead.status}</span>
                <span className="score">{lead.score}</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="grid">
          <ChannelPerformance />
          <article className="card">
            <h3>Ajustar status do lead ativo</h3>
            <select className="select" value={activeStatus} onChange={(event) => setActiveStatus(event.target.value)} aria-label="Alterar status">
              <option>Quente</option>
              <option>Atenção</option>
              <option>Nutrir</option>
            </select>
          </article>
        </aside>
      </section>
    </ProductShell>
  );
}

function Inbox({ path, navigate }) {
  const [messages, setMessages] = useState([
    ['lead', 'Bom dia. Temos 32 colaboradores e queremos rever o plano atual.'],
    ['agent', 'Perfeito. Vocês têm operadora atual e alguma preferência de hospitais na região?'],
    ['lead', 'Hoje usamos Notredame, mas o reajuste veio alto. Precisamos de rede em Pinheiros e Osasco.'],
    ['agent', 'Entendi. Vou encaminhar para um corretor com experiência em PME e rede oeste de SP.'],
  ]);
  const [draft, setDraft] = useState('');

  function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((current) => [...current, ['agent', draft.trim()]]);
    setDraft('');
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Atendimento multiagente"
        title="Inbox de leads"
        subtitle="Conversas de WhatsApp, Instagram e Google com resumo e próxima ação."
        actions={[
          <select key="channel" className="select" aria-label="Canal"><option>Todos os canais</option><option>WhatsApp</option><option>Instagram</option><option>Google</option></select>,
          <button key="claim" className="btn btn--primary">Assumir conversa</button>,
        ]}
      />
      <section className="split">
        <aside className="list-panel" aria-label="Conversas">
          {conversations.map((conversation, index) => (
            <article key={conversation.company} className={`message-card ${index === 0 ? 'is-active' : ''}`}>
              <div className="toolbar toolbar-between"><strong>{conversation.company}</strong><span className={`status status--${conversation.status}`}>{conversation.score}</span></div>
              <p className="muted">{conversation.channel} · {conversation.summary}</p>
            </article>
          ))}
        </aside>
        <article className="card">
          <div className="toolbar toolbar-between">
            <div><h3 className="flush">Clinica Soma</h3><p className="muted compact-text">32 vidas · São Paulo · decisor financeiro</p></div>
            <span className="pill">Agente: qualificação</span>
          </div>
          <div className="conversation message-stream">
            {messages.map(([from, text], index) => (
              <div key={`${from}-${index}`} className={`bubble ${from === 'agent' ? 'bubble--agent' : ''}`}>{text}</div>
            ))}
          </div>
          <form className="composer" onSubmit={sendMessage}>
            <input className="input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Responder com contexto do agente" aria-label="Mensagem" />
            <button className="btn btn--primary" type="submit">Enviar</button>
          </form>
        </article>
      </section>
    </ProductShell>
  );
}

function Outbound({ path, navigate }) {
  const [brief, setBrief] = useState({
    company: '',
    segment: '',
    size: '',
    channel: 'WhatsApp',
    signal: '',
  });
  const [message, setMessage] = useState('Ola, Clinica Soma. Vi que voces atendem empresas na regiao e parecem ter uma equipe em crescimento. Empresas de saude com 30 a 50 vidas costumam perder muito tempo comparando rede, reajuste e coparticipacao. Posso te enviar uma analise objetiva com 3 caminhos de plano empresarial?');
  const [copyLabel, setCopyLabel] = useState('Copiar');

  function updateBrief(field, value) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  function generateMessage(event) {
    event.preventDefault();
    const company = brief.company || 'empresa-alvo';
    const segment = brief.segment || 'serviços';
    const size = brief.size || '50 vidas';
    const opener = brief.channel === 'Ligação assistida' ? 'Bom dia' : 'Ola';
    const signal = brief.signal ? ` Vi este sinal publico: ${brief.signal}.` : '';
    setMessage(`${opener}, ${company}.${signal} Notei que empresas de ${segment} com cerca de ${size} costumam perder tempo comparando rede credenciada, reajuste e coparticipacao. Posso te enviar uma analise objetiva com 3 caminhos de plano empresarial?`);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyLabel('Copiado');
      setTimeout(() => setCopyLabel('Copiar'), 1400);
    } catch {
      setCopyLabel('Selecione e copie');
    }
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Outbound assistido"
        title="Google encontra. WhatsApp converte."
        subtitle="Estruture listas locais, sinais públicos, abordagens consultivas e follow-ups com controle humano."
        actions={[
          <button key="pause" className="btn">Pausar agente</button>,
          <button key="approve" className="btn btn--primary">Aprovar 9 abordagens</button>,
        ]}
      />
      <section className="kpi-row" aria-label="Indicadores do agente outbound">
        <Metric value="126" label="empresas mapeadas no Google" />
        <Metric value="41" label="com telefone validado" />
        <Metric value="9" label="prontas para aprovação" />
        <Metric value="18%" label="resposta em sequências WhatsApp" />
      </section>
      <section className="outbound-flow" aria-label="Fluxo outbound">
        {[
          ['1. Google', 'Descobrir empresas', 'Busca por segmento, cidade e sinais de empresa com equipe: site, Google Business, vagas, endereço e telefone público.'],
          ['2. Enriquecimento', 'Montar contexto', 'Segmento, porte estimado, decisores prováveis, dor de plano de saúde e motivo real para contato.'],
          ['3. WhatsApp', 'Abordar com permissão', 'Mensagem curta, útil e auditável. O agente sugere, registra consentimento e encaminha respostas quentes.'],
          ['4. Corretor', 'Assumir oportunidade', 'Repasse com resumo, score, objeções, próxima ação e histórico completo da conversa.'],
        ].map(([pill, title, text], index) => (
          <article key={pill} className={`flow-step ${index === 0 ? 'is-active' : ''}`}>
            <span className="pill">{pill}</span>
            <h3>{title}</h3>
            <p className="muted">{text}</p>
          </article>
        ))}
      </section>
      <section className="data-grid">
        <form className="card grid" onSubmit={generateMessage}>
          <div>
            <p className="eyebrow">Briefing do agente</p>
            <h3>Gerar abordagem consultiva</h3>
          </div>
          <input className="input" value={brief.company} onChange={(event) => updateBrief('company', event.target.value)} placeholder="Empresa alvo, e.g. Clinica Soma" aria-label="Empresa alvo" />
          <input className="input" value={brief.segment} onChange={(event) => updateBrief('segment', event.target.value)} placeholder="Segmento, e.g. clinicas odontologicas" aria-label="Segmento" />
          <input className="input" value={brief.size} onChange={(event) => updateBrief('size', event.target.value)} placeholder="Porte, e.g. 30 a 50 vidas" aria-label="Porte" />
          <select className="select" value={brief.channel} onChange={(event) => updateBrief('channel', event.target.value)} aria-label="Canal">
            <option>WhatsApp</option>
            <option>Ligação assistida</option>
            <option>Email comercial</option>
          </select>
          <textarea className="textarea" value={brief.signal} onChange={(event) => updateBrief('signal', event.target.value)} placeholder="Sinal encontrado: abriu nova unidade, tem 32 colaboradores, reclama de reajuste..." aria-label="Sinal comercial" />
          <button className="btn btn--primary" type="submit">Gerar abordagem</button>
        </form>
        <article className="card">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Mensagem sugerida</p>
              <h3 className="flush">Primeiro toque</h3>
            </div>
            <button className="btn" onClick={copyMessage}>{copyLabel}</button>
          </div>
          <p className="agent-output">{message}</p>
          <div className="approval-panel">
            <span className="status status--success">Seguro para revisar</span>
            <span className="status status--info">Sem promessa comercial</span>
            <span className="status status--warn">Checar opt-in antes do envio</span>
          </div>
        </article>
      </section>
      <section className="section section--tight">
        <div className="outbound-board">
          <LeadTriageCard />
          <SequenceCard />
          <GuardrailsCard />
        </div>
      </section>
    </ProductShell>
  );
}

function Pipeline({ path, navigate }) {
  const [columns, setColumns] = useState(pipelineColumns);
  const [dragged, setDragged] = useState(null);

  function moveCard(targetColumnIndex) {
    if (!dragged) return;
    setColumns((current) => {
      const next = current.map((column) => ({ ...column, cards: [...column.cards] }));
      const [card] = next[dragged.columnIndex].cards.splice(dragged.cardIndex, 1);
      next[targetColumnIndex].cards.push(card);
      return next;
    });
    setDragged(null);
  }

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop eyebrow="Vendas PME" title="Pipeline de vendas" subtitle="Arraste oportunidades entre etapas para simular o acompanhamento comercial." actions={<button className="btn btn--primary">Nova oportunidade</button>} />
      <section className="kanban" aria-label="Pipeline">
        {columns.map((column, columnIndex) => (
          <div key={column.title} className="column" onDragOver={(event) => event.preventDefault()} onDrop={() => moveCard(columnIndex)}>
            <div className="column__head"><strong>{column.title}</strong><span>{column.meta}</span></div>
            {column.cards.map((card, cardIndex) => (
              <article
                key={card.company}
                className="pipeline-card"
                draggable
                onDragStart={() => setDragged({ columnIndex, cardIndex })}
              >
                <strong>{card.company}</strong>
                <p className="muted">{card.note}</p>
                <span className={`status status--${card.tone}`}>{card.status}</span>
              </article>
            ))}
          </div>
        ))}
      </section>
    </ProductShell>
  );
}

function MobileAndroid({ navigate }) {
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

function DesktopApp({ path, navigate }) {
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

function Widgets({ path, navigate }) {
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
          <LeadList compact />
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

function Metric({ value, label }) {
  return <article className="card metric"><strong>{value}</strong><span>{label}</span></article>;
}

function LeadList() {
  return (
    <div className="lead-list">
      <LeadRow company="Clinica Soma" detail="32 vidas · busca troca de operadora" score="92" />
      <LeadRow company="Ferrovia Norte" detail="118 vidas · cotação empresarial" score="87" />
      <LeadRow company="Studio Atlas" detail="14 vidas · primeiro plano PJ" score="74" />
    </div>
  );
}

function LeadRow({ company, detail, score }) {
  return <div className="lead-row"><div><strong>{company}</strong><small>{detail}</small></div><span className="score">{score}</span></div>;
}

function ChannelPerformance() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Performance por canal</h3>
        <span className="pill">7 dias</span>
      </div>
      <div className="chart" aria-label="Grafico de barras por canal">
        {[45, 78, 58, 92, 67, 84].map((height) => <span key={height} className="bar" style={{ height: `${height}%` }} />)}
      </div>
      <p className="muted chart-note">Google traz maior intenção; WhatsApp converte melhor quando o corretor responde até 15 minutos.</p>
    </article>
  );
}

function LeadTriageCard() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Lista Google em triagem</h3>
        <span className="pill">SP capital</span>
      </div>
      <div className="lead-list card-list">
        <LeadRow company="Clinica Soma" detail="Google Business ativo · 32 vidas estimadas · telefone publico" score="92" />
        <LeadRow company="Logistica Vetta" detail="Nova filial · 72 vidas estimadas · site com RH" score="84" />
        <LeadRow company="Studio Atlas" detail="Equipe em expansão · primeira contratação PJ provável" score="76" />
      </div>
    </article>
  );
}

function SequenceCard() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Sequência WhatsApp</h3>
        <span className="pill">3 toques</span>
      </div>
      <div className="sequence-list card-list">
        <div className="sequence-item"><strong>D0</strong><span>Contexto real + pergunta de permissão</span></div>
        <div className="sequence-item"><strong>D2</strong><span>Resumo útil: rede, reajuste, coparticipação</span></div>
        <div className="sequence-item"><strong>D5</strong><span>Encerramento elegante e opção de sair</span></div>
      </div>
    </article>
  );
}

function GuardrailsCard() {
  return (
    <article className="card">
      <div className="toolbar toolbar-between">
        <h3 className="flush">Guardrails</h3>
        <span className="pill">LGPD</span>
      </div>
      <ul className="check-list">
        <li>Registrar fonte pública e justificativa do contato.</li>
        <li>Evitar disparo automatizado sem base legal ou aprovação.</li>
        <li>Parar sequência ao receber negativa, silêncio prolongado ou pedido de remoção.</li>
        <li>Entregar ao corretor apenas oportunidades com contexto verificável.</li>
      </ul>
    </article>
  );
}

function statusClass(status) {
  if (status.includes('Quente')) return 'status--success';
  if (status.includes('Atenção')) return 'status--warn';
  return 'status--info';
}

createRoot(document.getElementById('root')).render(<App />);
