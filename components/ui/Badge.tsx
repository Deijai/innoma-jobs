import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  removable?: boolean;
  children?: React.ReactNode;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  removable = false,
  children,
  onRemove,
}) => {
  const { theme } = useTheme();

  // Definir cor do badge com base na variante
  const getVariantStyles = (): { bg: string; text: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: `${theme.colors.primary}20`,
          text: theme.colors.primary,
        };
      case 'secondary':
        return {
          bg: `${theme.colors.secondary}20`,
          text: theme.colors.secondary,
        };
      case 'success':
        return {
          bg: `${theme.colors.success}20`,
          text: theme.colors.success,
        };
      case 'warning':
        return {
          bg: `${theme.colors.warning}20`,
          text: theme.colors.warning,
        };
      case 'error':
        return {
          bg: `${theme.colors.error}20`,
          text: theme.colors.error,
        };
      case 'info':
        return {
          bg: `${theme.colors.info}20`,
          text: theme.colors.info,
        };
      default:
        return {
          bg: `${theme.colors.primary}20`,
          text: theme.colors.primary,
        };
    }
  };

  // Definir tamanho do badge
  const getSizeStyles = (): { containerPadding: ViewStyle; fontSize: number } => {
    switch (size) {
      case 'sm':
        return {
          containerPadding: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          },
          fontSize: theme.typography.fontSize.xs,
        };
      case 'lg':
        return {
          containerPadding: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          },
          fontSize: theme.typography.fontSize.md,
        };
      default: // md
        return {
          containerPadding: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          },
          fontSize: theme.typography.fontSize.sm,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variantStyles.bg },
        sizeStyles.containerPadding,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantStyles.text, fontSize: sizeStyles.fontSize },
          textStyle,
        ]}
      >
        {label}
      </Text>
      
      {removable && onRemove && (
        <TouchableOpacity 
          style={[styles.removeButton,]} 
          onPress={onRemove}
        >
          {children}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
  removeButton: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  removeIcon: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIconLine: {
    position: 'absolute',
    width: 8,
    height: 2,
    borderRadius: 1,
  },
});