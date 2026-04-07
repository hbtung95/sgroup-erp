---
name: UI/UX Design Pro Max
description: Comprehensive SGroup Design System (SGDS) — theme architecture, 78+ component catalog, glassmorphism, animations, accessibility, data visualization, and advanced patterns for SGROUP ERP
---

# UI/UX Design Skill — Pro Max Edition

> **SGDS — SGroup Design System**: A premium, cohesive design system powering all SGROUP ERP surfaces.

---

## 1 · Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Premium First** | Every screen should feel like a high-end SaaS product — never a basic admin panel |
| **Dark-Native** | Dark theme is the primary experience; light theme is equally polished |
| **Glass & Depth** | Use glassmorphism, layered surfaces, and subtle glows to create depth |
| **Alive & Responsive** | Micro-animations, spring physics, and hover states make the UI feel alive |
| **Consistent Tokens** | Every color, spacing, and radius MUST come from `theme.ts` — no hardcoded values |
| **Component-Driven** | Prefer existing SG* components over custom implementations |

---

## 2 · Theme Architecture

### File Map
```
src/shared/theme/
├── theme.ts          # Palette, tokens (dark/light), typography, spacing, radius, animations, sgds
├── themeStore.ts      # Zustand store: isDark, toggleTheme
└── useAppTheme.ts     # Bridge hook: { theme, isDark, toggleTheme, colors }
```

### Usage Pattern
```tsx
import { useAppTheme } from '@/shared/theme/useAppTheme';
import { typography, spacing, radius, sgds, animations } from '@/shared/theme/theme';

const { theme, isDark, toggleTheme, colors } = useAppTheme();

// Colors (ThemeColors interface) — reactive to dark/light
colors.bg          // Background base
colors.brand       // Brand accent (#0ea5e9 dark / #0284c7 light)
colors.glass       // Glass surface
colors.gradientBrand // ['#0ea5e9', '#06b6d4']

// Typography presets
typography.h1      // { fontSize: 26, fontWeight: '700', lineHeight: 32, ... }
typography.body    // { fontSize: 14, fontWeight: '400', lineHeight: 21, ... }

// Spacing & Radius
spacing.lg         // 24
radius.lg          // 16

// SGDS helpers
sgds.glass         // { backdropFilter: 'blur(20px)' } on web
sgds.transition.normal  // { transition: 'all 300ms ...' } on web
sgds.sectionBase(theme) // Glass section with border + blur
```

### Theme Mapping (`useAppTheme`)
```tsx
// theme.colors (legacy compat) → colors (ThemeColors)
theme.colors.background     → colors.bg
theme.colors.backgroundCard → colors.bgCard
theme.colors.textPrimary    → colors.text
theme.colors.textSecondary  → colors.textSecondary
theme.colors.borderSubtle   → colors.border
theme.colors.accentCyan     → colors.brand
theme.colors.accentBlue     → colors.accent
```

---

## 3 · Color System

### 3.1 Palette (`palette` in theme.ts)
```
Neutrals          Brand & Accents           Status Colors
─────────         ────────────────          ──────────────
gray50:  #F8FAFC  brand500: #3B82F6         green400: #22C55E (success)
gray100: #F1F5F9  brand600: #2563EB         red400:   #EF4444 (danger)
gray200: #E2E8F0  accentBlue: #0ea5e9 ★     orange400:#EAB308 (warning)
gray400: #94A3B8  accentCyan: #06b6d4
gray500: #64748B  accentIndigo: #6366f1     Dark Backgrounds
gray600: #475569  accentPurple: #a855f7     darkDeep: #080a0f
gray900: #0F172A                            dark50:   #1A1F2E
```

