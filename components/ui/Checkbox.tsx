// components/ui/Checkbox.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  containerStyle,
  checkboxStyle,
  labelStyle,
  size = 'md',
}) => {
  const { theme } = useTheme();

  const getSize = (): number => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default: // md
        return 20;
    }
  };

  const boxSize = getSize();
  const iconSize = boxSize * 0.6;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleToggle}
      style={[
        styles.container,
        { opacity: disabled ? 0.5 : 1 },
        containerStyle,
      ]}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: boxSize,
            height: boxSize,
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : 'transparent',
            borderRadius: boxSize * 0.15,
          },
          checkboxStyle,
        ]}
      >
        {checked && (
          <View
            style={[
              styles.checkmark,
              {
                width: iconSize,
                height: iconSize * 0.5,
                borderColor: 'white',
              },
            ]}
          />
        )}
      </View>
      
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text.primary,
              fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
            },
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
    marginVertical: 4,
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  checkmark: {
    transform: [{ rotate: '45deg' }],
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  label: {
    marginLeft: 8,
  },
});