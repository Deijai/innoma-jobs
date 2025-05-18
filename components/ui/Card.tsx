// components/ui/Card.tsx
import { useTheme } from '@/hooks/useTheme';
import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof paddingOptions | number;
}

const paddingOptions = {
  none: 0,
  small: 8,
  medium: 16,
  large: 24,
};

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const { theme } = useTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.card,
          ...theme.shadow.md,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default:
        return {
          backgroundColor: theme.colors.card,
        };
    }
  };

  const getPaddingValue = () => {
    if (typeof padding === 'number') {
      return padding;
    }
    return paddingOptions[padding];
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        { padding: getPaddingValue(), borderRadius: theme.borderRadius.md },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
  },
});