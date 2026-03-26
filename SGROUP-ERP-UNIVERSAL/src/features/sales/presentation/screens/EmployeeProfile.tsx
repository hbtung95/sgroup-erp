import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { UserCircle, Mail, Phone, MapPin, Award, Star, TrendingUp, ShieldCheck, Briefcase, Lock, Eye, EyeOff, CheckCircle, Users } from 'lucide-react-native';
import { SGButton, SGPlanningSectionTitle } from '../../../../shared/ui/components';
import { useAuthStore } from '../../../auth/store/authStore';
import { apiFetch } from '../../../../core/api/api';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin Hệ Thống',
  sales: 'Chuyên viên Kinh doanh',
  team_lead: 'Trưởng nhóm Kinh doanh',
  sales_manager: 'Trưởng phòng Kinh doanh',
  sales_director: 'Giám đốc Kinh doanh',
  sales_admin: 'Admin Kinh doanh',
};

const DEPT_LABELS: Record<string, string> = {
  SALES: 'Phòng Kinh Doanh',
  MANAGEMENT: 'Ban Giám Đốc',
  HR: 'Phòng Nhân Sự',
  FINANCE: 'Phòng Tài Chính - Kế Toán',
  MARKETING: 'Phòng Marketing',
  LEGAL: 'Phòng Pháp Chế',
};

export function EmployeeProfile() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const { user, token } = useAuthStore();

  // Change password state
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const roleLabel = ROLE_LABELS[user?.salesRole || user?.role || 'sales'] || 'Nhân viên';
  const deptLabel = DEPT_LABELS[user?.department || ''] || user?.department || 'Phòng Kinh Doanh';

  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPw || !newPw) { setPwError('Vui lòng nhập đầy đủ thông tin'); return; }
    if (newPw.length < 6) { setPwError('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
    if (newPw !== confirmPw) { setPwError('Mật khẩu xác nhận không khớp'); return; }

    setPwLoading(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      setPwSuccess(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { setPwSuccess(false); setShowPwForm(false); }, 2000);
    } catch (e: any) {
      setPwError(e.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPwLoading(false);
    }
  };

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  const inputStyle: any = {
    flex: 1, height: 48, paddingHorizontal: 16, fontSize: 15, fontWeight: '500',
    color: cText, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 12, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        
        {/* Header Personal Card */}
        <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 32 }]}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 }}>
            <Text style={{ fontSize: 48, fontWeight: '900', color: '#3b82f6' }}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>{user?.name || 'User'}</Text>
              <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#16a34a20' }}>
                 <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>ĐANG LÀM VIỆC</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Briefcase size={16} color={cSub} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: cSub }}>{roleLabel}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Mail size={16} color={cSub} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: cSub }}>{user?.email || ''}</Text>
              </View>
            </View>
            <View style={{ marginTop: 24, flexDirection: 'row', gap: 12 }}>
               <SGButton title="Đổi mật khẩu" variant={showPwForm ? 'primary' : 'outline'} onPress={() => setShowPwForm(!showPwForm)} style={{ paddingHorizontal: 24, height: 42, borderRadius: 12 }} />
            </View>
          </View>
        </View>

        {/* Change Password Form */}
        {showPwForm && (
          <View style={[cardStyle]}>
            <SGPlanningSectionTitle 
              icon={Lock}
              title="Đổi Mật Khẩu"
              accent="#3b82f6"
              badgeText="BẢO MẬT"
              style={{ marginBottom: 28 }}
            />

            {pwSuccess ? (
              <View style={{ alignItems: 'center', padding: 32 }}>
                <CheckCircle size={48} color="#16a34a" />
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#16a34a', marginTop: 16 }}>Đổi mật khẩu thành công!</Text>
              </View>
            ) : (
              <View style={{ gap: 20, maxWidth: 480 }}>
                {/* Current Password */}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, marginBottom: 8 }}>Mật khẩu hiện tại</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      value={currentPw} onChangeText={setCurrentPw}
                      placeholder="Nhập mật khẩu hiện tại"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showCurrent}
                      style={inputStyle}
                    />
                    <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={{ marginLeft: -44, width: 44, height: 48, justifyContent: 'center', alignItems: 'center' }}>
                      {showCurrent ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, marginBottom: 8 }}>Mật khẩu mới (tối thiểu 6 ký tự)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      value={newPw} onChangeText={setNewPw}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showNew}
                      style={inputStyle}
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)} style={{ marginLeft: -44, width: 44, height: 48, justifyContent: 'center', alignItems: 'center' }}>
                      {showNew ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, marginBottom: 8 }}>Xác nhận mật khẩu mới</Text>
                  <TextInput
                    value={confirmPw} onChangeText={setConfirmPw}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    style={inputStyle}
                  />
                </View>

                {pwError ? (
                  <View style={{ padding: 14, borderRadius: 12, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#dc2626' }}>⚠ {pwError}</Text>
                  </View>
                ) : null}

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <SGButton 
                    title={pwLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'} 
                    variant="primary" 
                    onPress={handleChangePassword} 
                    disabled={pwLoading}
                    style={{ paddingHorizontal: 32, height: 48, borderRadius: 14 }} 
                  />
                  <SGButton title="Hủy" variant="outline" onPress={() => { setShowPwForm(false); setPwError(''); }} style={{ paddingHorizontal: 24, height: 48, borderRadius: 14 }} />
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          
          {/* Contact Details */}
          <View style={[cardStyle, { flex: 1, minWidth: 350 }]}>
            <SGPlanningSectionTitle 
              icon={UserCircle}
              title="Thông Tin Liên Hệ & Nhân Sự"
              accent="#8b5cf6"
              badgeText="HR RECORD"
              style={{ marginBottom: 28 }}
            />
            <View style={{ gap: 20 }}>
              {[
                { icon: Mail, label: 'Email công ty', value: user?.email || 'N/A' },
                { icon: ShieldCheck, label: 'Vai trò', value: roleLabel },
                { icon: Briefcase, label: 'Phòng ban', value: deptLabel },
                ...(user?.teamName ? [{ icon: Users, label: 'Team', value: user.teamName }] : []),
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                         <Icon size={16} color="#64748b" />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>{item.label}</Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: cText }}>{item.value}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Performance & Ranking Snapshot */}
          <View style={[cardStyle, { flex: 1, minWidth: 350 }]}>
            <SGPlanningSectionTitle 
              icon={TrendingUp}
              title="Hồ Sơ Năng Lực"
              accent="#ec4899"
              badgeText="PERFORMANCE"
              style={{ marginBottom: 28 }}
            />
            
            <View style={{ padding: 24, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fdf4ff', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#fce7f3', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fce7f3', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                 <Star size={32} color="#ec4899" fill="#ec4899" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>ĐANG CẬP NHẬT DỮ LIỆU</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: cSub }}>Kết nối Database để xem KPI</Text>
            </View>
          </View>
          
        </View>

      </ScrollView>
    </View>
  );
}