### 3.2 Semantic Tokens (Dark Theme)
| Token | Value | Purpose |
|-------|-------|---------|
| `bg` | `#080a0f` | Page background |
| `bgSecondary` | `rgba(20, 24, 35, 0.6)` | Glass surface |
| `bgCard` | `rgba(255,255,255,0.04)` | Card background |
| `bgElevated` | `rgba(28, 32, 45, 0.9)` | Elevated panel |
| `bgGlow` | `rgba(14, 165, 233, 0.06)` | Subtle glow area |
| `text` | `#FFFFFF` | Primary text |
| `textSecondary` | `#94A3B8` | Secondary text |
| `textTertiary` | `#64748B` | Muted text |
| `textDisabled` | `#475569` | Disabled text |
| `border` | `rgba(255, 255, 255, 0.08)` | Subtle border |
| `borderStrong` | `rgba(255, 255, 255, 0.15)` | Prominent border |
| `brand` | `#0ea5e9` | Primary brand (Sky Blue) |
| `brandLight` | `#38bdf8` | Lighter brand variant |
| `glass` | `rgba(20, 24, 35, 0.6)` | Glass panel background |
| `glassBorder` | `rgba(255, 255, 255, 0.08)` | Glass border |

### 3.3 Gradients
```tsx
gradientBrand:   ['#0ea5e9', '#06b6d4']   // Brand → Cyan
gradientAccent:  ['#0ea5e9', '#06b6d4']   // Accent flow
gradientGold:    ['#F59E0B', '#FBBF24']   // Achievement, premium
gradientSuccess: ['#22c55e', '#4ade80']   // Positive metrics
gradientDanger:  ['#ef4444', '#f87171']   // Alerts, negative
gradientPurple:  ['#6366f1', '#a855f7']   // Special / featured
gradientDark:    ['#080a0f', '#1c202d']   // Dark depth
gradientSurface: ['rgba(14,165,233,0.08)', 'rgba(99,102,241,0.05)'] // Subtle shimmer
```

### 3.4 Aurora (Ambient Background Effects)
```tsx
aurora: [
  'rgba(14, 165, 233, 0.15)',  // Sky blue glow
  'rgba(99, 102, 241, 0.15)',  // Indigo glow
  'rgba(6, 182, 212, 0.1)',    // Cyan glow
]
// Use with SGAuroraBackground for immersive page backgrounds
```

### 3.5 Shadow Tokens
```tsx
shadow:      'rgba(0,0,0,0.4)'              // Standard elevation
shadowStrong:'rgba(0,0,0,0.6)'              // High elevation
shadowGlow:  'rgba(14, 165, 233, 0.25)'     // Brand glow
cardGlow:    'rgba(14, 165, 233, 0.12)'     // Subtle card glow
```

---

## 4 · Typography System

### Font Family
- **Primary**: Plus Jakarta Sans (native), Inter (web fallback)
- **Monospace**: JetBrains Mono (web), SpaceMono (native)
- Access via `getFont()` helper for cross-platform rendering

### Type Scale
| Preset | Size | Weight | Line Height | Use Case |
|--------|------|--------|-------------|----------|
| `hero` | 42px | 800 ExtraBold | 50 | Page hero titles |
| `h1` | 26px | 700 Bold | 32 | Section titles |
| `h2` | 18px | 600 SemiBold | 24 | Card titles |
| `h3` | 15px | 600 SemiBold | 21 | Sub-headings |
| `h4` | 14px | 600 SemiBold | 20 | Small headings |
| `body` | 14px | 400 Regular | 21 | Body text |
| `bodyBold` | 14px | 600 SemiBold | 21 | Emphasized body |
| `small` | 13px | 400 Regular | 19 | Secondary content |
| `smallBold` | 13px | 600 SemiBold | 19 | Labels |
| `caption` | 11px | 500 Medium | 16 | Captions, hints |
| `label` | 12px | 600 SemiBold | — | UPPERCASE labels (0.6 spacing) |
| `micro` | 10px | 700 Bold | — | UPPERCASE badges (1.0 spacing) |
| `mono` | 13px | — | — | Code, numbers |

### Font Weight Map
```tsx
fontWeight.black     // '900'
fontWeight.extrabold // '800'
fontWeight.bold      // '700'
fontWeight.semibold  // '600'
fontWeight.medium    // '500'
fontWeight.regular   // '400'
```

---

## 5 · Spacing & Layout

### Spacing Scale (4px base grid)
| Token | Value | CSS Equivalent |
|-------|-------|---------------|
| `xs` | 4px | `sg-sp-1` |
| `sm` | 8px | `sg-sp-2` |
| `md` | 12px | `sg-sp-3` |
| `base` | 16px | `sg-sp-4` |
| `lg` | 24px | `sg-sp-5` |
| `xl` | 32px | `sg-sp-6` |
| `2xl` | 48px | `sg-sp-8` |
| `3xl` | 64px | — |
| `4xl` | 80px | — |

