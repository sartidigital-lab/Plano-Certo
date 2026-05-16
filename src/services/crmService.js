import { conversations, leadProfiles, leads, pipelineColumns } from '../data/mockData.js';

export function listLeads() {
  return leads;
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
