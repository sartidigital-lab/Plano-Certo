import { useMemo, useState } from 'react';
import Metric from '../components/ui/Metric.jsx';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { ansKnowledge, planCatalog, priceTables, quoteScenarios } from '../data/mockData.js';
import ProductShell from '../layouts/ProductShell.jsx';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AssistedQuote({ path, navigate }) {
  const scenario = quoteScenarios[0];
  const [selectedTableId, setSelectedTableId] = useState(scenario.selectedTableIds[0]);
  const selectedTable = priceTables.find((table) => table.id === selectedTableId) || priceTables[0];
  const selectedPlans = planCatalog.filter((plan) => scenario.selectedPlanIds.includes(plan.id));

  const quoteRows = useMemo(() => {
    return scenario.ageMix.map(([age, count]) => {
      const priceRow = selectedTable.rows.find(([tableAge]) => tableAge === age) || selectedTable.rows[0];
      const wardValue = parseCurrency(priceRow[1]);
      const apartmentValue = parseCurrency(priceRow[2]);
      return {
        age,
        count,
        ward: wardValue,
        apartment: apartmentValue,
        wardTotal: wardValue * count,
        apartmentTotal: apartmentValue * count,
      };
    });
  }, [scenario.ageMix, selectedTable]);

  const wardTotal = quoteRows.reduce((sum, row) => sum + row.wardTotal, 0);
  const apartmentTotal = quoteRows.reduce((sum, row) => sum + row.apartmentTotal, 0);

  return (
    <ProductShell path={path} navigate={navigate}>
      <WorkspaceTop
        eyebrow="Cotação assistida"
        title="Cotação PME"
        subtitle="Simule valores com tabela vigente, mix de vidas, planos compatíveis e alertas de compliance."
        actions={[
          <select key="table" className="select" value={selectedTableId} onChange={(event) => setSelectedTableId(event.target.value)} aria-label="Selecionar tabela">
            {priceTables.map((table) => <option key={table.id} value={table.id}>{table.product} · {table.region}</option>)}
          </select>,
          <button key="proposal" className="btn btn--primary">Gerar resumo</button>,
        ]}
      />

      <section className="kpi-row">
        <Metric value={scenario.lives} label="vidas cotadas" />
        <Metric value={currencyFormatter.format(wardTotal)} label="total enfermaria" />
        <Metric value={currencyFormatter.format(apartmentTotal)} label="total apartamento" />
        <Metric value={selectedPlans.length} label="planos comparados" />
      </section>

      <section className="quote-layout">
        <article className="card">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Empresa</p>
              <h3 className="flush">{scenario.company}</h3>
            </div>
            <span className="pill">{scenario.region}</span>
          </div>
          <div className="priority-list">
            {scenario.priorities.map((priority) => <span key={priority} className="status status--info">{priority}</span>)}
          </div>
          <div className="quote-table">
            <div className="quote-head"><span>Faixa</span><span>Vidas</span><span>Enfermaria</span><span>Apartamento</span></div>
            {quoteRows.map((row) => (
              <div key={row.age} className="quote-row">
                <strong>{row.age}</strong>
                <span>{row.count}</span>
                <span>{currencyFormatter.format(row.wardTotal)}</span>
                <span>{currencyFormatter.format(row.apartmentTotal)}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="detail-panel">
          <div className="toolbar toolbar-between">
            <div>
              <p className="eyebrow">Tabela usada</p>
              <h3 className="flush">{selectedTable.product}</h3>
            </div>
            <span className={`status ${selectedTable.status === 'Vigente' ? 'status--success' : 'status--warn'}`}>{selectedTable.status}</span>
          </div>
          <dl className="detail-list">
            <div><dt>Operadora</dt><dd>{selectedTable.operator}</dd></div>
            <div><dt>Administradora</dt><dd>{selectedTable.administrator}</dd></div>
            <div><dt>Vigência</dt><dd>{selectedTable.validity}</dd></div>
            <div><dt>Origem</dt><dd>{selectedTable.source}</dd></div>
          </dl>
        </aside>

        <article className="card quote-wide">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Comparação comercial</h3>
            <span className="pill">Assistente</span>
          </div>
          <div className="mini-card-grid">
            {selectedPlans.map((plan) => (
              <div key={plan.id} className="mini-record">
                <strong>{plan.product}</strong>
                <span>{plan.operator} · {plan.copay}</span>
                <small>{plan.network}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card quote-wide">
          <div className="toolbar toolbar-between">
            <h3 className="flush">Regras para o agente</h3>
            <span className="pill">ANS + comercial</span>
          </div>
          <div className="stack-list">
            {ansKnowledge.slice(0, 3).map((doc) => (
              <div key={doc.id} className="stack-item">
                <strong>{doc.title}</strong>
                <span>{doc.excerpt}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </ProductShell>
  );
}

function parseCurrency(value) {
  return Number(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
}
