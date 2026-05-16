import { planCatalog, priceTables } from '../data/mockData.js';

export function listPlanCatalog() {
  return planCatalog;
}

export function getPlansByIds(ids) {
  return planCatalog.filter((plan) => ids.includes(plan.id));
}

export function listPriceTables() {
  return priceTables;
}

export function getPriceTableById(id) {
  return priceTables.find((table) => table.id === id) || priceTables[0];
}

export function getTablesForPlans(plans) {
  return priceTables.filter((table) => plans.some((plan) => plan.product === table.product || plan.operator === table.operator));
}
