import { supabase } from '../lib/supabaseClient.js';
import { leads } from '../data/mockData.js';

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

export async function createBrokerHandoff({ lead, pendingQuestions = [], suggestedPaths = [], selectedTable } = {}) {
  if (!supabase) {
    return {
      mode: 'mock',
      id: `mock-handoff-${Date.now()}`,
      summary: buildBrokerHandoffSummary(lead),
    };
  }

  const payload = {
    lead_id: isUuid(lead?.id) ? lead.id : null,
    summary: buildBrokerHandoffSummary(lead),
    classification: classifyLeadForHandoff(lead),
    urgency: getHandoffUrgency(lead),
    region: inferRegion(lead),
    estimated_lives: String(lead?.lives || 'a confirmar'),
    pending_questions: pendingQuestions,
    suggested_paths: suggestedPaths.map((path) => ({
      title: path.title,
      meta: path.meta,
      note: path.note,
    })),
    price_confirmation_required: true,
    table_confirmation_status: 'pending',
    status: 'pending',
    created_by: 'agent',
    metadata: {
      source: 'frontend_handoff',
      lead_company: lead?.company || 'Empresa sem nome',
      lead_origin: lead?.origin || null,
      lead_score: lead?.score || null,
      selected_table: selectedTable
        ? {
            id: selectedTable.id,
            product: selectedTable.product,
            operator: selectedTable.operator,
            administrator: selectedTable.administrator,
            region: selectedTable.region,
          }
        : null,
    },
  };

  const { data, error } = await supabase
    .from('broker_handoffs')
    .insert(payload)
    .select('id, status, created_at')
    .single();

  if (error) throw error;

  return {
    mode: 'supabase',
    ...data,
    summary: payload.summary,
  };
}

export function listBrokerHandoffs() {
  return leads.slice(0, 3).map((lead, index) => ({
    id: `mock-handoff-${index + 1}`,
    company: lead.company,
    summary: buildBrokerHandoffSummary(lead),
    classification: classifyLeadForHandoff(lead),
    urgency: getHandoffUrgency(lead),
    region: inferRegion(lead),
    estimatedLives: String(lead.lives || 'a confirmar'),
    status: index === 0 ? 'pending' : 'assigned',
    tableConfirmationStatus: 'pending',
    pendingQuestions: buildPendingQuestions(lead),
    suggestedPaths: [],
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
  }));
}

export async function fetchBrokerHandoffs() {
  if (!supabase) return listBrokerHandoffs();

  const { data, error } = await supabase
    .from('broker_handoffs')
    .select('id, lead_id, summary, classification, urgency, region, estimated_lives, status, table_confirmation_status, pending_questions, suggested_paths, metadata, created_at, leads(company_name)')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || []).map(mapBrokerHandoff);
}

export async function updateBrokerHandoffStatus(id, status) {
  if (!supabase || String(id).startsWith('mock-')) {
    return { id, status, mode: 'mock' };
  }

  const { data, error } = await supabase
    .from('broker_handoffs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) throw error;
  return { ...data, mode: 'supabase' };
}

function mapBrokerHandoff(handoff) {
  return {
    id: handoff.id,
    leadId: handoff.lead_id,
    company: handoff.leads?.company_name || handoff.metadata?.lead_company || 'Lead sem empresa',
    summary: handoff.summary,
    classification: handoff.classification,
    urgency: handoff.urgency,
    region: handoff.region || 'Regiao a confirmar',
    estimatedLives: handoff.estimated_lives || 'a confirmar',
    status: handoff.status,
    tableConfirmationStatus: handoff.table_confirmation_status,
    pendingQuestions: handoff.pending_questions || [],
    suggestedPaths: handoff.suggested_paths || [],
    createdAt: handoff.created_at,
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}
