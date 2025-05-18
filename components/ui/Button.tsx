import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  fullWidth = false,
  ...rest
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || isLoading;

  // Define estilos com base na variante
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled 
              ? `${theme.colors.primary}80` 
              : theme.colors.primary,
            borderWidth: 0,
            ...theme.shadow.md,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled 
              ? `${theme.colors.secondary}80` 
              : theme.colors.secondary,
            borderWidth: 0,
            ...theme.shadow.sm,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: isDisabled 
              ? `${theme.colors.primary}80` 
              : theme.colors.primary,
          },
          text: {
            color: isDisabled 
              ? `${theme.colors.primary}80` 
              : theme.colors.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: isDisabled 
              ? `${theme.colors.primary}80` 
              : theme.colors.primary,
          },
        };
      default:
        return {
          container: {
            backgroundColor: theme.colors.primary,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
          },
        };
    }
  };

  // Define estilos com base no tamanho
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.sm,
          },
          text: {
            fontSize: theme.typography.fontSize.sm,
            lineHeight: theme.typography.lineHeight.sm,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
          },
          text: {
            fontSize: theme.typography.fontSize.lg,
            lineHeight: theme.typography.lineHeight.lg,
          },
        };
      default: // md
        return {
          container: {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
          },
          text: {
            fontSize: theme.typography.fontSize.md,
            lineHeight: theme.typography.lineHeight.md,
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
        variantStyles.container,
        sizeStyles.container,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
          
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});