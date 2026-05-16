import { ansKnowledge } from '../data/mockData.js';

export function listAnsKnowledge() {
  return ansKnowledge;
}

export function getAnsKnowledgeByIds(ids) {
  return ansKnowledge.filter((doc) => ids.includes(doc.id));
}
