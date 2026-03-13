import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RefreshCw, Database, Server, CheckCircle2, AlertTriangle, ArrowDownToLine, FileText } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGButton, SGPlanningSectionTitle } from '../../../shared/ui/components';
import { useAuthStore } from '../../auth/store/authStore';
import { useGetDeals } from '../hooks/useSalesOps';

export function CrmViewer() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('10 phút trước');
  
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Vừa xong');
    }, 2500); // Mock 2.5s network request
  };

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 4 }}>BIZFLY CRM INTEGRATION</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Đồng Bộ Dữ Liệu</Text>
          </View>
        </View>

        {/* Connection Status Panel */}
        <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? '#1e293b50' : '#f8fafc' }]}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
             <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: isDark ? '#3b82f620' : '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
               <Database size={32} color="#3b82f6" />
             </View>
             <View>
               <Text style={{ fontSize: 18, fontWeight: '800', color: cText }}>Kết nối Bizfly CRM</Text>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                 <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
                 <Text style={{ fontSize: 14, fontWeight: '600', color: '#10b981' }}>Connected (API v2.4)</Text>
                 <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginHorizontal: 4 }}>•</Text>
                 <Text style={{ fontSize: 14, fontWeight: '600', color: cSub }}>Lần cuối: {lastSync}</Text>
               </View>
             </View>
           </View>

           <SGButton 
             title={isSyncing ? "Đang kéo dữ liệu..." : "Đồng Bộ Ngay"} 
             icon={isSyncing ? undefined : RefreshCw as any} 
             onPress={handleSync}
             disabled={isSyncing}
             style={{ backgroundColor: isSyncing ? '#64748b' : '#3b82f6', height: 48, borderRadius: 14, minWidth: 160 }}
           />
        </View>

        {/* Sync Summary blocks */}
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <View style={[cardStyle, { flex: 1 }]}>
             <ArrowDownToLine size={24} color="#8b5cf6" style={{ marginBottom: 16 }} />
             <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, textTransform: 'uppercase' }}>Leads Đổ Về</Text>
             <Text style={{ fontSize: 36, fontWeight: '900', color: cText, marginTop: 4 }}>1,482</Text>
             <Text style={{ fontSize: 13, fontWeight: '600', color: '#10b981', marginTop: 8 }}>+24 hôm nay</Text>
          </View>
          <View style={[cardStyle, { flex: 1 }]}>
             <CheckCircle2 size={24} color="#10b981" style={{ marginBottom: 16 }} />
             <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, textTransform: 'uppercase' }}>Khách Tương Tác</Text>
             <Text style={{ fontSize: 36, fontWeight: '900', color: cText, marginTop: 4 }}>856</Text>
             <Text style={{ fontSize: 13, fontWeight: '600', color: '#10b981', marginTop: 8 }}>+12 hôm nay</Text>
          </View>
          <View style={[cardStyle, { flex: 1 }]}>
             <FileText size={24} color="#3b82f6" style={{ marginBottom: 16 }} />
             <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, textTransform: 'uppercase' }}>Total Sync Events</Text>
             <Text style={{ fontSize: 36, fontWeight: '900', color: cText, marginTop: 4 }}>15.2K</Text>
             <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6', marginTop: 8 }}>Auto-sync (15m)</Text>
          </View>
        </View>

        {/* Sync Feed */}
        <View style={cardStyle}>
          <SGPlanningSectionTitle 
            icon={Server}
            title="Nhật Ký Đồng Bộ (Live Feed)"
            accent="#8b5cf6"
            badgeText="LOGS"
            style={{ marginBottom: 24 }}
          />
          
          <View style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 16, padding: 24, gap: 16, borderWidth: 1, borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
            {[
              { id: 1, time: 'Vừa xong', type: 'NEW_LEAD', msg: 'Nhận 1 Lead mới từ Form "Facebook Ads - T10". Chỉ định cho NVKD Trần Văn A.' },
              { id: 2, time: '10 phút trước', type: 'UPDATE', msg: 'Cập nhật trạng thái Kanban "KH Lê Thị B" -> Đoạn hẹn gặp.' },
              { id: 3, time: '1 tiếng trước', type: 'ROUTING', msg: 'Auto-Routing: Chia đều 5 Leads mới cho Team Alpha.' },
              { id: 4, time: '3 tiếng trước', type: 'CALL_LOG', msg: 'Đồng bộ lịch sử 12 cuộc gọi Telesale qua Bizfly Call Center.' },
            ].map(log => (
              <View key={log.id} style={{ flexDirection: 'row', gap: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, width: 80, marginTop: 2 }}>{log.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#e2e8f0' : '#475569', lineHeight: 22 }}>
                    <Text style={{ fontWeight: '800', color: log.type === 'NEW_LEAD' ? '#10b981' : (log.type === 'UPDATE' ? '#3b82f6' : '#8b5cf6') }}>
                      [{log.type}]
                    </Text> {log.msg}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
