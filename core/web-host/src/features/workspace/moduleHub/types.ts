import React from 'react';
import { ErpModuleId } from '../../../core/config/modules';

export type ModuleTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type ModuleFlowId = 'overview' | 'operations' | 'approval' | 'reporting' | 'settings';

export type ModuleIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export interface ModuleSummaryCard {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  tone: ModuleTone;
  icon: ModuleIcon;
}

export interface ModuleKpi {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  tone: ModuleTone;
  icon: ModuleIcon;
}

export interface ModuleRowStatus {
  label: string;
  tone: ModuleTone;
}

export interface ModuleTableRow {
  id: string;
  item: string;
  owner: string;
  due: string;
  output: string;
  status: ModuleRowStatus;
}

export interface ModuleFocusCard {
  id: string;
  title: string;
  value: string;
  hint: string;
  tone: ModuleTone;
  icon: ModuleIcon;
}

export interface ModuleActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: ModuleTone;
}

export interface ModuleFlowConfig {
  id: ModuleFlowId;
  label: string;
  description: string;
  primaryAction: string;
  quickTags: string[];
  summaryCards: ModuleSummaryCard[];
  tableTitle: string;
  tableRows: ModuleTableRow[];
  focusTitle: string;
  focusCards: ModuleFocusCard[];
  activities: ModuleActivityItem[];
}

export interface ModuleWorkspaceConfig {
  moduleId: ErpModuleId;
  moduleName: string;
  moduleSubtitle: string;
  accentColor: string;
  icon: ModuleIcon;
  kpis: ModuleKpi[];
  flows: ModuleFlowConfig[];
  defaultFlowId?: ModuleFlowId;
}
