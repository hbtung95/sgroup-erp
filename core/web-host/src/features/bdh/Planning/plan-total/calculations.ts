import { PLAN_KEYS } from './constants';
import type { Plan, PlanTotalMetrics } from './types';

export function toNumber(value: string | number) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

export function fmt(value: number, decimals = 2) {
  return Number(value || 0)
    .toLocaleString('vi-VN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    .replace(/,/g, '.');
}

export function fmt0(value: number) {
  return Number(value || 0)
    .toLocaleString('vi-VN', { maximumFractionDigits: 0 })
    .replace(/,/g, '.');
}

export function salesRateToRevenueRate(salesRate: number, avgFee: number) {
  return avgFee > 0 ? (salesRate * 100) / avgFee : 0;
}

export function revenueRateToSalesRate(revenueRate: number, avgFee: number) {
  return (revenueRate * avgFee) / 100;
}

export function sanitizePlan(raw: any): Partial<Plan> {
  const out: Partial<Plan> = {};

  PLAN_KEYS.forEach((key) => {
    if (raw?.[key] !== undefined && raw?.[key] !== null) {
      out[key] = Number(raw[key]);
    }
  });

  return out;
}

export function calcPlanTotalMetrics(plan: Plan): PlanTotalMetrics {
  const revInhouse = round(plan.targetRevenue, 2);
  const avgFee = round(plan.avgFee, 1);

  const calcCost = (revenue: number, salesRatePct: number) =>
    round(avgFee > 0 ? (revenue / avgFee) * salesRatePct : 0, 2);

  const sale = calcCost(revInhouse, plan.costSaleCommission);
  const mgr = calcCost(revInhouse, plan.costMgmtCommission);
  const mkt = calcCost(revInhouse, plan.costMarketing);
  const bonus = calcCost(revInhouse, plan.costBonus);
  const disc = calcCost(revInhouse, plan.costDiscount);
  const other = calcCost(revInhouse, plan.costOther);

  const totalCostInhouse = round(sale + mgr + mkt + bonus + disc + other, 2);
  const totalNetCommission = round(revInhouse - totalCostInhouse, 2);
  const avgNetFeePct = round(
    avgFee
      - (
        plan.costSaleCommission
        + plan.costMgmtCommission
        + plan.costMarketing
        + plan.costBonus
        + plan.costDiscount
        + plan.costOther
      ),
    2,
  );

  const costRevenueRates = {
    sale: round(salesRateToRevenueRate(plan.costSaleCommission, avgFee), 2),
    mgr: round(salesRateToRevenueRate(plan.costMgmtCommission, avgFee), 2),
    mkt: round(salesRateToRevenueRate(plan.costMarketing, avgFee), 2),
    bonus: round(salesRateToRevenueRate(plan.costBonus, avgFee), 2),
    disc: round(salesRateToRevenueRate(plan.costDiscount, avgFee), 2),
    other: round(salesRateToRevenueRate(plan.costOther, avgFee), 2),
  };

  const totalVarCostPctRevenue = round(revInhouse > 0 ? (totalCostInhouse / revInhouse) * 100 : 0, 2);
  const gpPctRevenue = round(100 - totalVarCostPctRevenue, 1);

  const autoInsurance = round((plan.hrSalaryBase + plan.hrSalaryOffice) * 0.215, 0);
  const opexHR = plan.hrSalaryBase + plan.hrSalaryOffice + plan.hrBonusBenefit + plan.hrRecruiting;
  const opexOffice = plan.offRent + plan.offUtility + plan.offSupplies + plan.offMaintenance;
  const opexTech = plan.techEquipment + plan.techDepreciation + plan.techSoftware;
  const opexBrand = plan.brandBranding + plan.brandHospitality;
  const opexLegal = plan.legalFees + plan.legalConsulting + autoInsurance + plan.legalOther;
  const totalOpexMonth = round(opexHR + opexOffice + opexTech + opexBrand + opexLegal, 0);
  const totalOpexYear = round((totalOpexMonth * 12) / 1000, 2);
  const opexPctRevenue = round(revInhouse > 0 ? (totalOpexYear / revInhouse) * 100 : 0, 1);

  const ebt = round(totalNetCommission - totalOpexYear, 2);
  const tax = round(ebt > 0 ? ebt * (plan.taxRate / 100) : 0, 2);
  const netProfit = round(ebt - tax, 2);
  const gpMargin = round(revInhouse > 0 ? (totalNetCommission / revInhouse) * 100 : 0, 1);
  const ros = round(revInhouse > 0 ? (netProfit / revInhouse) * 100 : 0, 1);

  const breakEvenRevenue = round(gpMargin > 0 ? totalOpexYear / (gpMargin / 100) : 0, 2);
  const safetyMargin = round(revInhouse - breakEvenRevenue, 2);
  const safetyMarginPct = round(revInhouse > 0 ? (safetyMargin / revInhouse) * 100 : 0, 1);

  const targetGMVInhouse = round(avgFee > 0 ? revInhouse / (avgFee / 100) : 0, 2);
  const numDeals = plan.avgPrice > 0 ? Math.ceil(targetGMVInhouse / plan.avgPrice) : 0;
  const numBookings = plan.rateDealBooking > 0 ? Math.ceil(numDeals / (plan.rateDealBooking / 100)) : 0;
  const numMeetings = plan.rateBookingMeeting > 0 ? Math.ceil(numBookings / (plan.rateBookingMeeting / 100)) : 0;
  const numLeads = plan.rateMeetingLead > 0 ? Math.ceil(numMeetings / (plan.rateMeetingLead / 100)) : 0;

  const salesRate = plan.salesSelfGenRate || 30;
  const marketingRate = 100 - salesRate;
  const numLeadsMkt = Math.round(numLeads * (marketingRate / 100));
  const numLeadsSales = numLeads - numLeadsMkt;
  const numMeetingsMkt = Math.round(numMeetings * (marketingRate / 100));
  const numMeetingsSales = numMeetings - numMeetingsMkt;
  const numBookingsMkt = Math.round(numBookings * (marketingRate / 100));
  const numBookingsSales = numBookings - numBookingsMkt;
  const numDealsMkt = Math.round(numDeals * (marketingRate / 100));
  const numDealsSales = numDeals - numDealsMkt;

  const civPerDeal = {
    sale: numDeals > 0 ? round((sale * 1000) / numDeals, 0) : 0,
    mgr: numDeals > 0 ? round((mgr * 1000) / numDeals, 0) : 0,
    mkt: numDeals > 0 ? round((mkt * 1000) / numDeals, 0) : 0,
    bonus: numDeals > 0 ? round((bonus * 1000) / numDeals, 0) : 0,
    disc: numDeals > 0 ? round((disc * 1000) / numDeals, 0) : 0,
    other: numDeals > 0 ? round((other * 1000) / numDeals, 0) : 0,
  };

  const totalCostPerDeal = numDeals > 0 ? round((totalCostInhouse * 1000) / numDeals, 0) : 0;

  return {
    revInhouse,
    avgFee,
    totalCostInhouse,
    totalNetCommission,
    avgNetFeePct,
    totalVarCostPctRevenue,
    gpPctRevenue,
    sale,
    mgr,
    mkt,
    bonus,
    disc,
    other,
    costRevenueRates,
    autoInsurance,
    opexHR,
    opexOffice,
    opexTech,
    opexBrand,
    opexLegal,
    totalOpexMonth,
    totalOpexYear,
    opexPctRevenue,
    ebt,
    tax,
    netProfit,
    gpMargin,
    ros,
    breakEvenRevenue,
    safetyMargin,
    safetyMarginPct,
    targetGMVInhouse,
    numDeals,
    numBookings,
    numMeetings,
    numLeads,
    numLeadsMkt,
    numLeadsSales,
    numMeetingsMkt,
    numMeetingsSales,
    numBookingsMkt,
    numBookingsSales,
    numDealsMkt,
    numDealsSales,
    civPerDeal,
    totalCostPerDeal,
  };
}
