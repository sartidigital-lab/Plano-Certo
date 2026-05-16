(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initLeadFilter() {
    const input = $('[data-lead-filter]');
    const rows = $$('[data-lead-row]');
    if (!input || rows.length === 0) return;
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      rows.forEach((row) => {
        row.classList.toggle('hidden', !row.textContent.toLowerCase().includes(query));
      });
    });
  }

  function initStatusSelects() {
    $$('[data-status-select]').forEach((select) => {
      select.addEventListener('change', () => {
        const target = document.getElementById(select.dataset.statusSelect);
        if (!target) return;
        target.textContent = select.value;
        target.className = 'status ' + (select.value.includes('Quente') ? 'status--success' : select.value.includes('Atenção') ? 'status--warn' : 'status--info');
      });
    });
  }

  function initConversation() {
    const form = $('[data-message-form]');
    const input = $('[data-message-input]');
    const stream = $('[data-message-stream]');
    if (!form || !input || !stream) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      const bubble = document.createElement('div');
      bubble.className = 'bubble bubble--agent';
      bubble.textContent = value;
      stream.appendChild(bubble);
      input.value = '';
      stream.scrollTop = stream.scrollHeight;
    });
  }

  function initAgentGenerator() {
    const form = $('[data-agent-form]');
    const output = $('[data-agent-output]');
    const copy = $('[data-copy-agent]');
    if (!form || !output) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const company = $('[name="company"]', form).value || 'empresa-alvo';
      const segment = $('[name="segment"]', form).value || 'servicos';
      const size = $('[name="size"]', form).value || '50 vidas';
      const channel = $('[name="channel"]', form)?.value || 'WhatsApp';
      const signal = $('[name="signal"]', form)?.value.trim();
      const opener = channel === 'Ligacao assistida' ? 'Bom dia' : 'Ola';
      const signalText = signal ? ` Vi este sinal publico: ${signal}.` : '';
      output.textContent = `${opener}, ${company}.${signalText} Notei que empresas de ${segment} com cerca de ${size} costumam perder tempo comparando rede credenciada, reajuste e coparticipacao. Posso te enviar uma analise objetiva com 3 caminhos de plano empresarial?`;
    });
    copy?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(output.textContent.trim());
        copy.textContent = 'Copiado';
        setTimeout(() => { copy.textContent = 'Copiar abordagem'; }, 1400);
      } catch {
        copy.textContent = 'Selecione e copie';
      }
    });
  }

  function initPipeline() {
    const cards = $$('[data-pipeline-card]');
    const columns = $$('[data-pipeline-column]');
    if (!cards.length || !columns.length) return;
    cards.forEach((card) => {
      card.draggable = true;
      card.addEventListener('dragstart', () => card.classList.add('dragging'));
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
    });
    columns.forEach((column) => {
      column.addEventListener('dragover', (event) => event.preventDefault());
      column.addEventListener('drop', () => {
        const active = $('.dragging');
        if (active) column.appendChild(active);
      });
    });
  }

  function initLauncherPreview() {
    $$('[data-open-screen]').forEach((button) => {
      button.addEventListener('click', () => {
        window.location.href = button.dataset.openScreen;
      });
    });
  }

  initLeadFilter();
  initStatusSelects();
  initConversation();
  initAgentGenerator();
  initPipeline();
  initLauncherPreview();
})();
