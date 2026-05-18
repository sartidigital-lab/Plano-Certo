export function classifyLeadForHandoff(lead) {
  const score = Number(lead?.score || 0);
  if (score >= 90) return 'Prioridade alta';
  if (score >= 75) return 'Prioridade media';
  return 'Nutrir';
}

export function getHandoffUrgency(lead) {
  const text = `${lead?.status || ''} ${lead?.origin || ''}`.toLowerCase();
  if (Number(lead?.score || 0) >= 90 || text.includes('quente')) return 'Hoje';
  if (text.includes('atencao') || text.includes('atenção')) return '24h';
  return 'Nutrir';
}

export function inferRegion(lead) {
  const origin = lead?.origin || '';
  const region = origin.split('·').map((part) => part.trim()).filter(Boolean).at(-1);
  return region || 'Regiao a confirmar';
}

export function buildPendingQuestions(lead) {
  return [
    `Confirmar UF/regiao de contratacao: ${inferRegion(lead)}.`,
    `Validar quantidade de vidas: ${lead?.lives || 'a confirmar'}.`,
    'Checar rede indispensavel, dependentes e contrato atual.',
    'Confirmar tabela vigente por operadora/regiao com o corretor antes de proposta.',
  ];
}

export function buildSuggestedPaths(lead, plans = []) {
  if (plans.length > 0) {
    return plans.slice(0, 3).map((plan) => ({
      title: plan.product,
      meta: `${plan.operator} · ${plan.region}`,
      note: 'Usar apenas como caminho possivel; corretor confirma disponibilidade, rede e tabela.',
    }));
  }

  return [
    {
      title: 'Mapear operadoras por regiao',
      meta: inferRegion(lead),
      note: 'Corretor valida quais operadoras e administradoras atendem a regiao.',
    },
    {
      title: 'Confirmar perfil de vidas',
      meta: `${lead?.lives || 'N/D'} vidas`,
      note: 'Antes de proposta, confirmar titulares, dependentes e faixas etarias.',
    },
  ];
}

export function buildBrokerHandoffSummary(lead) {
  return [
    `Lead: ${lead?.company || 'Empresa sem nome'}.`,
    `Regiao/UF: ${inferRegion(lead)}.`,
    `Vidas estimadas: ${lead?.lives || 'a confirmar'}.`,
    `Classificacao: ${classifyLeadForHandoff(lead)} com score ${lead?.score || 0}.`,
    `Urgencia sugerida: ${getHandoffUrgency(lead)}.`,
    'Corretor deve confirmar operadoras, rede, tabela regional vigente e condicoes comerciais antes de qualquer proposta.',
  ].join(' ');
}
