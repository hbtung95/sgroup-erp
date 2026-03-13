import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  header?: ReactNode;
  noScroll?: boolean;
};

export const FinanceLayout: React.FC<Props> = ({
  children,
  header,
  noScroll = false,
}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={styles.contentContainer}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {header && <View style={styles.headerContainer}>{header}</View>}
      
      {noScroll ? (
        content
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // light theme background
  },
  headerContainer: {
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
});
