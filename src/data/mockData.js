export const leads = [
  { company: 'Clinica Soma', origin: 'Google · SP', lives: '32', status: 'Quente', score: 92 },
  { company: 'Ferrovia Norte', origin: 'Outbound · PR', lives: '118', status: 'Atenção', score: 87 },
  { company: 'Studio Atlas', origin: 'Instagram · RJ', lives: '14', status: 'Nutrir', score: 74 },
  { company: 'Grupo Kairos', origin: 'WhatsApp · MG', lives: '46', status: 'Quente', score: 89 },
  { company: 'Logistica Vetta', origin: 'Google · SC', lives: '72', status: 'Atenção', score: 81 },
];

export const conversations = [
  { company: 'Clinica Soma', channel: 'WhatsApp', summary: 'quer cotar 32 vidas ate sexta.', score: 92, status: 'success' },
  { company: 'Logistica Vetta', channel: 'Google', summary: 'comparando rede credenciada.', score: 81, status: 'warn' },
  { company: 'Studio Atlas', channel: 'Instagram', summary: 'primeira contratacao PJ.', score: 74, status: 'info' },
];

export const pipelineColumns = [
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

export const launcherScreens = [
  ['Landing page', '/landing', 'Captação com prova de produto e CTA comercial.'],
  ['Dashboard do corretor', '/dashboard', 'Visão operacional dos leads e filas.'],
  ['Inbox multiagente', '/inbox', 'WhatsApp, Instagram e Google em uma fila.'],
  ['Agente outbound', '/outbound', 'Pesquisa de empresas e geração de abordagem.'],
  ['Pipeline de vendas', '/pipeline', 'Etapas do lead ao repasse.'],
  ['Android', '/mobile', 'Operação compacta para o corretor em campo.'],
  ['Desktop app', '/desktop', 'Console denso para gestor de corretora.'],
  ['Widgets nativos', '/widgets', 'Atalhos fora do app para urgências comerciais.'],
];

export const outboundSteps = [
  ['1. Google', 'Descobrir empresas', 'Busca por segmento, cidade e sinais de empresa com equipe: site, Google Business, vagas, endereço e telefone público.'],
  ['2. Enriquecimento', 'Montar contexto', 'Segmento, porte estimado, decisores prováveis, dor de plano de saúde e motivo real para contato.'],
  ['3. WhatsApp', 'Abordar com permissão', 'Mensagem curta, útil e auditável. O agente sugere, registra consentimento e encaminha respostas quentes.'],
  ['4. Corretor', 'Assumir oportunidade', 'Repasse com resumo, score, objeções, próxima ação e histórico completo da conversa.'],
];
