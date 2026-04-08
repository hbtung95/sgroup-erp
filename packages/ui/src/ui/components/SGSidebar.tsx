import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme, typography, sgds, spacing, animations, radius } from '../../theme/theme';
import { SGIcons } from './SGIcons';

interface SidebarSection { title?: string; items: SidebarItemConfig[] }
interface SidebarItemConfig { key: string; label: string; icon: string | any; desc?: string }

interface Props {
  sections: SidebarSection[];
  activeKey: string;
  onSelect: (key: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export function SGSidebar({ sections, activeKey, onSelect, collapsed, onToggleCollapse, header, footer, style }: Props) {
  const c = useTheme();
  const w = collapsed ? 78 : 264;

  const renderIcon = (icon: any, color: string) => {
    if (typeof icon === 'string') {
      const IconCmp = (SGIcons as any)[icon];
      return IconCmp ? <IconCmp size={18} color={color} /> : <Text style={{ color }}>•</Text>;
    }
    const IconCmp = icon;
    return <IconCmp size={18} color={color} />;
  };

  return (
    <View style={[styles.sidebar, {
      width: w, 
      backgroundColor: c.bgSidebar, 
      borderColor: c.glassBorder,
    }, Platform.OS === 'web' && ({ 
      ...sgds.transition.normal, 
      boxShadow: `0 0 40px ${c.shadow}`,
      borderRightWidth: 1,
    } as any), style]}>
      
      {header && <View style={styles.header}>{header}</View>}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            {!collapsed && section.title && (
              <Text style={[typography.micro, styles.sectionTitle, { color: c.textTertiary }]}>
                {section.title}
              </Text>
            )}
            <View style={styles.list}>
              {section.items.map(item => {
                const active = item.key === activeKey;
                const iconColor = active ? '#ffffff' : c.textSecondary;

                return (
                  <Pressable key={item.key}
                    onPress={() => onSelect(item.key)}
                    {...(Platform.OS === 'web' ? { className: `sg-side-item ${active ? 'is-active' : ''}` } : {}) as any}
                    style={({ hovered }: any) => [
                      styles.item,
                      {
                        backgroundColor: active ? 'rgba(79,124,255,0.08)' : 'transparent',
                        borderColor: active ? 'rgba(79,124,255,0.30)' : 'transparent',
                      },
                      Platform.OS === 'web' && ({
                        transition: `all ${animations.duration.base}ms ${animations.ease.smooth}`,
                        transform: hovered && !active ? 'translateY(-1px)' : 'none',
                      } as any)
                    ]}>
                    
                    {/* Active Indicator Bar */}
                    {active && <View style={[styles.activeIndicator, { backgroundColor: c.brand }]} />}

                    <View style={styles.iconBox}>
                      {renderIcon(item.icon, iconColor)}
                    </View>

                    {!collapsed && (
                      <View style={styles.labelBox}>
                        <Text style={[
                          typography.smallBold, 
                          { color: active ? '#ffffff' : c.textSecondary, fontSize: 13 }
                        ]}>
                          {item.label}
                        </Text>
                        {item.desc && (
                          <Text style={[typography.micro, { color: c.textTertiary, marginTop: 2 }]}>
                            {item.desc}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Sweep Effect CSS */}
                    {Platform.OS === 'web' && (
                      <style>{`
                        .sg-side-item { position: relative; overflow: hidden; }
                        .sg-side-item:after {
                          content: ""; position: absolute; inset: -50% -100%;
                          background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.08) 45%, transparent 55%);
                          transform: translateX(-20%) rotate(12deg);
                          opacity: 0; pointer-events: none; transition: all 0.4s ease;
                        }
                        .sg-side-item:hover:after { opacity: 1; transform: translateX(20%) rotate(12deg); }
                        
                        .sg-side-item.is-active {
                          background: radial-gradient(100% 120% at 0% 0%, rgba(79,124,255,0.25), transparent 70%), 
                                      linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)), 
                                      rgba(255,255,255,0.08) !important;
                          box-shadow: 0 12px 32px rgba(79,124,255,0.15), inset 0 1px 0 rgba(255,255,255,0.15) !important;
                        }
                      `}</style>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {footer && <View style={styles.footer}>{footer}</View>}

      <Pressable style={[styles.toggle, { backgroundColor: c.bgElevated, borderColor: c.glassBorder }]} 
                 onPress={onToggleCollapse}>
        {collapsed ? <ChevronRight size={14} color={c.textSecondary} /> : <ChevronLeft size={14} color={c.textSecondary} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { position: 'relative', height: '100%', paddingVertical: 12 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 10 },
  section: { marginBottom: 20 },
  sectionTitle: {
    paddingHorizontal: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  list: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    left: 4,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 99,
    shadowColor: '#4f7cff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  iconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelBox: {
    flex: 1,
  },
  footer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggle: { 
    position: 'absolute', 
    right: -14, 
    top: '50%', 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    borderWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 100,
  },
});
