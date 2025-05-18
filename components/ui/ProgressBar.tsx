// components/ui/ProgressBar.tsx
import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 a 1 (0% a 100%)
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  duration?: number;
  label?: string;
  showPercentage?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  percentageStyle?: TextStyle;
  progressStyle?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor,
  progressColor,
  animated = true,
  duration = 500,
  label,
  showPercentage = false,
  containerStyle,
  labelStyle,
  percentageStyle,
  progressStyle,
}) => {
  const { theme } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  // Garantir que o progresso esteja entre 0 e 1
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);

  // Animar a barra de progresso
  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: normalizedProgress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(normalizedProgress);
    }
  }, [normalizedProgress, animated, duration]);

  // Calcular a porcentagem para exibição
  const percentage = Math.round(normalizedProgress * 100);

  // Definir cores usando props ou tema
  const bgColor = backgroundColor || theme.colors.border;
  const progressClr = progressColor || theme.colors.primary;

  return (
    <View style={[styles.container, containerStyle]}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && (
            <Text
              style={[
                styles.label,
                { color: theme.colors.text.primary },
                labelStyle,
              ]}
            >
              {label}
            </Text>
          )}
          
          {showPercentage && (
            <Text
              style={[
                styles.percentage,
                { color: theme.colors.text.secondary },
                percentageStyle,
              ]}
            >
              {percentage}%
            </Text>
          )}
        </View>
      )}
      
      <View
        style={[
          styles.progressContainer,
          {
            height,
            backgroundColor: bgColor,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              height,
              backgroundColor: progressClr,
              borderRadius: height / 2,
            },
            progressStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
  },
  progressContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
  },
});