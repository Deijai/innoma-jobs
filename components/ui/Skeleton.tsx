// components/ui/Skeleton.tsx
import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const { theme, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (animated) {
      // Criar animação de pulsação
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      // Parar animação quando o componente for desmontado
      opacity.stopAnimation();
    };
  }, [animated]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#333333' : '#E0E0E0',
          opacity,
        },
        style,
      ]}
    />
  );
};

// Componentes predefinidos para esqueletos comuns
export const SkeletonText: React.FC<{ lines?: number; style?: ViewStyle }> = ({
  lines = 1,
  style,
}) => {
  const linesArray = Array(lines).fill(0);

  return (
    <View style={[styles.textContainer, style]}>
      {linesArray.map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 && lines > 1 ? '70%' : '100%'}
          height={16}
          style={styles.textLine}
        />
      ))}
    </View>
  );
};

export const SkeletonAvatar: React.FC<{
  size?: number;
  style?: ViewStyle;
}> = ({ size = 48, style }) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <SkeletonAvatar size={40} style={styles.cardAvatar} />
      <View style={styles.cardContent}>
        <SkeletonText lines={2} />
      </View>
    </View>
  );
};

export const SkeletonProfileHeader: React.FC<{ style?: ViewStyle }> = ({
  style,
}) => {
  return (
    <View style={[styles.profileHeader, style]}>
      <SkeletonAvatar size={80} />
      <View style={styles.profileInfo}>
        <Skeleton width={150} height={24} style={styles.profileName} />
        <Skeleton width={100} height={16} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  textContainer: {
    width: '100%',
  },
  textLine: {
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  cardAvatar: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileName: {
    marginBottom: 8,
  },
});