### Layout Constants
```tsx
sgds.layout.contentPadding  // 32px — page content horizontal padding
sgds.layout.sectionGap      // 32px — gap between major sections
```

### Section Base Pattern
```tsx
// Standard glass section container
const sectionStyle = sgds.sectionBase(theme);
// Returns: { backgroundColor, borderRadius: 28, padding: 32, borderWidth: 1,
//            borderColor, backdropFilter (web) }
```

---

## 6 · Border Radius
| Token | Value | Use Case |
|-------|-------|----------|
| `xs` | 6px | Small interactive elements |
| `sm` | 8px | Buttons, inputs, chips |
| `md` | 12px | Cards, dropdowns |
| `lg` | 16px | Modals, large cards |
| `xl` | 24px | Panels, sheets |
| `2xl` | 32px | Hero sections |
| `pill` | 9999px | Pills, avatars, tags |

---

## 7 · Component Library (78 Components)

> All components live in `src/shared/ui/components/SG*.tsx`
> Import: `import { SGButton } from '@/shared/ui/components/SGButton';`

### 7.1 Layout & Structure
| Component | Purpose |
|-----------|---------|
| `SGPageContainer` | Full-page wrapper with safe area and background |
| `SGPageHeader` | Page title + breadcrumb + actions |
| `SGSection` | Glass section container (uses `sgds.sectionBase`) |
| `SGSectionHeader` | Section title with optional action link |
| `SGGrid` | Responsive grid layout |
| `SGSpacer` | Spacing utility component |
| `SGDivider` | Horizontal/vertical divider |
| `SGSidebar` | Navigation sidebar |
| `SGTopBar` | Top navigation bar (glass blur) |
| `SGBottomBar` | Mobile bottom tab bar |
| `SGDrawer` | Slide-out drawer panel |
| `SGAuroraBackground` | Ambient animated aurora gradient background |
| `SGHeroBanner` | Hero section with gradient + CTA |

### 7.2 Data Display
| Component | Purpose |
|-----------|---------|
| `SGCard` | Standard content card (glass variant available) |
| `SGStatCard` | Stat/metric card with value + label + change |
| `SGGradientStatCard` | Stat card with gradient background |
| `SGKpiCard` | KPI card with icon, trend, and sparkline |
| `SGProjectCard` | Project summary card |
| `SGKeyValue` | Key-value pair display |
| `SGMetricRow` | Row of inline metrics |
| `SGValueDisplay` | Large formatted value with label |
| `SGAvatar` | User avatar with fallback initials |
| `SGBadge` | Numeric badge / notification count |
| `SGTag` | Colored tag / label |
| `SGChip` | Interactive chip (selectable/dismissible) |
| `SGStatusBadge` | Status indicator (dot + label) |
| `SGListItem` | Standard list row item |
| `SGTimeline` | Timeline / activity feed |
| `SGTable` | Data table with sorting |
| `SGDataGrid` | Advanced data grid |
| `SGAccordion` | Expandable sections |
| `SGCountdown` | Countdown timer display |
| `SGRating` | Star / score rating display |
| `SGScenarioBar` | Planning scenario comparison bar |

### 7.3 Inputs & Forms
| Component | Purpose |
|-----------|---------|
| `SGInput` | Text input with label + validation |
| `SGTextArea` | Multi-line text input |
| `SGSelect` | Dropdown select |
| `SGCheckbox` | Checkbox with label |
| `SGRadioGroup` | Radio button group |
| `SGSwitch` | Toggle switch |
| `SGSlider` | Range slider |
| `SGDatePicker` | Date/time picker |
| `SGCurrencyInput` | Formatted currency input |
| `SGNumberInput` | Number with increment/decrement |
| `SGPlanningNumberField` | Specialized planning number stepper |
| `SGSearchBar` | Search input with icon |
| `SGFileUpload` | File drag & drop / picker |
| `SGField` | Form field wrapper (label + error + hint) |

