import React, { Suspense } from 'react';
import { View, ActivityIndicator, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './routeTypes';
import { useAuthStore } from '../../features/auth/store/authStore';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';

// ── Lazy-loaded module screens ──
// Each module is loaded on-demand when the user first navigates to it.
// This reduces initial bundle size significantly for web.
const WorkspaceScreen = React.lazy(() =>
  import('../../features/workspace/screens/WorkspaceScreen').then(m => ({ default: m.WorkspaceScreen }))
);
const BDHShell = React.lazy(() =>
  import('../../features/bdh/BDHShell').then(m => ({ default: m.BDHShell }))
);
const SalesScreen = React.lazy(() =>
  import('../../features/sales/presentation/screens/SalesScreen').then(m => ({ default: m.SalesScreen }))
);
const MarketingScreen = React.lazy(() =>
  import('../../features/marketing/presentation/screens/MarketingScreen').then(m => ({ default: m.MarketingScreen }))
);
const HRShell = React.lazy(() =>
  import('../../features/hr/HRShell').then(m => ({ default: m.HRShell }))
);
const AgencyScreen = React.lazy(() =>
  import('../../features/agency/screens/AgencyScreen').then(m => ({ default: m.AgencyScreen }))
);
const SHomesScreen = React.lazy(() =>
  import('../../features/shomes/screens/SHomesScreen').then(m => ({ default: m.SHomesScreen }))
);
const ProjectScreen = React.lazy(() =>
  import('../../features/project/presentation/screens/ProjectDashboard').then(m => ({ default: m.ProjectDashboard }))
);
const FinanceScreen = React.lazy(() =>
  import('../../features/finance/presentation/screens/FinanceScreen').then(m => ({ default: m.FinanceScreen }))
);
const LegalScreen = React.lazy(() =>
  import('../../features/legal/screens/LegalScreen').then(m => ({ default: m.LegalScreen }))
);
const AdminShell = React.lazy(() =>
  import('../../features/admin/AdminShell').then(m => ({ default: m.AdminShell }))
);
const EmployeeProfileScreen = React.lazy(() =>
  import('../../features/hr/screens/EmployeeProfileScreen').then(m => ({ default: m.EmployeeProfileScreen }))
);
const AccessDeniedScreen = React.lazy(() =>
  import('./AccessDeniedScreen').then(m => ({ default: m.AccessDeniedScreen }))
);

// ── Loading Fallback ──
function ModuleLoadingFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.fallbackText}>Đang tải module...</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

// ── Web Linking Configuration ──
// This ensures that when a user tries to access a URL like /sales, React Navigation knows which screen to show.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['https://sgroup.vn', 'sgroup-erp://', 'http://localhost:3000'],
  config: {
    screens: {
      Login: 'login',
      Workspace: 'workspace',
      BDHModule: 'bdh',
      SalesModule: 'sales',
      MarketingModule: 'marketing',
      HRModule: 'hr',
      AgencyModule: 'agency',
      SHomesModule: 'shomes',
      ProjectModule: 'project',
      FinanceModule: 'finance',
      LegalModule: 'legal',
      AdminModule: 'admin',
      EmployeeProfile: 'employee/:id',
      AccessDenied: 'access-denied',
    },
  },
};

export function AppNavigator() {
  const user = useAuthStore((s) => s.user);
  const restore = useAuthStore((s) => s.restore);

  React.useEffect(() => {
    restore();
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <Suspense fallback={<ModuleLoadingFallback />}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="Workspace" component={WorkspaceScreen} />
              <Stack.Screen name="BDHModule" component={BDHShell} />
              <Stack.Screen name="SalesModule" component={SalesScreen} />
              <Stack.Screen name="MarketingModule" component={MarketingScreen} />
              <Stack.Screen name="HRModule" component={HRShell} />
              <Stack.Screen name="AgencyModule" component={AgencyScreen} />
              <Stack.Screen name="SHomesModule" component={SHomesScreen} />
              <Stack.Screen name="ProjectModule" component={ProjectScreen} />
              <Stack.Screen name="FinanceModule" component={FinanceScreen} />
              <Stack.Screen name="LegalModule" component={LegalScreen} />
              <Stack.Screen name="AdminModule" component={AdminShell} />
              <Stack.Screen name="EmployeeProfile" component={EmployeeProfileScreen} />
              <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
            </>
          )}
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  fallbackText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    fontFamily: Platform.OS === 'web' ? "'Plus Jakarta Sans', system-ui, sans-serif" : undefined,
  },
});
