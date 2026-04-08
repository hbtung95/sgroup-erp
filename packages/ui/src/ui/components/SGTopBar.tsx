import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform, TextInput } from 'react-native';
import { LogOut, Search, Bell } from 'lucide-react-native';
import { useTheme, typography, sgds, spacing, radius, animations } from '../../theme/theme';
import { SGAvatar } from './SGAvatar';
import { SGThemeToggle } from './SGThemeToggle';
import { SGIcons } from './SGIcons';

interface Props {
  title?: string;
  breadcrumb?: React.ReactNode;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onLogout?: () => void;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

export function SGTopBar({ title, breadcrumb, userName, userRole, userAvatar, onLogout, leftContent, rightContent, style }: Props) {
  const c = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <View style={[styles.bar, { backgroundColor: c.bgTopBar, borderBottomColor: c.glassBorder },
      Platform.OS === 'web' && ({ ...sgds.glass, boxShadow: `0 4px 20px ${c.shadow}` } as any), style]}>
      
      {/* --- Left: Title & Breadcrumb --- */}
      <View style={styles.left}>
        {leftContent}
        <View style={styles.titleStack}>
           {breadcrumb}
           {title && <Text style={[typography.h3, { color: c.text, marginTop: 2 }]}>{title}</Text>}
        </View>
      </View>

      {/* --- Center: Smart Search (Web Only Style) --- */}
      {Platform.OS === 'web' && (
        <View style={[
          styles.searchBox, 
          { backgroundColor: c.bgInput, borderColor: searchFocused ? c.brand : c.glassBorder }
        ]}>
          <Search size={16} color={c.textTertiary} style={{ marginRight: 8 }} />
          <TextInput 
            placeholder="Tìm kiếm nhanh... (⌘K)" 
            placeholderTextColor={c.textDisabled}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={[styles.searchInput, { color: c.text } as any]}
          />
          <View style={[styles.searchKbd, { backgroundColor: c.bgElevated, borderColor: c.glassBorder }]}>
            <Text style={[typography.micro, { color: c.textSecondary }]}>⌘K</Text>
          </View>
        </View>
      )}

      {/* --- Right: Global Actions --- */}
      <View style={styles.right}>
        {rightContent}
        
        {/* Activity Indicator / Notifications */}
        <Pressable style={({ hovered }: any) => [
          styles.actionBtn, 
          { backgroundColor: c.glass },
          Platform.OS === 'web' && hovered && { backgroundColor: c.glassHover } as any
        ]}>
          <Bell size={20} color={c.textSecondary} />
          <View style={[styles.badgeDot, { backgroundColor: c.brand }]} />
        </Pressable>

        <View style={styles.divider} />

        <SGThemeToggle size="sm" />

        <View style={styles.divider} />

        {/* User info */}
        {userName && (
          <View style={styles.userInfo}>
            <View style={styles.userText}>
              <Text style={[typography.smallBold, { color: c.text, textAlign: 'right' }]}>{userName}</Text>
              {userRole && <Text style={[typography.caption, { color: c.textTertiary, textAlign: 'right' }]}>{userRole}</Text>}
            </View>
            <SGAvatar name={userName} imageUrl={userAvatar} size="md" status="online" />
          </View>
        )}

        {onLogout && (
          <Pressable style={[styles.iconBtn, { backgroundColor: 'rgba(212,32,39,0.1)' }]} onPress={onLogout}>
            <LogOut size={16} color={c.danger} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: spacing.xl, 
    height: 64,
    borderBottomWidth: 1,
    zIndex: 1000,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  titleStack: { flexDirection: 'column' },
  
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: 320, 
    height: 38, 
    borderRadius: 12, 
    borderWidth: 1, 
    paddingHorizontal: 12,
    marginHorizontal: 20,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } : {}) as any,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '500', outlineStyle: 'none' } as any,
  searchKbd: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },

  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badgeDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: '#000' },
  
  divider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 },
  userText: { justifyContent: 'center' },
});
