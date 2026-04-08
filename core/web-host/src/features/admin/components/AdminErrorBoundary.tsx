/**
 * AdminErrorBoundary — Catch errors in admin screens to prevent full module crash
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AdminErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.inner}>
            <AlertTriangle size={48} color="#ef4444" strokeWidth={1.5} />
            <Text style={styles.title}>
              {this.props.fallbackTitle || 'Đã xảy ra lỗi'}
            </Text>
            <Text style={styles.subtitle}>
              Màn hình này gặp sự cố. Vui lòng thử lại.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetail} numberOfLines={4}>
                {this.state.error.message}
              </Text>
            )}
            <Pressable
              onPress={this.handleRetry}
              style={({ pressed }) => [
                styles.retryBtn,
                { opacity: pressed ? 0.7 : 1 },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.retryText}>Thử lại</Text>
            </Pressable>
          </View>
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
  },
  inner: {
    alignItems: 'center',
    gap: 12,
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    overflow: 'hidden',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
