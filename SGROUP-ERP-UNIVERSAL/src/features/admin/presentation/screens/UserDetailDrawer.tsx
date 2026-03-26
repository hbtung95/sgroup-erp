/**
 * UserDetailDrawer — Slide-in panel showing full user profile
 * Login history, active sessions (with force logout), password expiry status
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import {
  X, User, Mail, Shield, Clock, Key, Smartphone, LogOut, AlertTriangle,
  CheckCircle, XCircle, Activity, Calendar, Lock,
} from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { typography, spacing, sgds } from '../../../../shared/theme/theme';
import { SGButton } from '../../../../shared/ui/components/SGButton';
import { SGStatusBadge } from '../../../../shared/ui/components/SGStatusBadge';
import { SGSection } from '../../../../shared/ui/components/SGSection';
import { SGAvatar } from '../../../../shared/ui/components/SGAvatar';
import { SGSkeleton } from '../../../../shared/ui/components/SGSkeleton';
import { useUserDetail, useRevokeSession, useRevokeAllSessions } from '../../hooks/useAdmin';
import { getRoleStyle, METHOD_COLORS } from '../../constants/adminConstants';
import { formatRelativeDate, showToast } from '../../utils/adminUtils';

interface Props {
  userId: string | null;
  onClose: () => void;
}

export function UserDetailDrawer({ userId, onClose }: Props) {
  const { colors } = useAppTheme();
  const { data: user, isLoading } = useUserDetail(userId);
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllSessions();

  if (!userId) return null;

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId);
      showToast('Đã thu hồi phiên đăng nhập', 'success');
    } catch { showToast('Lỗi khi thu hồi session', 'error'); }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAll.mutateAsync(userId);
      showToast('Đã đăng xuất khỏi tất cả thiết bị', 'success');
    } catch { showToast('Lỗi', 'error'); }
  };

  const isLocked = user?.lockedUntil && new Date(user.lockedUntil) > new Date();
  const roleStyle = getRoleStyle(user?.role || 'employee');

  return (
    <Modal visible={!!userId} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInRight.duration(300).springify()}
          style={[styles.drawer, { backgroundColor: colors.bg }]}
        >
          <Pressable onPress={() => {}} style={{ flex: 1 }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[typography.h4, { color: colors.text }]}>Chi tiết Người dùng</Text>
              <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: `${colors.danger}15` }]}>
                <X size={18} color={colors.danger} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View style={{ gap: 16 }}>
                  <SGSkeleton width={60} height={60} variant="circle" />
                  <SGSkeleton width="60%" height={20} variant="text" />
                  <SGSkeleton width="40%" height={14} variant="text" />
                  <SGSkeleton width="100%" height={120} borderRadius={16} />
                </View>
              ) : user ? (
                <>
                  {/* Profile */}
                  <Animated.View entering={FadeInDown.duration(300)}>
                    <View style={styles.profileRow}>
                      <SGAvatar name={user.name} size="lg" color={roleStyle.color} />
                      <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                          <Text style={[typography.h3, { color: colors.text }]}>{user.name}</Text>
                          {!user.isActive && <SGStatusBadge status="danger" text="INACTIVE" size="sm" />}
                          {isLocked && <SGStatusBadge status="warning" text="LOCKED" size="sm" />}
                        </View>
                        <View style={styles.metaRow}>
                          <Mail size={12} color={colors.textTertiary} />
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>{user.email}</Text>
                        </View>
                        <View style={[styles.roleBadge, { backgroundColor: `${roleStyle.color}12` }]}>
                          <Text style={[typography.caption, { color: roleStyle.color, fontWeight: '800' }]}>{roleStyle.label}</Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>

                  {/* Stats */}
                  <Animated.View entering={FadeInDown.delay(100).duration(300)}>
                    <View style={styles.statsGrid}>
                      <StatItem label="Đăng nhập" value={user.loginCount ?? 0} icon={<Activity size={14} color={colors.accent} />} colors={colors} />
                      <StatItem label="Login cuối" value={user.lastLoginAt ? formatRelativeDate(user.lastLoginAt) : 'Chưa'} icon={<Clock size={14} color={colors.info} />} colors={colors} />
                      <StatItem label="Login lỗi" value={user.failedLoginAttempts ?? 0} icon={<XCircle size={14} color={colors.danger} />} colors={colors} />
                      <StatItem label="Tạo ngày" value={new Date(user.createdAt).toLocaleDateString('vi')} icon={<Calendar size={14} color={colors.textTertiary} />} colors={colors} />
                    </View>
                  </Animated.View>

                  {/* Password Expiry */}
                  {user.passwordExpired !== undefined && (
                    <Animated.View entering={FadeInDown.delay(150).duration(300)}>
                      <SGSection
                        title="Trạng thái mật khẩu"
                        titleIcon={<Key size={16} color={user.passwordExpired ? colors.danger : colors.success} />}
                        titleColor={user.passwordExpired ? colors.danger : colors.success}
                      >
                        {user.passwordExpired ? (
                          <View style={[styles.alertBox, { backgroundColor: `${colors.danger}08`, borderColor: `${colors.danger}20` }]}>
                            <AlertTriangle size={16} color={colors.danger} />
                            <Text style={[typography.smallBold, { color: colors.danger }]}>Mật khẩu đã hết hạn!</Text>
                          </View>
                        ) : (
                          <View style={[styles.alertBox, { backgroundColor: `${colors.success}08`, borderColor: `${colors.success}20` }]}>
                            <CheckCircle size={16} color={colors.success} />
                            <Text style={[typography.smallBold, { color: colors.success }]}>
                              {user.passwordDaysLeft != null ? `Còn ${user.passwordDaysLeft} ngày` : 'Hợp lệ'}
                            </Text>
                          </View>
                        )}
                        {user.passwordChangedAt && (
                          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 6 }]}>
                            Đổi lần cuối: {new Date(user.passwordChangedAt).toLocaleDateString('vi')}
                          </Text>
                        )}
                      </SGSection>
                    </Animated.View>
                  )}

                  {/* Active Sessions */}
                  <Animated.View entering={FadeInDown.delay(200).duration(300)}>
                    <SGSection
                      title={`Phiên đăng nhập (${user.sessions?.length ?? 0})`}
                      titleIcon={<Smartphone size={16} color={colors.info} />}
                      titleColor={colors.info}
                      headerRight={
                        user.sessions?.length > 0 ? (
                          <SGButton
                            title="Đăng xuất tất cả"
                            size="sm"
                            variant="secondary"
                            icon={<LogOut size={14} />}
                            onPress={handleRevokeAll}
                            loading={revokeAll.isPending}
                          />
                        ) : undefined
                      }
                      noPadding
                    >
                      {user.sessions?.length === 0 ? (
                        <Text style={[typography.caption, { color: colors.textTertiary, padding: 16 }]}>Không có phiên nào</Text>
                      ) : (
                        user.sessions?.map((s: any, i: number) => (
                          <View key={s.id} style={[styles.sessionRow, {
                            borderBottomWidth: i < user.sessions.length - 1 ? 1 : 0,
                            borderBottomColor: colors.border,
                          }]}>
                            <Smartphone size={14} color={colors.textTertiary} />
                            <View style={{ flex: 1 }}>
                              <Text style={[typography.smallBold, { color: colors.text }]}>{s.deviceInfo || 'Unknown device'}</Text>
                              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                                {formatRelativeDate(s.createdAt)} · Hết hạn: {new Date(s.expiresAt).toLocaleDateString('vi')}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => handleRevokeSession(s.id)}
                              style={[styles.revokeBtn, { backgroundColor: `${colors.danger}10` }]}
                            >
                              <LogOut size={12} color={colors.danger} />
                            </Pressable>
                          </View>
                        ))
                      )}
                    </SGSection>
                  </Animated.View>

                  {/* Login History */}
                  <Animated.View entering={FadeInDown.delay(250).duration(300)}>
                    <SGSection
                      title={`Lịch sử hoạt động (${user.loginHistory?.length ?? 0})`}
                      titleIcon={<Activity size={16} color="#8b5cf6" />}
                      titleColor="#8b5cf6"
                      noPadding
                    >
                      {user.loginHistory?.slice(0, 15).map((log: any, i: number) => {
                        const mc = METHOD_COLORS[log.method] || { color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
                        const isOk = log.responseStatus === 'SUCCESS';
                        return (
                          <View key={log.id} style={[styles.logRow, {
                            borderBottomWidth: i < Math.min(user.loginHistory.length, 15) - 1 ? 1 : 0,
                            borderBottomColor: colors.border,
                          }]}>
                            <View style={[styles.methodDot, { backgroundColor: mc.color }]} />
                            <View style={{ flex: 1 }}>
                              <View style={styles.logMeta}>
                                <View style={[styles.methodTag, { backgroundColor: mc.bg }]}>
                                  <Text style={[typography.micro, { color: mc.color }]}>{log.method}</Text>
                                </View>
                                <Text style={[typography.caption, { color: colors.text, flex: 1 }]} numberOfLines={1}>{log.action}</Text>
                                {isOk ? <CheckCircle size={11} color={colors.success} /> : <XCircle size={11} color={colors.danger} />}
                              </View>
                              <View style={styles.logSub}>
                                <Text style={[typography.caption, { color: colors.textTertiary }]}>{formatRelativeDate(log.createdAt)}</Text>
                                {log.ip && <Text style={[typography.caption, { color: colors.textDisabled, fontFamily: 'monospace' }]}>{log.ip}</Text>}
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </SGSection>
                  </Animated.View>
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function StatItem({ label, value, icon, colors }: any) {
  return (
    <View style={[styles.statItem, { backgroundColor: colors.bgCard }]}>
      {icon}
      <Text style={[typography.caption, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[typography.bodyBold, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row', justifyContent: 'flex-end' },
  drawer: { width: '100%', maxWidth: 520, flex: 1, ...(Platform.OS === 'web' ? { boxShadow: '-8px 0 40px rgba(0,0,0,0.2)' } : {}) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 20, paddingBottom: 80 },
  profileRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { flex: 1, minWidth: 100, padding: 12, borderRadius: 12, alignItems: 'center', gap: 4 },
  alertBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  revokeBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  methodDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  methodTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  logSub: { flexDirection: 'row', gap: 8, marginTop: 2 },
});
