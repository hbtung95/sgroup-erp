/**
 * SalesErrorBoundary — Global error boundary for the Sales module.
 * Catches render errors and shows a user-friendly fallback.
 */
import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class SalesErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SalesErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48,
          backgroundColor: '#0f172a',
        }}>
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: 'rgba(239,68,68,0.1)',
            alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <AlertTriangle size={40} color="#ef4444" />
          </View>
          <Text style={{
            fontSize: 22, fontWeight: '900', color: '#fff',
            marginBottom: 8, textAlign: 'center',
          }}>
            Đã xảy ra lỗi
          </Text>
          <Text style={{
            fontSize: 14, fontWeight: '600', color: '#94a3b8',
            textAlign: 'center', marginBottom: 24, maxWidth: 400,
          }}>
            Một lỗi không mong muốn đã xảy ra trong module kinh doanh.
            Vui lòng thử lại hoặc liên hệ IT.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={{
              backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12,
              padding: 16, marginBottom: 24, maxWidth: 500, width: '100%',
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#ef4444', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}>
                {this.state.error.message}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={this.handleReset}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16,
              backgroundColor: '#3b82f6',
              ...(Platform.OS === 'web' ? { boxShadow: '0 4px 14px rgba(59,130,246,0.4)', cursor: 'pointer' } : {}),
            } as any}
          >
            <RefreshCw size={18} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Thử Lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
