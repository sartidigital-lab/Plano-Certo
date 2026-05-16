import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { ansKnowledge } from '../data/mockData.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function AnsBase({ path, navigate }) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(ansKnowledge[0].id);

  const filteredDocs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ansKnowledge;
    return ansKnowledge.filter((doc) => Object.values(doc).join(' ').toLowerCase().includes(term));
  }, [query]);

  const activeDoc = ansKnowledge.find((doc) => doc.id === activeId) || filteredDocs[0] || ansKnowledge[0];

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Conhecimento regulatório"
        title="Base ANS"
        subtitle="Normas, documentos e trechos citáveis para reduzir risco nas respostas dos agentes."
        actions={[
          <input key="search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cobertura, reajuste, carência ou registro" aria-label="Buscar Base ANS" />,
          <button key="sync" className="btn btn--primary">Sincronizar fontes</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value={ansKnowledge.length} label="documentos mockados" />
        <Metric value="3" label="prontos para uso" />
        <Metric value="1" label="em revisão" />
        <Metric value="100%" label="respostas exigem fonte" />
      </section>

      <section className="catalog-layout">
        <div className="knowledge-list">
          {filteredDocs.map((doc) => (
            <button key={doc.id} className={`knowledge-card ${doc.id === activeDoc.id ? 'is-active' : ''}`} onClick={() => setActiveId(doc.id)}>
              <div className="toolbar toolbar-between">
                <strong>{doc.title}</strong>
                <span className={`status ${doc.status === 'Ativo' ? 'status--success' : 'status--warn'}`}>{doc.status}</span>
              </div>
              <p className="muted">{doc.type} · {doc.source}</p>
            </button>
          ))}
        </div>

        <aside className="detail-panel">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Documento selecionado</p>
              <h3 className="flush">{activeDoc.title}</h3>
            </div>
            <span className="pill">{activeDoc.type}</span>
          </div>
          <dl className="detail-list">
            <div><dt>Fonte</dt><dd>{activeDoc.source}</dd></div>
            <div><dt>Atualização</dt><dd>{activeDoc.updatedAt}</dd></div>
            <div><dt>Uso pelo agente</dt><dd>{activeDoc.usage}</dd></div>
          </dl>
          <div className="citation-box">
            <span className="pill">Trecho operacional</span>
            <p>{activeDoc.excerpt}</p>
          </div>
          <div className="agent-readiness">
            <span className="status status--info">Responder com citação</span>
            <span className="status status--warn">Bloquear promessa sem fonte</span>
          </div>
        </aside>
      </section>
    </ProductShell>
  );
}