### 7.4 Actions & Navigation
| Component | Purpose |
|-----------|---------|
| `SGButton` | Primary/secondary/ghost/danger button variants |
| `SGIconButton` | Icon-only circular button |
| `SGCopyButton` | Copy-to-clipboard button |
| `SGPillSelector` | Horizontal pill tab selector |
| `SGTabs` | Tab navigation |
| `SGBreadcrumb` | Breadcrumb trail |
| `SGPagination` | Page navigation |
| `SGStepIndicator` | Step/wizard progress indicator |
| `SGStepper` | Numeric stepper |

### 7.5 Feedback & Overlay
| Component | Purpose |
|-----------|---------|
| `SGModal` | Standard modal dialog |
| `SGBottomSheet` | Bottom sheet (mobile) |
| `SGConfirmDialog` | Confirmation dialog (destructive actions) |
| `SGAlert` | Inline alert/banner |
| `SGToast` | Toast notification |
| `SGTooltip` | Tooltip on hover/press |
| `SGPopover` | Popover dropdown |
| `SGLoadingOverlay` | Full-screen loading state |
| `SGSkeleton` | Content skeleton placeholder |
| `SGEmptyState` | Empty state illustration + CTA |
| `SGNotificationBell` | Notification indicator |
| `SGProgressBar` | Horizontal progress bar |

### 7.6 Data Visualization
| Component | Purpose |
|-----------|---------|
| `SGBarChart` | Bar chart (vertical/horizontal) |
| `SGDonutChart` | Donut/ring chart |
| `SGMiniChart` | Inline mini sparkline |
| `SGSparkline` | Sparkline trend line |
| `SGCircularProgress` | Circular progress ring |

### 7.7 Design System Utilities
| Component | Purpose |
|-----------|---------|
| `SGIcons` | Lucide icon wrapper + custom icons |
| `SGThemeToggle` | Dark/light theme toggle |
| `SGPlanningSectionTitle` | Planning module section title |
| `SGAPIClient` | Centralized API client |

---

## 8 · Glass & Depth System

### Glassmorphism Pattern
```tsx
// Basic glass surface
const glassStyle = {
  backgroundColor: colors.glass,           // rgba(20, 24, 35, 0.6)
  borderWidth: 1,
  borderColor: colors.glassBorder,         // rgba(255, 255, 255, 0.08)
  borderRadius: radius.lg,                 // 16
  ...sgds.glass,                           // backdropFilter: 'blur(20px)' on web
};

// Heavy glass (more opaque)
const heavyGlass = {
  backgroundColor: colors.glassHeavy,      // rgba(28, 32, 45, 0.8)
  ...sgds.glass,
};

// Glass with hover on web
const interactiveGlass = {
  backgroundColor: colors.glass,
  ...sgds.glass,
  ...sgds.transition.fast,                 // smooth hover transition
  // On hover: backgroundColor → colors.glassHover
};
```

### Depth Layers (back to front)
```
Layer 0: colors.bg (#080a0f) — page background
Layer 1: SGAuroraBackground — ambient aurora glow
Layer 2: colors.glass — glass panels
Layer 3: colors.glassHeavy — elevated glass
Layer 4: colors.bgElevated — modals, sheets
Layer 5: SGToast, SGPopover — overlay elements
```

### Shadow Application
```tsx
// Standard card
shadowColor: colors.shadow,
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 1,
shadowRadius: 12,
elevation: 8,

// Glow card (brand accent)
shadowColor: colors.shadowGlow,
shadowOffset: { width: 0, height: 0 },
shadowOpacity: 1,
shadowRadius: 20,
```

---

## 9 · Animation System

### 9.1 Spring Configurations (React Native Reanimated v4)
```tsx
import { withSpring, withTiming, Easing } from 'react-native-reanimated';

// Button press — snappy feedback
withSpring(0.97, { damping: 15, stiffness: 150 });

// Card entry — smooth slide up
withSpring(0, { damping: 20, stiffness: 90 });

// Modal enter — gentle bounce
withSpring(1, { damping: 25, stiffness: 120 });

// Number counter — smooth counting
withTiming(targetValue, { duration: 800, easing: Easing.out(Easing.exp) });
```

