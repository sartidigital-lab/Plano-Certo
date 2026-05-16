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

  if (error || !data) {
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
