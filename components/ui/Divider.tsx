// components/ui/Divider.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: ViewStyle;
  spacing?: number;
  label?: string;
  labelStyle?: TextStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color,
  style,
  spacing = 8,
  label,
  labelStyle,
}) => {
  const { theme } = useTheme();
  const dividerColor = color || theme.colors.border;

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            marginHorizontal: spacing,
            backgroundColor: dividerColor,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.labelContainer, { marginVertical: spacing }]}>
        <View
          style={[
            styles.horizontal,
            { height: thickness, backgroundColor: dividerColor, flex: 1 },
          ]}
        />
        <Text
          style={[
            styles.label,
            { color: theme.colors.text.secondary, marginHorizontal: 16 },
            labelStyle,
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.horizontal,
            { height: thickness, backgroundColor: dividerColor, flex: 1 },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          height: thickness,
          marginVertical: spacing,
          backgroundColor: dividerColor,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});