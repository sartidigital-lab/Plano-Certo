import { conversations, leadProfiles, leads, pipelineColumns } from '../data/mockData.js';
import { supabase } from '../lib/supabaseClient.js';

export function listLeads() {
  return leads;
}

export async function fetchLeads() {
  if (!supabase) return leads;

  const { data, error } = await supabase
    .from('leads')
    .select('id, company_name, region, segment, source_channel, score, score_band, status, pipeline_stage, tags, created_at')
    .order('score', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) {
    console.warn('Using mock leads after Supabase error:', error?.message);
    return leads;
  }

  return data.map((lead) => ({
    id: lead.id,
    company: lead.company_name || 'Empresa sem nome',
    origin: [lead.source_channel, lead.region].filter(Boolean).join(' · ') || 'Origem nao informada',
    lives: extractLives(lead.tags) || normalizeSegment(lead.segment),
    status: normalizeLeadStatus(lead.status, lead.pipeline_stage, lead.score_band),
    score: lead.score || 0,
  }));
}

export function listLeadProfiles() {
  return leadProfiles;
}

export function getLeadProfileById(id) {
  return leadProfiles.find((lead) => lead.id === id) || leadProfiles[0];
}

export function listConversations() {
  return conversations;
}

export function listPipelineColumns() {
  return pipelineColumns;
}

function extractLives(tags) {
  if (!Array.isArray(tags)) return null;
  const match = tags.find((tag) => /\d+\s*vidas?/i.test(tag));
  return match ? match.replace(/[^\d]/g, '') || match : null;
}

function normalizeSegment(segment) {
  if (!segment) return 'N/D';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function normalizeLeadStatus(status, pipelineStage, scoreBand) {
  if (scoreBand === 'A' || Number(scoreBand) >= 85) return 'Quente';
  if (pipelineStage && pipelineStage !== 'Novo Lead') return pipelineStage;
  if (status === 'new') return 'Novo';
  if (status === 'qualified') return 'Quente';
  if (status === 'nurture') return 'Nutrir';
  return status || 'Novo';
}
