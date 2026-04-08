import type { ComponentType } from 'react';

export type ScenarioKey = 'BASE' | 'OPTIMISTIC' | 'PESSIMISTIC';

export type Plan = {
  year: number;
  targetRevenue: number;
  avgFee: number;
  avgPrice: number;
  costSaleCommission: number;
  costMgmtCommission: number;
  costMarketing: number;
  costBonus: number;
  costDiscount: number;
  costOther: number;
  hrSalaryBase: number;
  hrSalaryOffice: number;
  hrBonusBenefit: number;
  hrRecruiting: number;
  offRent: number;
  offUtility: number;
  offSupplies: number;
  offMaintenance: number;
  techEquipment: number;
  techDepreciation: number;
  techSoftware: number;
  brandBranding: number;
  brandHospitality: number;
  legalFees: number;
  legalConsulting: number;
  legalInsurance: number;
  legalOther: number;
  rateDealBooking: number;
  rateBookingMeeting: number;
  rateMeetingLead: number;
  salesSelfGenRate: number;
  taxRate: number;
};

export type CostRowKey =
  | 'costSaleCommission'
  | 'costMgmtCommission'
  | 'costMarketing'
  | 'costBonus'
  | 'costDiscount'
  | 'costOther';

export type OpexKey =
  | 'hrSalaryBase'
  | 'hrSalaryOffice'
  | 'hrBonusBenefit'
  | 'hrRecruiting'
  | 'offRent'
  | 'offUtility'
  | 'offSupplies'
  | 'offMaintenance'
  | 'techEquipment'
  | 'techDepreciation'
  | 'techSoftware'
  | 'brandBranding'
  | 'brandHospitality'
  | 'legalFees'
  | 'legalConsulting'
  | 'legalInsurance'
  | 'legalOther';

export type CostValueKey = 'sale' | 'mgr' | 'mkt' | 'bonus' | 'disc' | 'other';

export type CostRow = {
  label: string;
  key: CostRowKey;
  valueKey: CostValueKey;
  icon: ComponentType<any>;
  color: string;
};

export type OpexItem = {
  label: string;
  key: OpexKey;
  auto?: boolean;
};

export type OpexColumn = {
  title: string;
  color: string;
  icon: ComponentType<any>;
  items: OpexItem[];
};

export type FunnelInput = {
  label: string;
  key: keyof Plan;
  unit: string;
  step: number;
  precision?: number;
};

export type ScenarioDefinition = {
  label: string;
  short: string;
  color: string;
  revenue: number;
  avgFee: number;
  avgPrice: number;
};

export type PlanTotalMetrics = {
  revInhouse: number;
  avgFee: number;
  totalCostInhouse: number;
  totalNetCommission: number;
  avgNetFeePct: number;
  totalVarCostPctRevenue: number;
  gpPctRevenue: number;
  sale: number;
  mgr: number;
  mkt: number;
  bonus: number;
  disc: number;
  other: number;
  costRevenueRates: {
    sale: number;
    mgr: number;
    mkt: number;
    bonus: number;
    disc: number;
    other: number;
  };
  autoInsurance: number;
  opexHR: number;
  opexOffice: number;
  opexTech: number;
  opexBrand: number;
  opexLegal: number;
  totalOpexMonth: number;
  totalOpexYear: number;
  opexPctRevenue: number;
  ebt: number;
  tax: number;
  netProfit: number;
  gpMargin: number;
  ros: number;
  breakEvenRevenue: number;
  safetyMargin: number;
  safetyMarginPct: number;
  targetGMVInhouse: number;
  numDeals: number;
  numBookings: number;
  numMeetings: number;
  numLeads: number;
  numLeadsMkt: number;
  numLeadsSales: number;
  numMeetingsMkt: number;
  numMeetingsSales: number;
  numBookingsMkt: number;
  numBookingsSales: number;
  numDealsMkt: number;
  numDealsSales: number;
  civPerDeal: {
    sale: number;
    mgr: number;
    mkt: number;
    bonus: number;
    disc: number;
    other: number;
  };
  totalCostPerDeal: number;
};

export type PlanTotalPalette = {
  isDark: boolean;
  surface: string;
  soft: string;
  border: string;
  text: string;
  text2: string;
  text3: string;
};
