import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, sgds } from '@sgroup/ui/src/theme/theme';
import { ShieldAlert } from 'lucide-react-native';

export function AccessDeniedScreen({ navigation }: any) {
  const colors = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ShieldAlert size={64} color={colors.danger} />
      <Text style={[sgds.typo.h2, { color: colors.text, marginTop: 24 }]}>
        Truy cập bị từ chối
      </Text>
      <Text style={[sgds.typo.body, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
        Bạn không có quyền truy cập vào phân hệ này.{'\n'}
        Hãy liên hệ quản trị viên để được cấp quyền.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Workspace')}
        style={[styles.btn, { backgroundColor: colors.brand }]}
      >
        <Text style={[sgds.typo.bodyBold, { color: colors.textOnBrand }]}>
          Quay về trang chủ
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  btn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
