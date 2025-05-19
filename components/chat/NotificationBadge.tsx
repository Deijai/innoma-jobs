// components/chat/NotificationBadge.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface NotificationBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'md',
  maxCount = 9
}) => {
  const { theme } = useTheme();
  
  if (count <= 0) return null;
  
  // Determinar o tamanho do badge com base na prop size
  const getBadgeSize = () => {
    switch (size) {
      case 'sm':
        return {
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          fontSize: 9,
          paddingHorizontal: 3,
        };
      case 'lg':
        return {
          minWidth: 22,
          height: 22,
          borderRadius: 11,
          fontSize: 11,
          paddingHorizontal: 5,
        };
      default: // md
        return {
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          fontSize: 10,
          paddingHorizontal: 4,
        };
    }
  };
  
  const sizeStyles = getBadgeSize();
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[
      styles.badge,
      { 
        backgroundColor: theme.colors.primary,
        minWidth: sizeStyles.minWidth,
        height: sizeStyles.height,
        borderRadius: sizeStyles.borderRadius,
        paddingHorizontal: sizeStyles.paddingHorizontal,
      }
    ]}>
      <Text style={[
        styles.count,
        { fontSize: sizeStyles.fontSize }
      ]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
    zIndex: 10,
  },
  count: {
    color: 'white',
    fontWeight: 'bold',
  },
});