import {
  Activity,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  DollarSign,
  FileCheck,
  FileText,
  Gauge,
  Home,
  Landmark,
  LineChart,
  ListTodo,
  Megaphone,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Target,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react-native';
import { ErpModuleId } from '../../../core/config/modules';
import {
  ModuleActivityItem,
  ModuleFlowConfig,
  ModuleFlowId,
  ModuleFocusCard,
  ModuleKpi,
  ModuleSummaryCard,
  ModuleTableRow,
  ModuleTone,
  ModuleWorkspaceConfig,
} from './types';

type SeedFlowValue = {
  first: string;
  second: string;
  third: string;
};

type SeedFlowRecord = {
  tasks: string[];
  outputs: string[];
  values: SeedFlowValue;
};

type SeedKpi = {
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  tone: ModuleTone;
  icon: ModuleKpi['icon'];
};

type ModuleSeed = {
  moduleId: ErpModuleId;
  moduleName: string;
  moduleSubtitle: string;
  accentColor: string;
  icon: ModuleWorkspaceConfig['icon'];
  kpis: SeedKpi[];
  owners: string[];
  flows: Record<ModuleFlowId, SeedFlowRecord>;
};

const status = (label: string, tone: ModuleTone) => ({ label, tone });
const statusCycle = [
  status('On track', 'success'),
  status('Pending review', 'info'),
  status('Need attention', 'warning'),
  status('Blocked', 'danger'),
];

const FLOW_META: Record<
  ModuleFlowId,
  {
    label: string;
    description: string;
    primaryAction: string;
    quickTags: string[];
    summaryLabels: [string, string, string];
    summaryIcons: [ModuleSummaryCard['icon'], ModuleSummaryCard['icon'], ModuleSummaryCard['icon']];
    summaryTones: [ModuleTone, ModuleTone, ModuleTone];
    tableTitle: string;
    focusTitle: string;
  }
> = {
  overview: {
    label: 'Tong Quan',
    description: 'Theo doi KPI tong hop, diem nghen va muc uu tien trong ngay.',
    primaryAction: 'Tao Hang Muc Moi',
    quickTags: ['Dashboard', 'Realtime', 'Priority'],
    summaryLabels: ['Tong hop 1', 'Tong hop 2', 'Tong hop 3'],
    summaryIcons: [Gauge, Target, LineChart],
    summaryTones: ['brand', 'success', 'info'],
    tableTitle: 'Danh Muc Can Theo Sat',
    focusTitle: 'Uu Tien Trong Ngay',
  },
  operations: {
    label: 'Van Hanh',
    description: 'Quan ly queue xu ly, SLA va phoi hop lien phong ban.',
    primaryAction: 'Mo Queue Van Hanh',
    quickTags: ['Queue', 'SLA', 'Execution'],
    summaryLabels: ['Queue dang mo', 'SLA dung han', 'Backlog tre han'],
    summaryIcons: [ClipboardList, ClipboardCheck, ListTodo],
    summaryTones: ['info', 'success', 'warning'],
    tableTitle: 'Cong Viec Van Hanh Dang Chay',
    focusTitle: 'Operational Pulse',
  },
  approval: {
    label: 'Phe Duyet',
    description: 'Xu ly ho so, exception va case can escalated.',
    primaryAction: 'Trinh Ho So Moi',
    quickTags: ['Approval', 'Escalation', 'Control'],
    summaryLabels: ['Ho so cho duyet', 'Case urgent', 'SLA phe duyet'],
    summaryIcons: [FileCheck, ShieldCheck, Gauge],
    summaryTones: ['warning', 'danger', 'info'],
    tableTitle: 'Yeu Cau Dang Cho Phe Duyet',
    focusTitle: 'Approval Priority',
  },
  reporting: {
    label: 'Bao Cao',
    description: 'Tong hop insight, variance va du bao cho lanh dao.',
    primaryAction: 'Xuat Bao Cao',
    quickTags: ['Report', 'Variance', 'Forecast'],
    summaryLabels: ['Report da chay', 'Sai lech', 'Do tin cay'],
    summaryIcons: [BarChart3, Activity, Gauge],
    summaryTones: ['success', 'warning', 'info'],
    tableTitle: 'Bao Cao Dang Tong Hop',
    focusTitle: 'Report Quality',
  },
  settings: {
    label: 'Cau Hinh',
    description: 'Quan tri policy, workflow va bo quy tac van hanh.',
    primaryAction: 'Cap Nhat Cau Hinh',
    quickTags: ['Policy', 'Workflow', 'Audit'],
    summaryLabels: ['Rule active', 'Can cap nhat', 'Audit action'],
    summaryIcons: [Settings, FileText, ClipboardList],
    summaryTones: ['info', 'warning', 'neutral'],
    tableTitle: 'Danh Muc Cau Hinh',
    focusTitle: 'Governance',
  },
};

function buildSummaryCards(seed: ModuleSeed, flowId: ModuleFlowId): ModuleSummaryCard[] {
  const meta = FLOW_META[flowId];
  const data = seed.flows[flowId].values;
  const values = [data.first, data.second, data.third] as const;

  return values.map((value, index) => ({
    id: `${seed.moduleId}-${flowId}-summary-${index + 1}`,
    label: meta.summaryLabels[index],
    value,
    icon: meta.summaryIcons[index],
    tone: meta.summaryTones[index],
  }));
}

function buildRows(seed: ModuleSeed, flowId: ModuleFlowId): ModuleTableRow[] {
  const flow = seed.flows[flowId];
  return flow.tasks.map((task, index) => ({
    id: `${seed.moduleId}-${flowId}-row-${index + 1}`,
    item: task,
    owner: seed.owners[index % seed.owners.length],
    due: `${10 + index} Mar`,
    output: flow.outputs[index] || 'N/A',
    status: statusCycle[index % statusCycle.length],
  }));
}

function buildFocusCards(seed: ModuleSeed, flowId: ModuleFlowId): ModuleFocusCard[] {
  const flow = seed.flows[flowId].values;
  const focusIcons: [ModuleFocusCard['icon'], ModuleFocusCard['icon'], ModuleFocusCard['icon']] = [Target, Activity, BadgeCheck];
  const focusTones: [ModuleTone, ModuleTone, ModuleTone] = ['brand', 'warning', 'success'];
  const values = [flow.first, flow.second, flow.third] as const;

  return values.map((value, index) => ({
    id: `${seed.moduleId}-${flowId}-focus-${index + 1}`,
    title: `Chi so trong tam ${index + 1}`,
    value,
    hint: `${seed.moduleName}: uu tien xu ly muc ${index + 1} trong flow ${FLOW_META[flowId].label}.`,
    tone: focusTones[index],
    icon: focusIcons[index],
  }));
}

function buildActivities(seed: ModuleSeed, flowId: ModuleFlowId): ModuleActivityItem[] {
  const tasks = seed.flows[flowId].tasks;
  const activityTones: [ModuleTone, ModuleTone, ModuleTone] = ['info', 'warning', 'success'];
  return tasks.slice(0, 3).map((task, index) => ({
    id: `${seed.moduleId}-${flowId}-act-${index + 1}`,
    title: `Cap nhat ${FLOW_META[flowId].label.toLowerCase()}`,
    detail: `${task} da duoc ghi nhan trong he thong ${seed.moduleName}.`,
    time: `0${9 + index}:1${index}`,
    tone: activityTones[index],
  }));
}

function buildFlow(seed: ModuleSeed, flowId: ModuleFlowId): ModuleFlowConfig {
  const meta = FLOW_META[flowId];
  return {
    id: flowId,
    label: `${meta.label} ${seed.moduleName}`,
    description: `${seed.moduleName} - ${meta.description}`,
    primaryAction: meta.primaryAction,
    quickTags: meta.quickTags,
    summaryCards: buildSummaryCards(seed, flowId),
    tableTitle: meta.tableTitle,
    tableRows: buildRows(seed, flowId),
    focusTitle: meta.focusTitle,
    focusCards: buildFocusCards(seed, flowId),
    activities: buildActivities(seed, flowId),
  };
}

const MODULE_SEEDS: ModuleSeed[] = [
  {
    moduleId: 'biz',
    moduleName: 'Kinh Doanh',
    moduleSubtitle: 'CRM, pipeline va giao dich',
    accentColor: '#2563EB',
    icon: ShoppingCart,
    kpis: [
      { label: 'Lead moi', value: '342', unit: 'today', trend: 15, tone: 'brand', icon: Users },
      { label: 'Booking', value: '118', unit: 'MTD', trend: 9, tone: 'success', icon: ClipboardCheck },
      { label: 'Deal close', value: '46', unit: 'MTD', trend: 7, tone: 'info', icon: Target },
      { label: 'Forecast', value: '680 Ty', unit: 'Q', trend: 10, tone: 'warning', icon: LineChart },
    ],
    owners: ['Sales Ops', 'Team Alpha', 'Team Beta', 'Sales Director'],
    flows: {
      overview: { tasks: ['Lead moi chua goi lan 1', 'Deal dat coc can tai lieu', 'Danh sach no follow-up > 48h', 'Top deal value cao can close'], outputs: ['84 lead', '19 deal', '57 lead', '212 Ty'], values: { first: '3.2x', second: '22%', third: '680 Ty' } },
      operations: { tasks: ['Phan bo lead theo khu vuc', 'Doi soat meeting no-show', 'Cap nhat trang thai dat coc', 'Xu ly deal aging > 21 ngay'], outputs: ['245 lead', '31 khach', '18 deal', '26 deal'], values: { first: '42', second: '94%', third: '7' } },
      approval: { tasks: ['Dieu chinh chiet khau block C', 'Ngoai le lich thanh toan', 'Duyet quyen hold can ho', 'Nang cap role CRM'], outputs: ['8.4 Ty', '3 ho so', '12 can', '5 user'], values: { first: '18', second: '4', third: '7.2h' } },
      reporting: { tasks: ['Weekly conversion by stage', 'Variance theo team ban hang', 'Deal velocity theo du an', 'Bao cao no dat coc'], outputs: ['14 charts', '8 team', '6 du an', '38 ho so'], values: { first: '92%', second: '6.8%', third: '81%' } },
      settings: { tasks: ['SLA lead first-call', 'Commission matrix cap bac', 'Role permission CRM', 'Rule auto-distribute lead'], outputs: ['<= 30 phut', 'version 2026.03', '5 role', 'round robin'], values: { first: '42', second: '7', third: '128' } },
    },
  },
  {
    moduleId: 'mkt',
    moduleName: 'Marketing',
    moduleSubtitle: 'Campaign, attribution va budget',
    accentColor: '#D97706',
    icon: Megaphone,
    kpis: [
      { label: 'Campaign active', value: '12', trend: 2, tone: 'brand', icon: Megaphone },
      { label: 'MQL', value: '1,245', unit: 'MTD', trend: 11, tone: 'success', icon: Users },
      { label: 'Spend', value: '680 Tr', unit: 'MTD', trend: 5, tone: 'warning', icon: Wallet },
      { label: 'ROAS', value: '4.1x', trend: 6, tone: 'info', icon: LineChart },
    ],
    owners: ['Performance Team', 'Growth Team', 'Creative Studio', 'MarTech'],
    flows: {
      overview: { tasks: ['Campaign launch wave 2', 'Retargeting segment high intent', 'Creative refresh social ads', 'Brand lift tracking setup'], outputs: ['lead target 420', 'ROAS 4.2x', '18 asset', 'survey panel'], values: { first: '12', second: '485K', third: '34%' } },
      operations: { tasks: ['Booking KOL wave launch', 'Cap nhat UTM va event tracking', 'Lich post social calendar', 'Dong bo lead routing vao CRM'], outputs: ['14 booking', '34 campaign', '52 bai', '6 form'], values: { first: '26', second: '92%', third: '7' } },
      approval: { tasks: ['Tang budget brand campaign Q2', 'Duyet key visual event launch', 'Legal check script livestream', 'Confirm PR package tier A'], outputs: ['1.8 Ty', '6 visual', '3 script', '4 bao'], values: { first: '9', second: '14', third: '8.4h' } },
      reporting: { tasks: ['Campaign ROI by channel', 'Creative fatigue report', 'Lead quality by source', 'Spend variance monthly'], outputs: ['12 kenh', '37 ad set', '2,145 lead', '8.6%'], values: { first: '97%', second: '4', third: '7' } },
      settings: { tasks: ['Naming convention campaign', 'Threshold budget alert', 'Creative approval checklist', 'Weekly reporting template'], outputs: ['v2.1', '>85% budget', '12 checkpoint', 'auto send'], values: { first: '36', second: '5', third: '24' } },
    },
  },
  {
    moduleId: 'hr',
    moduleName: 'Nhan Su',
    moduleSubtitle: 'Recruiting, workforce va governance',
    accentColor: '#DB2777',
    icon: Users,
    kpis: [
      { label: 'Headcount', value: '287', trend: 2, tone: 'brand', icon: Users },
      { label: 'Open role', value: '24', trend: 4, tone: 'warning', icon: Briefcase },
      { label: 'Offer accept', value: '81%', trend: 3, tone: 'success', icon: BadgeCheck },
      { label: 'Training done', value: '88%', trend: 6, tone: 'info', icon: ClipboardCheck },
    ],
    owners: ['HRBP', 'TA Team', 'C&B Team', 'People Analytics'],
    flows: {
      overview: { tasks: ['Vi tri sale can bo sung', 'Onboarding lop thang 03', 'Danh gia probation den han', 'Canh bao turnover team East'], outputs: ['11 role', '17 nhan su', '9 ho so', '5.8%'], values: { first: '287', second: '24', third: '81%' } },
      operations: { tasks: ['Shortlist Sales Manager', 'Setup onboarding account', 'Doi soat cong va OT', 'Cap nhat ho so hop dong'], outputs: ['24 CV', '12 account', '287 nhan su', '19 ho so'], values: { first: '142', second: '38', third: '9' } },
      approval: { tasks: ['Dieu chinh thuong quy', 'Gia han hop dong thoi vu', 'Phe duyet dieu chuyen noi bo', 'Duyet cap bac Team Lead'], outputs: ['4 nhan su', '9 hop dong', '3 ho so', '2 de xuat'], values: { first: '21', second: '3', third: '7.8h' } },
      reporting: { tasks: ['Headcount movement by month', 'Attrition theo manager', 'Payroll trend by function', 'Training completion by role'], outputs: ['12 thang', '14 manager', '9 function', '287 nhan su'], values: { first: '4.2%', second: '18.5 Tr', third: '2.9x' } },
      settings: { tasks: ['Workflow duyet tang luong', 'Policy probation review', 'Role permission HR portal', 'Template quyet dinh nhan su'], outputs: ['4 level', 'v3.2', '9 role', '12 template'], values: { first: '29', second: '6', third: '84' } },
    },
  },
  {
    moduleId: 'agency',
    moduleName: 'Dai Ly',
    moduleSubtitle: 'Partner network, policy va scorecard',
    accentColor: '#6366F1',
    icon: Building2,
    kpis: [
      { label: 'Partner active', value: '42', trend: 3, tone: 'brand', icon: Building2 },
      { label: 'Coverage', value: '86%', trend: 2, tone: 'info', icon: Landmark },
      { label: 'Deals via partner', value: '121', trend: 11, tone: 'success', icon: Users },
      { label: 'Commission', value: '42.5 Ty', trend: 4, tone: 'warning', icon: Wallet },
    ],
    owners: ['Partnership Team', 'Agency Ops', 'Finance Partner', 'Regional Lead'],
    flows: {
      overview: { tasks: ['CenLand KPI quarter', 'DKRA ho so doi soat', 'MGLand no SLA report', 'Onboarding doi tac moi'], outputs: ['85 deal', '17 ho so', '3 lan', '6 dai ly'], values: { first: '42', second: '86%', third: '850 Ty' } },
      operations: { tasks: ['Kich hoat account dai ly moi', 'Lich training chinh sach ban hang', 'Doi soat hoa hong tuan 10', 'Ho tro tai lieu launch du an'], outputs: ['6 account', '4 session', '42.5 Ty', '14 package'], values: { first: '18', second: '89%', third: '5' } },
      approval: { tasks: ['Dieu chinh tier hoa hong F1', 'Cap han muc booking', 'Phe duyet bonus launch wave', 'Mien tru SLA bao cao'], outputs: ['3 doi tac', '6 can', '2.2 Ty', '1 truong hop'], values: { first: '14', second: '6', third: '8.4h' } },
      reporting: { tasks: ['Partner output by region', 'Tier movement monthly', 'Commission variance analysis', 'Partner SLA compliance'], outputs: ['6 region', '48 doi tac', '42.5 Ty', '94%'], values: { first: '82/100', second: '5.0%', third: '+18%' } },
      settings: { tasks: ['Tier uplift dieu kien moi', 'Rule han muc dat coc', 'Checklist doi soat hoa hong', 'Mau hop dong doi tac'], outputs: ['v2.0', '3 level', '14 point', '8 template'], values: { first: '17', second: '4', third: '63' } },
    },
  },
  {
    moduleId: 'shomes',
    moduleName: 'S-Homes',
    moduleSubtitle: 'Property operation va resident service',
    accentColor: '#0891B2',
    icon: Home,
    kpis: [
      { label: 'Occupancy', value: '89%', trend: 2, tone: 'success', icon: Home },
      { label: 'Open ticket', value: '38', trend: 5, tone: 'warning', icon: Wrench },
      { label: 'Revenue', value: '12.5 Ty', trend: 8, tone: 'brand', icon: Wallet },
      { label: 'NPS', value: '64', trend: 5, tone: 'info', icon: Activity },
    ],
    owners: ['Facility Team', 'Site Manager', 'Resident Care', 'Maintenance Lead'],
    flows: {
      overview: { tasks: ['Su co he thong nuoc block C', 'Bao tri thang may Tower A', 'Doi soat phi dich vu ky 03', 'Khieu nai cu dan chua dong'], outputs: ['12 can', '2 he thong', '1,845 can', '7 case'], values: { first: '89%', second: '38', third: '12.5 Ty' } },
      operations: { tasks: ['Phan cong ky thuat theo ca', 'Ke hoach bao tri dinh ky', 'Xu ly khieu nai fee service', 'Dong bo ton kho vat tu'], outputs: ['32 work order', '18 hang muc', '11 case', '96 SKU'], values: { first: '46', second: '93%', third: '8' } },
      approval: { tasks: ['Thay bom nuoc Tower C', 'Gia han hop dong ve sinh', 'Mua vat tu du phong Q2', 'Phe duyet nha thau son lai'], outputs: ['1.2 Ty', '3 site', '640 Tr', '2.8 Ty'], values: { first: '16', second: '9.6 Ty', third: '9.1h' } },
      reporting: { tasks: ['Occupancy by tower', 'Ticket SLA by category', 'Service fee collection', 'NPS by resident segment'], outputs: ['16 tower', '8 nhom', '95.4%', '5 segment'], values: { first: '12.5 Ty', second: '91%', third: '6%' } },
      settings: { tasks: ['Workflow xu ly ticket critical', 'SOP nghiem thu nha thau', 'Role permission site app', 'Checklist handover can ho'], outputs: ['4 lane', 'v1.9', '7 role', '28 checkpoint'], values: { first: '54', second: '8', third: '72' } },
    },
  },
  {
    moduleId: 'project',
    moduleName: 'Du An',
    moduleSubtitle: 'Inventory, launch va project performance',
    accentColor: '#0284C7',
    icon: Building,
    kpis: [
      { label: 'Project active', value: '8', tone: 'brand', icon: Building },
      { label: 'Inventory left', value: '1,344', trend: -3, tone: 'warning', icon: Home },
      { label: 'Sell-through', value: '68%', trend: 4, tone: 'success', icon: Gauge },
      { label: 'GMV', value: '12,800 Ty', trend: 7, tone: 'info', icon: Wallet },
    ],
    owners: ['Project PMO', 'Product Team', 'Sales Strategy', 'Finance PMO'],
    flows: {
      overview: { tasks: ['Tien do phap ly block B', 'Cap nhat bang gia wave 3', 'Rao hang ton kho lau ngay', 'Plan launch phase 2'], outputs: ['84%', '220 can', '148 can', '1 event'], values: { first: '8', second: '1,344', third: '68%' } },
      operations: { tasks: ['Cap nhat datasheet ro hang', 'Checklist launch event', 'Dong bo sales kit', 'Doi soat gia tri ton kho'], outputs: ['8 du an', '42 task', '14 bo', '12,800 Ty'], values: { first: '56', second: '88%', third: '7' } },
      approval: { tasks: ['Duyet bang gia block C', 'Thay doi chinh sach thanh toan', 'Dieu chinh co cau can ho', 'Phe duyet bo sung tien ich'], outputs: ['180 can', '3 du an', '14 can', '1 package'], values: { first: '13', second: '2,450 Ty', third: '8.7h' } },
      reporting: { tasks: ['Sell-through by project', 'Inventory aging bucket', 'Price realization report', 'Launch impact measurement'], outputs: ['8 du an', '4 bucket', '68 giao dich', '3 dot launch'], values: { first: '4.6 thang', second: '4.8 Ty', third: '5/8' } },
      settings: { tasks: ['Rule gia theo huong/view', 'SOP launch readiness', 'Mapping product hierarchy', 'Template release note'], outputs: ['v2.4', '36 checkpoint', '8 du an', '5 template'], values: { first: '23', second: '4', third: '58' } },
    },
  },
  {
    moduleId: 'finance',
    moduleName: 'Tai Chinh',
    moduleSubtitle: 'Cashflow, debt va budget control',
    accentColor: '#059669',
    icon: DollarSign,
    kpis: [
      { label: 'Cash in MTD', value: '186 Ty', trend: 7, tone: 'success', icon: Wallet },
      { label: 'AR outstanding', value: '245 Ty', trend: -3, tone: 'warning', icon: Landmark },
      { label: 'P&L close', value: '92%', trend: 2, tone: 'info', icon: BarChart3 },
      { label: 'ROS', value: '4.8%', trend: 1, tone: 'brand', icon: LineChart },
    ],
    owners: ['Treasury Team', 'AR Team', 'AP Team', 'FP&A'],
    flows: {
      overview: { tasks: ['Thu no dat coc qua han', 'Ke hoach dong tien tuan 11', 'Doi soat hoa hong dai ly', 'Canh bao vuot budget MKT'], outputs: ['38 ho so', '62 Ty', '42.5 Ty', '+8%'], values: { first: '186 Ty', second: '245 Ty', third: '4.8%' } },
      operations: { tasks: ['Batch thu no dat coc', 'Lenh chi nha cung cap', 'Doi soat ngan hang EOD', 'Cap nhat so cai cong no'], outputs: ['28 Ty', '6.4 Ty', '5 bank', '143 account'], values: { first: '42', second: '91%', third: '12' } },
      approval: { tasks: ['Tam ung event launch Q2', 'Thanh toan bonus sales', 'Cap han muc mua vat tu', 'Ngoai le chi phi phap ly'], outputs: ['2.6 Ty', '5.1 Ty', '1.9 Ty', '780 Tr'], values: { first: '27', second: '54 Ty', third: '6.9h' } },
      reporting: { tasks: ['P&L by business line', 'Cashflow rolling 13 week', 'AR aging bucket', 'Budget vs actual dashboard'], outputs: ['9 line', '13 ky', '5 bucket', '47 KPI'], values: { first: '92%', second: '7.1%', third: '89%' } },
      settings: { tasks: ['Workflow phe duyet chi', 'Mapping chart of account', 'Rule auto-alloc cost center', 'Template bieu mau thanh toan'], outputs: ['5 level', 'v4.1', '12 rule', '9 template'], values: { first: '41', second: '6', third: '97' } },
    },
  },
  {
    moduleId: 'legal',
    moduleName: 'Phap Ly',
    moduleSubtitle: 'Contract lifecycle va compliance',
    accentColor: '#7C3AED',
    icon: Scale,
    kpis: [
      { label: 'Contract active', value: '342', tone: 'brand', icon: FileText },
      { label: 'Pending case', value: '28', tone: 'warning', icon: Scale },
      { label: 'Compliance', value: '92%', tone: 'success', icon: ShieldCheck },
      { label: 'Cycle time', value: '4.2 ngay', tone: 'info', icon: LineChart },
    ],
    owners: ['Legal Ops', 'Contract Team', 'Compliance Team', 'Project Legal'],
    flows: {
      overview: { tasks: ['Hop dong sap het han 30 ngay', 'Phu luc bo sung can ky', 'Ho so du an cho tham dinh', 'Kiem tra dieu khoan moi'], outputs: ['19 hop dong', '8 ho so', '4 du an', '12 clause'], values: { first: '342', second: '28', third: '92%' } },
      operations: { tasks: ['Soat thao HĐMB du an moi', 'Doi chieu dieu khoan voi sales', 'Cap nhat kho mau hop dong', 'Luu tru ho so da ky'], outputs: ['14 hop dong', '9 case', '23 template', '41 ho so'], values: { first: '33', second: '90%', third: '6' } },
      approval: { tasks: ['Ky HĐMB block C', 'Duyet phu luc gia han', 'Ngoai le dieu khoan phat cham', 'Xac nhan hop dong agency'], outputs: ['6 hop dong', '3 ho so', '2 case', '5 hop dong'], values: { first: '17', second: '4', third: '7.5h' } },
      reporting: { tasks: ['Risk heatmap theo du an', 'Contract cycle-time trend', 'Violation tracking by team', 'Clause exception summary'], outputs: ['8 du an', '3 thang', '6 bo phan', '21 case'], values: { first: '92%', second: '11', third: '4.2 ngay' } },
      settings: { tasks: ['Clause library versioning', 'Workflow sign-off matrix', 'Template HĐMB standard', 'Retention policy ho so'], outputs: ['v5.0', '6 level', '14 template', '7 nam'], values: { first: '38', second: '9', third: '76' } },
    },
  },
  {
    moduleId: 'admin',
    moduleName: 'Quan Tri',
    moduleSubtitle: 'Cau hinh to chuc, phan quyen va he thong',
    accentColor: '#6366F1',
    icon: Settings,
    kpis: [
      { label: 'Phong ban', value: '0', tone: 'brand', icon: Building },
      { label: 'Chuc vu', value: '0', tone: 'info', icon: Briefcase },
      { label: 'User active', value: '0', tone: 'success', icon: Users },
      { label: 'Config rules', value: '0', tone: 'warning', icon: Settings },
    ],
    owners: ['System Admin', 'IT Ops', 'HR Admin', 'Security'],
    flows: {
      overview: { tasks: ['Cau hinh phong ban moi', 'Cap nhat chuc vu', 'Review quyen he thong', 'Kiem tra bao mat'], outputs: ['5 PB', '12 CV', '24 role', 'OK'], values: { first: '5', second: '12', third: '24' } },
      operations: { tasks: ['Tao team moi', 'Gan quyen user', 'Cap nhat policy', 'Dong bo he thong'], outputs: ['3 team', '8 user', '4 policy', 'synced'], values: { first: '8', second: '95%', third: '4' } },
      approval: { tasks: ['Duyet tao phong ban', 'Duyet role moi', 'Duyet thay doi config', 'Phe duyet truy cap'], outputs: ['2 PB', '1 role', '3 config', '5 user'], values: { first: '6', second: '2', third: '4.5h' } },
      reporting: { tasks: ['Audit log', 'User activity', 'System health', 'Permission matrix'], outputs: ['1,245 log', '287 user', '99.9%', '24 role'], values: { first: '99.9%', second: '287', third: '1,245' } },
      settings: { tasks: ['RBAC matrix update', 'System backup policy', 'Password policy', 'Session timeout'], outputs: ['v2.0', 'daily', '90 ngay', '30 phut'], values: { first: '24', second: '6', third: '48' } },
    },
  },
];

export const MODULE_WORKSPACE_CONFIGS: Partial<Record<ErpModuleId, ModuleWorkspaceConfig>> = MODULE_SEEDS.reduce(
  (acc, seed) => {
    acc[seed.moduleId] = {
      moduleId: seed.moduleId,
      moduleName: seed.moduleName,
      moduleSubtitle: seed.moduleSubtitle,
      accentColor: seed.accentColor,
      icon: seed.icon,
      kpis: seed.kpis.map((kpi, index) => ({
        id: `${seed.moduleId}-kpi-${index + 1}`,
        label: kpi.label,
        value: kpi.value,
        unit: kpi.unit,
        trend: kpi.trend,
        tone: kpi.tone,
        icon: kpi.icon,
      })),
      flows: (Object.keys(FLOW_META) as ModuleFlowId[]).map((flowId) => buildFlow(seed, flowId)),
      defaultFlowId: 'overview',
    };
    return acc;
  },
  {} as Partial<Record<ErpModuleId, ModuleWorkspaceConfig>>
);

export const DEFAULT_MODULE_WORKSPACE_CONFIG: ModuleWorkspaceConfig = {
  moduleId: 'biz',
  moduleName: 'Module',
  moduleSubtitle: 'Business workspace',
  accentColor: '#2563EB',
  icon: ShoppingCart,
  kpis: [
    { id: 'default-kpi-1', label: 'Queue', value: '0', tone: 'info', icon: ClipboardList },
    { id: 'default-kpi-2', label: 'Done', value: '0', tone: 'success', icon: CheckSquare },
    { id: 'default-kpi-3', label: 'Pending', value: '0', tone: 'warning', icon: ListTodo },
    { id: 'default-kpi-4', label: 'Issues', value: '0', tone: 'danger', icon: ShieldCheck },
  ],
  flows: [
    {
      id: 'overview',
      label: 'Tong Quan',
      description: 'Khong tim thay cau hinh module.',
      primaryAction: 'Cap Nhat Cau Hinh',
      quickTags: ['Fallback'],
      summaryCards: [{ id: 'default-summary-1', label: 'Status', value: 'N/A', tone: 'warning', icon: Gauge }],
      tableTitle: 'Danh Sach Mac Dinh',
      tableRows: [{ id: 'default-row-1', item: 'No data', owner: 'System', due: 'N/A', output: 'N/A', status: status('Need attention', 'warning') }],
      focusTitle: 'Thong Tin',
      focusCards: [{ id: 'default-focus-1', title: 'Config', value: 'Missing', hint: 'Can cap nhat MODULE_WORKSPACE_CONFIGS', tone: 'warning', icon: Settings }],
      activities: [{ id: 'default-act-1', title: 'Fallback mode', detail: 'Module dang dung cau hinh mac dinh.', time: 'Now', tone: 'warning' }],
    },
  ],
  defaultFlowId: 'overview',
};
