import { useState } from 'react';
import WorkspaceTop from '../components/workspace/WorkspaceTop.jsx';
import { listPipelineColumns } from '../services/crmService.js';
import ProductShell from '../layouts/ProductShell.jsx';

export default function Pipeline({ path, navigate }) {
  const [columns, setColumns] = useState(listPipelineColumns());
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
