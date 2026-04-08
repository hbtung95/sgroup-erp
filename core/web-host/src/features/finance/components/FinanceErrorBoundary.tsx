import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class FinanceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[FinanceErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AlertTriangle size={48} color="#EF4444" style={styles.icon} />
          <Text style={styles.title}>Đã xảy ra lỗi tải Dữ liệu Tài chính</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <RefreshCw size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Thử lại</Text>
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
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
