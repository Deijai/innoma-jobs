// components/ui/IconButton.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

interface IconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  round?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  onPress,
  round = false,
  ...rest
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || isLoading;

  // Define estilos com base na variante
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled
            ? `${theme.colors.primary}80`
            : theme.colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: isDisabled
            ? `${theme.colors.secondary}80`
            : theme.colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDisabled
            ? `${theme.colors.primary}80`
            : theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
    }
  };

  // Define estilos com base no tamanho
  const getSizeStyles = (): { container: ViewStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            width: 32,
            height: 32,
            borderRadius: round ? 16 : theme.borderRadius.sm,
          },
        };
      case 'lg':
        return {
          container: {
            width: 48,
            height: 48,
            borderRadius: round ? 24 : theme.borderRadius.md,
          },
        };
      default: // md
        return {
          container: {
            width: 40,
            height: 40,
            borderRadius: round ? 20 : theme.borderRadius.md,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={isDisabled ? undefined : onPress}
      style={[
        styles.button,
        variantStyles,
        sizeStyles.container,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : '#FFFFFF'
          }
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});