### 9.2 Timing Presets
| Action | Duration | Config |
|--------|----------|--------|
| Button press | 100ms | `spring(damping: 15)` |
| Hover state | 150ms | `ease.snappy` |
| Card appear | 300ms | `spring(damping: 20, stiffness: 90)` |
| Modal enter | 350ms | `spring(damping: 25)` |
| Page transition | 250ms | `ease.smooth` |
| Number count | 800ms | `Easing.out(Easing.exp)` |
| Skeleton shimmer | 1500ms | `linear, infinite` |
| Stagger list | 50ms delay between items | `withDelay(index * 50, ...)` |

### 9.3 CSS Easing Curves (`animations.ease` in theme.ts)
```tsx
elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'   // Overshoot bounce
squish:  'cubic-bezier(0.34, 1.56, 0.64, 1)'          // Squish rebound
smooth:  'cubic-bezier(0.4, 0.0, 0.2, 1)'             // Material Design standard
snappy:  'cubic-bezier(0.25, 0.1, 0.25, 1.0)'         // Quick, responsive
```

### 9.4 Web Transitions (`sgds.transition`)
```tsx
sgds.transition.fast    // 150ms snappy — hover, active states
sgds.transition.normal  // 300ms smooth — general transitions
sgds.transition.slow    // 500ms smooth — complex animations
```

### 9.5 Staggered List Entry Pattern
```tsx
const AnimatedItem = ({ index, children }) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 50;
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 90 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
};
```

---

## 10 · Data Visualization Guidelines

### Chart Color Palette (in order of priority)
```tsx
const chartColors = [
  colors.brand,       // #0ea5e9 — primary series
  colors.purple,      // #a855f7 — secondary series
  colors.success,     // #22C55E — positive / success
  colors.accentCyan,  // #06b6d4 — tertiary
  colors.warning,     // #EAB308 — caution
  colors.danger,      // #EF4444 — negative
];
```

### Chart Guidelines
- Always use `colors.textSecondary` for axis labels
- Grid lines: `colors.border` (subtle, never distracting)
- Use `SGMiniChart` / `SGSparkline` for inline trend indicators
- Use `SGDonutChart` for proportional data (max 6 segments)
- Use `SGBarChart` for comparison data
- Use `SGCircularProgress` for single KPI (0-100%)
- Animate values with `withTiming` (800ms, `Easing.out(Easing.exp)`)
- Always include empty states: `SGEmptyState` when no data

---

## 11 · Responsive Design

### Breakpoints
```tsx
import { useWindowDimensions, Platform } from 'react-native';

const { width } = useWindowDimensions();
const isMobile  = width < 768;
const isTablet  = width >= 768 && width < 1024;
const isDesktop = width >= 1024;
const isWide    = width >= 1440;
```

### Layout Rules
| Viewport | Content Width | Sidebar | Grid Cols |
|----------|---------------|---------|-----------|
| Mobile (<768px) | 100% | Hidden / Drawer | 1-2 |
| Tablet (768-1023) | 100% | Collapsible | 2-3 |
| Desktop (1024-1439) | 100% | Always visible | 3-4 |
| Wide (1440+) | max 1400px centered | Always visible | 4-6 |

### Platform-Specific Patterns
```tsx
// Web-only features (use sgds helpers)
...(Platform.OS === 'web' ? {
  cursor: 'pointer',
  ...sgds.glass,           // backdrop-filter
  ...sgds.transition.fast, // CSS transitions
} : {}),

// Mobile-only features
...(Platform.OS !== 'web' ? {
  elevation: 8,  // Android shadow
} : {}),
```

---

## 12 · Accessibility

### Touch Targets
- Minimum **44×44px** for all interactive elements
- Use `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` for small icons

### Contrast Ratios
- `text` on `bg` → ≥ 7:1 (AAA) ✅
- `textSecondary` on `bg` → ≥ 4.5:1 (AA) ✅
- `brand` on `bg` → ≥ 4.5:1 (AA) ✅
- Never use `textTertiary` or `textDisabled` for essential content

### Screen Readers
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Delete project"
  accessibilityHint="Removes this project permanently"
