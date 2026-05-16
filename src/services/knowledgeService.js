import { ansKnowledge } from '../data/mockData.js';
import { supabase } from '../lib/supabaseClient.js';

export function listAnsKnowledge() {
  return ansKnowledge;
}

export async function fetchAnsKnowledge() {
  if (!supabase) return ansKnowledge;

  const { data, error } = await supabase
    .from('ans_documents')
    .select('id, title, document_type, source_url, version_label, status')
    .order('title');

  if (error || !data) {
    console.warn('Using mock ANS knowledge after Supabase error:', error?.message);
    return ansKnowledge;
  }

  return data.map((doc) => ({
    id: doc.id,
    title: doc.title,
    type: doc.document_type,
    source: doc.source_url ? 'ANS' : 'Fonte não informada',
    updatedAt: doc.version_label || 'Supabase',
    status: doc.status === 'active' ? 'Ativo' : 'Revisar',
    usage: 'Consultar antes de responder tópicos regulatórios.',
    excerpt: 'Documento carregado no Supabase. Trechos citáveis serão usados via chunks/RAG.',
  }));
}

export function getAnsKnowledgeByIds(ids) {
  return ansKnowledge.filter((doc) => ids.includes(doc.id));
}
