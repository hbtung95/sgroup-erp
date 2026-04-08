/**
 * SGDS Showcase — Visual catalog of all SGDS components
 * Demonstrates each component in both light and dark mode
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import {
  Home, Users, Settings, Star, Bell, Search, Target, TrendingUp,
  Megaphone, CreditCard, Filter, Shield, Zap, Heart, Mail,
} from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { sgds } from '@sgroup/ui/src/theme/theme';
import {
  SGButton, SGCard, SGBadge, SGInput, SGTextArea, SGSelect,
  SGCheckbox, SGRadioGroup, SGSwitch, SGSlider, SGSearchBar,
  SGTabs, SGBreadcrumb, SGDivider, SGSpacer, SGProgressBar,
  SGCircularProgress, SGMetricRow, SGHeroBanner, SGDataGrid,
  SGTag, SGTooltip, SGSkeleton, SGStatCard, SGStatusBadge,
  SGAvatar, SGSectionHeader, SGEmptyState, SGTable, SGBottomBar,
  SGConfirmDialog, SGBottomSheet, SGPopover,
} from '@sgroup/ui/src/ui';

// ═════════════════════════════════════════
// Section wrapper
// ═════════════════════════════════════════
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme, isDark } = useAppTheme();
  return (
    <View style={{
      marginBottom: 40,
      backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
      borderRadius: 24, padding: 32,
      borderWidth: 1, borderColor: theme.colors.borderSubtle,
      ...(Platform.OS === 'web' ? { boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' } : {}) as any,
    }}>
      <Text style={{ ...sgds.typo.h3, color: theme.colors.textPrimary, marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function SGShowcase() {
  const { theme, isDark } = useAppTheme();

  // State for interactive demos
  const [textValue, setTextValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);
  const [radioValue, setRadioValue] = useState('opt1');
  const [switchOn, setSwitchOn] = useState(true);
  const [sliderValue, setSliderValue] = useState(65);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const selectOptions = [
    { label: 'Dự án A', value: 'a', description: 'Quận 1, TP.HCM' },
    { label: 'Dự án B', value: 'b', description: 'Quận 7, TP.HCM' },
    { label: 'Dự án C', value: 'c', description: 'Bình Dương' },
    { label: 'Dự án D', value: 'd', description: 'Đồng Nai' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 40, paddingBottom: 100, maxWidth: 1200, alignSelf: 'center', width: '100%' }}>

        {/* Header */}
        <View style={{ marginBottom: 48 }}>
          <Text style={{ ...sgds.typo.hero, color: theme.colors.accentBlue, marginBottom: 8 }}>
            SGDS
          </Text>
          <Text style={{ ...sgds.typo.h2, color: theme.colors.textPrimary, marginBottom: 8 }}>
            SGROUP Design System
          </Text>
          <Text style={{ ...sgds.typo.body, color: theme.colors.textSecondary, maxWidth: 600 }}>
            37 component — Thư viện UI đầy đủ cho toàn bộ hệ thống ERP. Mỗi component hỗ trợ Dark/Light mode, glassmorphism, animation, và cross-platform.
          </Text>
        </View>

        {/* ═══ BUTTONS ═══ */}
        <Section title="Buttons">
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <SGButton title="Primary" variant="primary" />
            <SGButton title="Secondary" variant="secondary" />
            <SGButton title="Ghost" variant="ghost" />
            <SGButton title="Danger" variant="danger" />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <SGButton title="Small" size="sm" icon={<Zap size={16} />} />
            <SGButton title="Medium" size="md" icon={<Star size={16} />} />
            <SGButton title="Large" size="lg" icon={<Heart size={16} />} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SGButton title="Loading..." loading />
            <SGButton title="Disabled" disabled />
          </View>
        </Section>

        {/* ═══ FORM INPUTS ═══ */}
        <Section title="Form Inputs">
          <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 280 }}>
              <SGInput value={textValue} onChangeText={setTextValue} label="TEXT INPUT" placeholder="Nhập họ tên..." icon={<Users size={16} />} />
              <SGTextArea value={textAreaValue} onChangeText={setTextAreaValue} label="TEXT AREA" placeholder="Mô tả chi tiết..." maxLength={500} rows={3} />
              <SGSelect
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                label="SELECT / DROPDOWN"
                placeholder="Chọn dự án..."
                searchable
              />
              <SGSearchBar value={searchText} onChangeText={setSearchText} placeholder="Tìm kiếm dự án, khách hàng..." />
            </View>

            <View style={{ flex: 1, minWidth: 280 }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ ...sgds.typo.label, color: theme.colors.textSecondary, marginBottom: 12 }}>CHECKBOX</Text>
                <SGCheckbox checked={checked1} onChange={setChecked1} label="Chấp nhận điều khoản" />
                <SGSpacer size="sm" />
                <SGCheckbox checked={checked2} onChange={setChecked2} label="Gửi thông báo email" />
              </View>

              <SGRadioGroup
                label="Radio Group"
                options={[
                  { label: 'Phương án A', value: 'opt1', description: 'Ưu tiên tốc độ' },
                  { label: 'Phương án B', value: 'opt2', description: 'Ưu tiên an toàn' },
                  { label: 'Phương án C', value: 'opt3' },
                ]}
                value={radioValue}
                onChange={setRadioValue}
              />

              <SGDivider spacing={20} />

              <View style={{ gap: 16 }}>
                <SGSwitch value={switchOn} onValueChange={setSwitchOn} label="Chế độ nâng cao" description="Mở tính năng beta" />
                <SGSlider value={sliderValue} onValueChange={setSliderValue} label="TIẾN ĐỘ DỰ ÁN" min={0} max={100} step={5} formatValue={(v) => `${v}%`} />
              </View>
            </View>
          </View>
        </Section>

        {/* ═══ BADGES & TAGS ═══ */}
        <Section title="Badges, Tags & Status">
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <SGBadge variant="success" label="Hoàn thành" />
            <SGBadge variant="warning" label="Chờ duyệt" />
            <SGBadge variant="danger" label="Lỗi" />
            <SGBadge variant="info" label="Thông tin" />
            <SGBadge variant="default" label="Nháp" />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <SGStatusBadge status="success" />
            <SGStatusBadge status="warning" />
            <SGStatusBadge status="danger" />
            <SGStatusBadge status="pending" />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <SGTag label="React Native" color="#61dafb" />
            <SGTag label="TypeScript" color="#3178c6" variant="outline" />
            <SGTag label="Closeable" color="#22c55e" onClose={() => {}} />
            <SGTag label="Solid" color="#8b5cf6" variant="solid" />
            <SGTag label="With Icon" icon={<Star size={14} />} color="#f59e0b" />
          </View>
        </Section>

        {/* ═══ TABS & NAVIGATION ═══ */}
        <Section title="Tabs & Navigation">
          <Text style={{ ...sgds.typo.label, color: theme.colors.textSecondary, marginBottom: 12 }}>UNDERLINE TABS</Text>
          <SGTabs
            tabs={[
              { key: 'tab1', label: 'Tổng quan', icon: Home },
              { key: 'tab2', label: 'Kinh doanh', icon: TrendingUp },
              { key: 'tab3', label: 'Marketing', icon: Megaphone, badge: 5 },
              { key: 'tab4', label: 'Cài đặt', icon: Settings },
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
          <SGSpacer size="xl" />
          <Text style={{ ...sgds.typo.label, color: theme.colors.textSecondary, marginBottom: 12 }}>PILL TABS</Text>
          <SGTabs
            tabs={[
              { key: 'tab1', label: 'Tất cả' },
              { key: 'tab2', label: 'Đang xử lý', badge: 12 },
              { key: 'tab3', label: 'Hoàn thành' },
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
            variant="pill"
          />
          <SGSpacer size="xl" />
          <Text style={{ ...sgds.typo.label, color: theme.colors.textSecondary, marginBottom: 12 }}>BREADCRUMB</Text>
          <SGBreadcrumb
            items={[
              { label: 'Home', onPress: () => {} },
              { label: 'Ban điều hành', onPress: () => {} },
              { label: 'Kế hoạch Tổng thể' },
            ]}
          />
        </Section>

        {/* ═══ PROGRESS & METRICS ═══ */}
        <Section title="Progress & Metrics">
          <View style={{ flexDirection: 'row', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
            <View style={{ flex: 1, minWidth: 300 }}>
              <SGProgressBar progress={78} label="Doanh thu Q1" color="#10b981" />
              <SGSpacer size="lg" />
              <SGProgressBar progress={45} label="Tiến độ dự án" color="#6366f1" size="lg" />
              <SGSpacer size="lg" />
              <SGProgressBar progress={92} label="Mục tiêu KPI" color="#f59e0b" size="sm" />
            </View>
            <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
              <SGCircularProgress progress={85} size={100} color="#10b981" label="Hoàn thành" />
              <SGCircularProgress progress={62} size={80} color="#6366f1" strokeWidth={6} label="Tiến độ" />
              <SGCircularProgress progress={34} size={60} color="#f59e0b" strokeWidth={5} />
            </View>
          </View>

          <SGDivider label="Metric Rows" />
          <SGSpacer size="md" />
          <SGMetricRow label="Doanh thu" value="125" unit="Tỷ VNĐ" icon={<TrendingUp size={24} color="#3b82f6" />} color="#3b82f6" bold />
          <SGMetricRow label="Giao dịch" value="357" unit="GD" icon={<Target size={20} color="#8b5cf6" />} color="#8b5cf6" />
          <SGMetricRow label="Tỷ lệ chốt" value="18.5" unit="%" icon={<Filter size={20} color="#10b981" />} color="#10b981" />
          <SGMetricRow label="Chi phí Marketing" value="6.2" unit="Tỷ" icon={<Megaphone size={20} color="#f59e0b" />} color="#f59e0b" separator={false} />
        </Section>

        {/* ═══ STAT CARDS ═══ */}
        <Section title="Stat Cards & Data Grid">
          <SGDataGrid columns={4} gap={16}>
            <SGStatCard icon={<TrendingUp size={24} color="#3b82f6" />} iconColor="#3b82f6" label="TỔNG DOANH THU" value="125" unit="Tỷ" trend={12} />
            <SGStatCard icon={<Users size={24} color="#8b5cf6" />} iconColor="#8b5cf6" label="SỐ GIAO DỊCH" value="357" unit="GD" trend={-3} />
            <SGStatCard icon={<CreditCard size={24} color="#f59e0b" />} iconColor="#f59e0b" label="HOA HỒNG NET" value="64.5" unit="Tỷ" trend={8} />
            <SGStatCard icon={<Shield size={24} color="#10b981" />} iconColor="#10b981" label="LỢI NHUẬN RÒNG" value="18.2" unit="Tỷ" trend={0} />
          </SGDataGrid>
        </Section>

        {/* ═══ HERO BANNER ═══ */}
        <Section title="Hero Banner">
          <SGHeroBanner
            gradientColors={['#1e1b4b', '#312e81']}
            icon={<TrendingUp size={32} color="#FFF" />}
            title="Lợi Nhuận Gộp (GP)"
            value="64.50"
            badges={[
              { label: '% DT còn lại', value: '51.6%' },
              { label: '% DS còn lại', value: '2.58%' },
            ]}
          />
        </Section>

        {/* ═══ AVATARS ═══ */}
        <Section title="Avatars">
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <SGAvatar name="Nguyễn Phong" size="sm" status="online" />
            <SGAvatar name="Trần Hải" size="md" status="away" showRing />
            <SGAvatar name="Lê Thu" size="lg" status="busy" />
            <SGAvatar name="Admin" size="xl" color="#D42027" />
          </View>
        </Section>

        {/* ═══ TABLE ═══ */}
        <Section title="Data Table">
          <SGTable
            columns={[
              { key: 'name', title: 'TÊN DỰ ÁN', flex: 2 },
              { key: 'status', title: 'TRẠNG THÁI', flex: 1,
                render: (val: string) => <SGStatusBadge status={val === 'Đang bán' ? 'success' : 'pending'} text={val} size="sm" /> },
              { key: 'revenue', title: 'DOANH THU', flex: 1, align: 'right' },
              { key: 'deals', title: 'GIAO DỊCH', flex: 1, align: 'right' },
            ]}
            data={[
              { name: 'The Opus One', status: 'Đang bán', revenue: '45.2 Tỷ', deals: '127' },
              { name: 'Vinhomes Grand Park', status: 'Chờ', revenue: '32.1 Tỷ', deals: '89' },
              { name: 'Eaton Park', status: 'Đang bán', revenue: '28.7 Tỷ', deals: '75' },
              { name: 'Masteri Centre Point', status: 'Chờ', revenue: '19.0 Tỷ', deals: '66' },
            ]}
          />
        </Section>

        {/* ═══ SKELETON ═══ */}
        <Section title="Skeleton Loading">
          <View style={{ flexDirection: 'row', gap: 24 }}>
            <View style={{ flex: 1, gap: 16 }}>
              <SGSkeleton variant="rect" height={120} borderRadius={16} />
              <SGSkeleton variant="text" count={3} />
            </View>
            <View style={{ alignItems: 'center', gap: 16, width: 120 }}>
              <SGSkeleton variant="circle" width={64} height={64} />
              <SGSkeleton variant="text" width={80} />
            </View>
          </View>
        </Section>

        {/* ═══ TOOLTIPS ═══ */}
        <Section title="Tooltip (Web only)">
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <SGTooltip content="Tooltip phía trên" position="top">
              <SGButton title="Hover me (Top)" variant="secondary" size="sm" />
            </SGTooltip>
            <SGTooltip content="Tooltip phía dưới" position="bottom">
              <SGButton title="Hover me (Bottom)" variant="secondary" size="sm" />
            </SGTooltip>
          </View>
        </Section>

        {/* ═══ CARDS ═══ */}
        <Section title="Cards">
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <SGCard variant="glass" style={{ flex: 1, minWidth: 250 }}>
              <Text style={{ ...sgds.typo.h4, color: theme.colors.textPrimary, marginBottom: 8 }}>Glass Card</Text>
              <Text style={{ ...sgds.typo.body, color: theme.colors.textSecondary }}>Glassmorphism với backdrop blur</Text>
            </SGCard>
            <SGCard variant="base" style={{ flex: 1, minWidth: 250 }}>
              <Text style={{ ...sgds.typo.h4, color: theme.colors.textPrimary, marginBottom: 8 }}>Base Card</Text>
              <Text style={{ ...sgds.typo.body, color: theme.colors.textSecondary }}>Solid background card</Text>
            </SGCard>
            <SGCard variant="gradient" style={{ flex: 1, minWidth: 250 }}>
              <Text style={{ ...sgds.typo.h4, color: '#fff', marginBottom: 8 }}>Gradient Card</Text>
              <Text style={{ ...sgds.typo.body, color: 'rgba(255,255,255,0.8)' }}>Linear gradient background</Text>
            </SGCard>
          </View>
        </Section>

        {/* ═══ DIALOGS & OVERLAYS ═══ */}
        <Section title="Dialogs & Overlays">
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <SGButton title="Confirm Dialog" variant="secondary" icon={<Shield size={16} />} onPress={() => setShowConfirm(true)} />
            <SGButton title="Bottom Sheet" variant="secondary" icon={<Filter size={16} />} onPress={() => setShowSheet(true)} />
            <SGPopover
              visible={showPopover}
              onClose={() => setShowPopover(false)}
              anchor={
                <SGButton title="Popover Menu" variant="secondary" icon={<Settings size={16} />} onPress={() => setShowPopover(!showPopover)} />
              }
            >
              {[
                { label: 'Chỉnh sửa', icon: Settings },
                { label: 'Chia sẻ', icon: Mail },
                { label: 'Xóa', icon: Shield },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}>
                  <item.icon size={16} color={theme.colors.textSecondary} />
                  <Text style={{ ...sgds.typo.body, color: theme.colors.textPrimary }}>{item.label}</Text>
                </View>
              ))}
            </SGPopover>
          </View>
        </Section>

        {/* ═══ EMPTY STATE ═══ */}
        <Section title="Empty State">
          <SGEmptyState
            emoji="🏗️"
            title="Chưa có dữ liệu"
            subtitle="Bắt đầu tạo kế hoạch kinh doanh cho năm 2026"
            actionLabel="Tạo kế hoạch mới"
            onAction={() => {}}
          />
        </Section>

        {/* ═══ DIVIDERS ═══ */}
        <Section title="Dividers & Spacers">
          <SGDivider />
          <SGSpacer size="md" />
          <SGDivider label="or" />
          <SGSpacer size="md" />
          <View style={{ flexDirection: 'row', height: 40, alignItems: 'center', gap: 16 }}>
            <Text style={{ ...sgds.typo.body, color: theme.colors.textSecondary }}>Item A</Text>
            <SGDivider direction="vertical" />
            <Text style={{ ...sgds.typo.body, color: theme.colors.textSecondary }}>Item B</Text>
            <SGDivider direction="vertical" />
            <Text style={{ ...sgds.typo.body, color: theme.colors.textSecondary }}>Item C</Text>
          </View>
        </Section>

      </ScrollView>

      {/* Confirm Dialog */}
      <SGConfirmDialog
        visible={showConfirm}
        onConfirm={() => setShowConfirm(false)}
        onCancel={() => setShowConfirm(false)}
        title="Xác nhận lưu kế hoạch?"
        message="Bạn có chắc muốn lưu kế hoạch kinh doanh 2026? Sau khi lưu, các phòng ban sẽ nhận thông tin ngay."
        variant="default"
      />

      {/* Bottom Sheet */}
      <SGBottomSheet visible={showSheet} onClose={() => setShowSheet(false)} title="Bộ lọc nâng cao">
        <View style={{ gap: 16 }}>
          <SGSelect options={selectOptions} value={selectValue} onChange={setSelectValue} label="DỰ ÁN" placeholder="Chọn dự án..." />
          <SGSlider value={sliderValue} onValueChange={setSliderValue} label="MỨC GIÁ TỐI THIỂU" min={0} max={50} step={1} formatValue={(v) => `${v} Tỷ`} color="#10b981" />
          <SGButton title="Áp dụng bộ lọc" fullWidth onPress={() => setShowSheet(false)} />
        </View>
      </SGBottomSheet>
    </View>
  );
}
