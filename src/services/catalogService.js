import { planCatalog, priceTables } from '../data/mockData.js';
import { supabase } from '../lib/supabaseClient.js';

export function listPlanCatalog() {
  return planCatalog;
}

export async function fetchPlanCatalog() {
  if (!supabase) return planCatalog;

  const { data, error } = await supabase
    .from('health_plans')
    .select('id, product_name, ans_register, segment, contract_type, region_scope, network_summary, copay_rule, eligibility_summary, status, confidence_level, operators(name), administrators(name)')
    .order('product_name');

  if (error || !data || data.length === 0) {
    console.warn('Using mock plan catalog after Supabase error:', error?.message);
    return planCatalog;
  }

  return data.map((plan) => ({
    id: plan.id,
    operator: plan.operators?.name || 'Operadora não informada',
    administrator: plan.administrators?.name || 'Administradora não informada',
    product: plan.product_name,
    ansRegister: plan.ans_register,
    segment: plan.segment,
    contractType: plan.contract_type,
    region: plan.region_scope,
    network: plan.network_summary,
    lives: plan.eligibility_summary,
    copay: plan.copay_rule,
    status: plan.status === 'active' ? 'Ativo' : 'Em validação',
    confidence: plan.confidence_level === 'high' ? 'Alta' : 'Média',
  }));
}

export function getPlansByIds(ids) {
  return planCatalog.filter((plan) => ids.includes(plan.id));
}

export function listPriceTables() {
  return priceTables;
}

export async function fetchPriceTables() {
  if (!supabase) return priceTables;

  const { data, error } = await supabase
    .from('price_tables')
    .select('id, region, lives_min, lives_max, valid_from, valid_until, source_label, status, operators(name), administrators(name), health_plans(product_name), price_table_rows(age_band, accommodation, monthly_price)')
    .order('valid_from', { ascending: false });

  if (error || !data || data.length === 0) {
    console.warn('Using mock price tables after Supabase error:', error?.message);
    return priceTables;
  }

  return data.map((table) => ({
    id: table.id,
    operator: table.operators?.name || 'Operadora não informada',
    administrator: table.administrators?.name || 'Administradora não informada',
    product: table.health_plans?.product_name || 'Produto não informado',
    region: table.region,
    validity: `${formatDate(table.valid_from)} a ${formatDate(table.valid_until)}`,
    livesRange: `${table.lives_min || 0} a ${table.lives_max || 'N'} vidas`,
    status: table.status === 'active' ? 'Vigente' : 'Revisar',
    source: table.source_label,
    updatedAt: 'Supabase',
    rows: normalizePriceRows(table.price_table_rows || []),
  }));
}

export function getPriceTableById(id) {
  return priceTables.find((table) => table.id === id) || priceTables[0];
}

export function getTablesForPlans(plans) {
  return priceTables.filter((table) => plans.some((plan) => plan.product === table.product || plan.operator === table.operator));
}

function normalizePriceRows(rows) {
  const byAge = new Map();
  rows.forEach((row) => {
    const current = byAge.get(row.age_band) || [row.age_band, 'R$ 0,00', 'R$ 0,00'];
    if (row.accommodation === 'enfermaria') current[1] = formatCurrency(row.monthly_price);
    if (row.accommodation === 'apartamento') current[2] = formatCurrency(row.monthly_price);
    byAge.set(row.age_band, current);
  });
  return Array.from(byAge.values());
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return 'sem data';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}
