// components/ui/Toggle.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

interface ToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  containerStyle?: ViewStyle;
  toggleStyle?: ViewStyle;
  labelStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onToggle,
  label,
  labelPosition = 'right',
  disabled = false,
  containerStyle,
  toggleStyle,
  labelStyle,
  size = 'md',
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const getSizes = () => {
    switch (size) {
      case 'sm':
        return {
          width: 36,
          height: 20,
          knobSize: 16,
        };
      case 'lg':
        return {
          width: 56,
          height: 30,
          knobSize: 26,
        };
      default: // md
        return {
          width: 46,
          height: 24,
          knobSize: 20,
        };
    }
  };

  const { width, height, knobSize } = getSizes();
  const knobTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, width - knobSize - 2],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  const handleToggle = () => {
    if (!disabled) {
      onToggle(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      disabled={disabled}
      style={[
        styles.container,
        { opacity: disabled ? 0.5 : 1 },
        containerStyle,
      ]}
    >
      {label && labelPosition === 'left' && (
        <Text
          style={[
            styles.label,
            { marginRight: 8, color: theme.colors.text.primary },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      
      <Animated.View
        style={[
          styles.toggleTrack,
          {
            backgroundColor,
            width,
            height,
            borderRadius: height / 2,
          },
          toggleStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.toggleKnob,
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              transform: [{ translateX: knobTranslateX }],
            },
          ]}
        />
      </Animated.View>
      
      {label && labelPosition === 'right' && (
        <Text
          style={[
            styles.label,
            { marginLeft: 8, color: theme.colors.text.primary },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    justifyContent: 'center',
  },
  toggleKnob: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    position: 'absolute',
  },
  label: {
    fontSize: 16,
  },
});