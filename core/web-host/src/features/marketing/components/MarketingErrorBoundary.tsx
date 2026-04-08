import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { typography, spacing, radius } from '@sgroup/ui/src/theme/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * MarketingErrorBoundary — SGDS-compliant error boundary
 * Note: Class components can't use hooks, so we use hardcoded dark-theme tokens.
 * The parent shell provides the correct background context.
 */
export class MarketingErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Production: send to error tracking service
    if (__DEV__) {
      console.error('[MarketingErrorBoundary]', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <AlertTriangle size={32} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Đã xảy ra lỗi</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Không thể tải nội dung này. Vui lòng thử lại.'}
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            activeOpacity={0.8}
            style={[styles.retryBtn, Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}]}
          >
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'rgba(245,158,11,0.04)',
    borderRadius: 24,
    margin: 24,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.1)',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(245,158,11,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.h2,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  message: {
    ...typography.body,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D97706',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    ...typography.smallBold,
    color: '#fff',
  },
});
