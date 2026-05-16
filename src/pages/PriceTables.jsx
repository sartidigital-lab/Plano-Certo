import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { priceTables } from '../data/mockData.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function PriceTables({ path, navigate }) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(priceTables[0].id);

  const filteredTables = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return priceTables;
    return priceTables.filter((table) => Object.values(table).flat().join(' ').toLowerCase().includes(term));
  }, [query]);

  const activeTable = priceTables.find((table) => table.id === activeId) || filteredTables[0] || priceTables[0];

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Comercial versionado"
        title="Tabelas de preço"
        subtitle="Vigências, regiões, faixas etárias e valores usados por cotação e agentes de venda."
        actions={[
          <input key="search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto, região ou administradora" aria-label="Buscar tabelas" />,
          <button key="upload" className="btn btn--primary">Importar tabela</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value={priceTables.length} label="tabelas carregadas" />
        <Metric value="2" label="vigentes" />
        <Metric value="1" label="aguardando revisão" />
        <Metric value="0" label="erros críticos" />
      </section>

      <section className="catalog-layout">
        <div className="table-card">
          <div className="table-scroll">
            <div className="price-header"><span>Tabela</span><span>Região</span><span>Vigência</span><span>Vidas</span><span>Status</span></div>
            {filteredTables.map((table) => (
              <button key={table.id} className={`price-row ${table.id === activeTable.id ? 'is-active' : ''}`} onClick={() => setActiveId(table.id)}>
                <strong>{table.product}</strong>
                <span>{table.region}</span>
                <span>{table.validity}</span>
                <span>{table.livesRange}</span>
                <span className={`status ${table.status === 'Vigente' ? 'status--success' : 'status--warn'}`}>{table.status}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="detail-panel">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Tabela ativa</p>
              <h3 className="flush">{activeTable.product}</h3>
            </div>
            <span className="pill">{activeTable.region}</span>
          </div>
          <dl className="detail-list">
            <div><dt>Operadora</dt><dd>{activeTable.operator}</dd></div>
            <div><dt>Administradora</dt><dd>{activeTable.administrator}</dd></div>
            <div><dt>Origem</dt><dd>{activeTable.source}</dd></div>
            <div><dt>Atualização</dt><dd>{activeTable.updatedAt}</dd></div>
          </dl>
          <div className="mini-price-table">
            <div className="mini-price-head"><span>Faixa</span><span>Enfermaria</span><span>Apartamento</span></div>
            {activeTable.rows.map(([age, ward, apartment]) => (
              <div key={age} className="mini-price-row"><strong>{age}</strong><span>{ward}</span><span>{apartment}</span></div>
            ))}
          </div>
          <div className="agent-readiness">
            <span className="status status--success">Cotável pelo agente</span>
            <span className="status status--info">Requer produto compatível</span>
          </div>
        </aside>
      </section>
    </ProductShell>
  );
}
