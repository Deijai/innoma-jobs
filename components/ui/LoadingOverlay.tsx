import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Carregando...',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.loadingIndicator}>
        {/* Você pode usar o ActivityIndicator nativo ou uma animação personalizada */}
        <View style={styles.spinner}>
          <View style={styles.spinnerInner} />
        </View>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ccc',
    borderTopColor: '#666',
    borderRightColor: '#999',
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});