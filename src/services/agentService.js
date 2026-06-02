import { agentProfiles, agentReviewQueue, agentRuns, outboundSteps, voicePrinciples } from '../data/mockData.js';
import { supabase } from '../lib/supabaseClient.js';

export function listAgentProfiles() {
  return agentProfiles;
}

export async function fetchAgentProfiles() {
  if (!supabase) return agentProfiles;

  const { data, error } = await supabase
    .from('agent_profiles')
    .select('id, name, role, status, autonomy_level, tone_of_voice, humanization_score, agent_skills(skill_name), agent_guardrails(rule_text)')
    .order('name');

  if (error || !data || data.length === 0) {
    console.warn('Using mock agent profiles after Supabase error:', error?.message);
    return agentProfiles;
  }

  return data.map((agent) => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    status: agent.status === 'active' ? 'Ativo' : 'Revisão',
    tone: agent.tone_of_voice,
    autonomy: normalizeAutonomy(agent.autonomy_level),
    humanScore: agent.humanization_score,
    guardrails: (agent.agent_guardrails || []).map((guardrail) => guardrail.rule_text),
    skills: (agent.agent_skills || []).map((skill) => skill.skill_name),
  }));
}

export function listAgentReviewQueue() {
  return agentReviewQueue;
}

export function listAgentRuns() {
  return agentRuns;
}

export function listVoicePrinciples() {
  return voicePrinciples;
}

export function listOutboundSteps() {
  return outboundSteps;
}

function normalizeAutonomy(value) {
  if (value === 'high_review') return 'Alta para revisão';
  if (value === 'medium') return 'Média';
  return 'Baixa';
}

export async function fetchPendingApprovals() {
  if (!supabase) {
    return agentReviewQueue;
  }

  const { data, error } = await supabase
    .from('human_approvals')
    .select(`
      id,
      proposed_message,
      reason,
      status,
      created_at,
      leads (
        id,
        companies (
          trade_name
        )
      ),
      agent_runs (
        id,
        run_type,
        risk_level,
        agent_profiles (
          name
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching human approvals, using mock:', error.message);
    return agentReviewQueue;
  }

  return (data || []).map((app) => ({
    id: app.id,
    lead: app.leads?.companies?.trade_name || 'Empresa sem nome',
    agent: app.agent_runs?.agent_profiles?.name || 'Agente Outbound',
    type: app.agent_runs?.run_type || 'Abordagem Outbound',
    risk: app.agent_runs?.risk_level === 'high' ? 'Alto' : app.agent_runs?.risk_level === 'medium' ? 'Médio' : 'Baixo',
    status: app.status === 'pending' ? 'Aguardando aprovação' : app.status,
    suggested: app.proposed_message,
    whyHuman: app.reason || 'Necessita revisão manual de canal de primeiro toque.'
  }));
}

export async function updateApprovalStatus(id, status) {
  if (!supabase) {
    return { id, status, mode: 'mock' };
  }

  const dbStatus = status === 'Aprovado' ? 'approved' : status === 'Rejeitado' ? 'rejected' : 'adjust';

  const { data, error } = await supabase
    .from('human_approvals')
    .update({
      status: dbStatus,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, mode: 'supabase' };
}

export async function fetchAgentRuns() {
  if (!supabase) return agentRuns;

  const { data, error } = await supabase
    .from('agent_runs')
    .select('created_at, status, run_type, agent_profiles(name)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) {
    return agentRuns;
  }

  return data.map((run) => {
    const time = new Date(run.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const agentName = run.agent_profiles?.name || 'Agente';
    const action = run.run_type;
    const runStatus = run.status === 'blocked' ? 'Bloqueado' : run.status === 'completed' ? 'Concluído' : 'Revisão';
    return [time, agentName, action, runStatus];
  });
}


