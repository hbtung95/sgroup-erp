export type RootStackParamList = {
  Login: undefined;
  Workspace: undefined;
  BDHModule: undefined;
  SalesModule: undefined;
  MarketingModule: undefined;
  AgencyModule: undefined;
  SHomesModule: undefined;
  ProjectModule: undefined;
  HRModule: undefined;
  FinanceModule: undefined;
  LegalModule: undefined;
  AdminModule: undefined;
  EmployeeProfile: undefined;
  AccessDenied: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