>
```

### Motion Sensitivity
- Respect system `reduceMotion` preference
- Use `withSpring` / `withTiming` from Reanimated (auto-respects accessibility settings)
- Provide `reduced-motion` fallbacks for critical animations

---

## 13 · Icon System (Lucide React Native)

### Usage
```tsx
import { Bell, Settings, ChevronRight } from 'lucide-react-native';

<Bell size={20} color={colors.textSecondary} strokeWidth={1.5} />
```

### Size Conventions
| Context | Size | Stroke Width |
|---------|------|-------------|
| Inline with text | 16px | 2 |
| Button icon | 18-20px | 1.5 |
| Card icon | 20-24px | 1.5 |
| Navigation | 22-24px | 1.5 |
| Hero / empty state | 40-48px | 1 |

### Custom Icons
Use `SGIcons` for any custom icons not in Lucide.

---

## 14 · Advanced UI Patterns

### Skeleton Loading
```tsx
<SGSkeleton width={200} height={20} borderRadius={radius.sm} />
<SGSkeleton width="100%" height={120} borderRadius={radius.md} />
// Animate with shimmer effect (1500ms, linear, infinite loop)
```

### Empty States
```tsx
<SGEmptyState
  icon={<Inbox size={48} color={colors.textTertiary} strokeWidth={1} />}
  title="No projects yet"
  description="Create your first project to get started"
  action={{ label: "Create Project", onPress: handleCreate }}
/>
```

### Confirmation Dialogs
```tsx
<SGConfirmDialog
  visible={showConfirm}
  title="Delete Project"
  message="This action cannot be undone."
  confirmLabel="Delete"
  confirmVariant="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

### Toast Notifications
```tsx
<SGToast type="success" message="Changes saved successfully" />
<SGToast type="danger" message="Failed to upload file" />
<SGToast type="info" message="New update available" />
```

### Card with Glow Effect
```tsx
const glowCard = {
  ...sgds.sectionBase(theme),
  shadowColor: colors.shadowGlow,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 20,
};
```

---

## 15 · Performance Guidelines

### Rendering
- Use `React.memo()` for components receiving objects/arrays as props
- Use `useCallback()` for event handlers passed to child components
- Use `useMemo()` for expensive computations

### Lists
- Always use `FlatList` or `FlashList` for lists > 20 items
- Provide `keyExtractor` with UUID v7 IDs
- Use `getItemLayout` when item heights are fixed

### Images
- Use `expo-image` (with caching) instead of raw `<Image />`
- Provide `width` and `height` to avoid layout shifts
- No placeholder images — use `generate_image` tool to create real assets

### Animations
- Prefer `useAnimatedStyle()` on **UI thread** (Reanimated worklets)
- Avoid `setState` inside animation callbacks — use `runOnJS()` only when needed
- Use `cancelAnimation()` for cleanup in `useEffect` returns

---

## 16 · Do's & Don'ts

### ✅ Do
- Use `useAppTheme()` for all color access
- Use `typography.*` presets for all text styling
- Use `spacing.*` and `radius.*` tokens for layout
- Use existing SG* components before building custom ones
- Use `sgds.sectionBase(theme)` for section containers
- Use `sgds.glass` + `sgds.transition` for web effects
- Animate with Reanimated `withSpring` / `withTiming`
- Use `SGSkeleton` for loading states
- Use `SGEmptyState` for zero-data states
- Use `SGConfirmDialog` for destructive actions
- Generate images with `generate_image` — never leave placeholders
- Use UUID v7 for all entity IDs

### ❌ Don't
- Don't hardcode colors — always use `colors.*` tokens
- Don't use inline styles — always use `StyleSheet.create()`
- Don't use default system fonts — always use `typography.*`
- Don't use generic colors (plain red, blue, green) — use semantic tokens
- Don't create flat, boring interfaces — add depth with glass and glow
- Don't skip loading states — always show `SGSkeleton` while fetching
- Don't skip empty states — always show `SGEmptyState`
- Don't ignore touch feedback — every `Pressable` needs visual response
- Don't use `console.log` in production
- Don't use `any` type — define TypeScript interfaces
- Don't build new components when an SG* equivalent exists
- Don't forget bottom safe area on mobile


## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/ui-architecture-rules.md`. Neo-glassmorphism, component colocation, and strict Z-index / animation boundaries must be enforced.