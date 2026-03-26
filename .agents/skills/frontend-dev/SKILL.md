---
name: Frontend Development (React Native / Expo)
description: Skill for developing React Native / Expo frontend components in the SGROUP ERP project
---

# Frontend Development Skill — SGROUP ERP

## Tech Stack
- **Framework**: React Native 0.83 + Expo SDK 55
- **Navigation**: React Navigation v7 (native-stack + bottom-tabs)
- **State Management**: Zustand v5
- **Data Fetching**: TanStack React Query v5
- **HTTP Client**: Axios
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated v4
- **Fonts**: Plus Jakarta Sans (Google Fonts via expo-font)
- **Styling**: React Native StyleSheet (no Tailwind)
- **Platform**: Universal (iOS, Android, Web via react-native-web)

## Project Structure

```
src/
├── core/           # App-level config, providers, navigation
├── features/       # Feature modules (Feature-Sliced Design)
│   └── <feature>/
│       ├── domain/        # Entities, Pure Business Logic, Models
│       ├── application/   # Zustand stores, React Query Hooks, Use Cases
│       ├── infrastructure/# API calls (Axios), DTO to Domain mapping
│       └── presentation/  # Smart/Dumb UI components and Screens
├── shared/         # Shared components, hooks, utils
└── system/         # System-level configs, themes

## Core Architecture Principle: Clean Feature-Sliced Design
1. **Separation of Concerns within Features:** UI (`presentation`) only renders data and dispatches actions. Data fetching and state changes are handled by `application`. 
2. **Infrastructure limits:** `infrastructure` translates external backend data (DTOs) into frontend `domain` models.
3. **No logic leak:** React components MUST NOT contain complex business rules or raw API configurations.
```

## Coding Standards

### Component Pattern
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
```

### Zustand Store Pattern
```tsx
import { create } from 'zustand';

interface MyStore {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}));
```

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `SalesDashboard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useSalesData.ts`)
- Stores: `camelCase.ts` with `use` prefix + `Store` suffix (e.g., `useSalesStore.ts`)
- Types: `camelCase.ts` (e.g., `salesTypes.ts`)
- Utils: `camelCase.ts` (e.g., `formatCurrency.ts`)

### ID Generation
- Use UUID v7 for all entity identifiers: `import { v7 as uuidv7 } from 'uuid';`

## Key Patterns

### Navigation
```tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Detail: { id: string };
};

const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
navigation.navigate('Detail', { id: '123' });
```

### Responsive Design
- Use `Dimensions.get('window')` or `useWindowDimensions()` for responsive layouts
- Always support web via `react-native-web` — avoid platform-specific code unless necessary
- Use `Platform.OS` checks only when truly needed

### Animations
```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

## Defensive Data Handling (from Bug-fixing Experience)

### ⚠️ CRITICAL: Always validate API response data before use

API responses may return `data` directly as an array, or wrapped as `{ data: [...] }`.
NEVER assume the shape — always normalize:

```tsx
// ✅ SAFE: Normalize API response (handles both formats)
const rawData = response.data;
const items = Array.isArray(rawData)
  ? rawData
  : (Array.isArray(rawData?.data) ? rawData.data : []);

// ❌ UNSAFE: Assumes response is always an array
const items = response.data; // CRASH if response is { data: [...] }
items.map(i => ...); // TypeError: items.map is not a function
```

### ⚠️ CRITICAL: Array.isArray() before .map(), .filter(), .find()

```tsx
// ✅ SAFE
const allStaff = Array.isArray(rawStaff)
  ? rawStaff
  : (Array.isArray((rawStaff as any)?.data) ? (rawStaff as any).data : []);

// ✅ SAFE: Default to empty array
const deals = Array.isArray(dealsData) ? dealsData : [];
const safeKpiCards = Array.isArray(kpiCards) ? kpiCards : [];
```

### Safe Property Access

```tsx
// ✅ Optional chaining + nullish coalescing
const teamName = staff?.team?.name ?? 'Chưa phân team';
const revenue = deal?.amount?.toLocaleString() ?? '0';
const items = response?.data?.items ?? [];

// ❌ UNSAFE: Will crash on null/undefined
const teamName = staff.team.name; // TypeError if staff.team is null
```

## Error Boundary Pattern

Every feature module MUST wrap its content in an ErrorBoundary:

```tsx
// features/<module>/components/<Module>ErrorBoundary.tsx
import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ModuleErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <AlertTriangle size={40} color="#ef4444" />
          <Text>Đã xảy ra lỗi. Vui lòng thử lại.</Text>
          <TouchableOpacity onPress={this.handleReset}>
            <RefreshCw size={18} color="#fff" />
            <Text>Thử Lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Usage in Shell/Navigator:
<ModuleErrorBoundary>
  <ModuleScreen />
</ModuleErrorBoundary>
```

## Common Bug Patterns & Prevention

| Bug | Root Cause | Prevention |
|-----|-----------|------------|
| `_.find is not a function` | API returns object, not array | `Array.isArray()` check |
| `Cannot read property of undefined` | Missing optional chaining | Use `?.` and `?? default` |
| Page crash after login | ErrorBoundary not wrapping module | Wrap every module route |
| 403 Forbidden crash | Frontend not handling auth errors | Check `error.response?.status` |
| Token expired loop | 401 not triggering logout | Axios interceptor with auto-logout |
| Empty page (no error) | Data fetch failed silently | Always show `SGEmptyState` on error |
| Stale data after navigation | Store not clearing on unmount | Reset store in `useEffect` cleanup |
| Duplicate renders | Missing `React.memo` or `useCallback` | Memoize expensive components |

## Don'ts
- ❌ Don't use inline styles — always use `StyleSheet.create()`
- ❌ Don't import from `node_modules` directly — use package exports
- ❌ Don't use `any` type — always define proper TypeScript interfaces
- ❌ Don't hardcode colors — use theme constants from `system/`
- ❌ Don't use `console.log` in production code
- ❌ Don't call `.map()` / `.filter()` / `.find()` without `Array.isArray()` guard
- ❌ Don't assume API response shape — always normalize
- ❌ Don't skip ErrorBoundary for feature modules
- ❌ Don't ignore 401/403 errors — handle auth failures gracefully


## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/frontend-architecture-rules.md` and `docs/architecture/api-architecture-rules.md`. Any violation of the 7 Red Flags in that document will result in severe consequences. Ensure Clean Architecture, FSD, and React Query/Zustand boundaries are rigidly maintained.