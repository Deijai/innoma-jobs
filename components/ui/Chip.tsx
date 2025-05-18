// components/ui/Chip.tsx
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

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  selectedContainerStyle?: ViewStyle;
  selectedLabelStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  disabled = false,
  removable = false,
  onRemove,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  selectedContainerStyle,
  selectedLabelStyle,
}) => {
  const { theme } = useTheme();

  // Obtém cores baseadas no estado
  const getContainerStyle = () => {
    if (selected) {
      return {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      };
    }
    return {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    };
  };

  const getLabelStyle = () => {
    if (selected) {
      return {
        color: '#FFFFFF',
      };
    }
    return {
      color: theme.colors.text.primary,
    };
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleRemove = (e: any) => {
    e.stopPropagation();
    if (!disabled && onRemove) {
      onRemove();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={[
        styles.container,
        {
          ...getContainerStyle(),
          borderRadius: theme.borderRadius.full,
          opacity: disabled ? 0.6 : 1,
        },
        containerStyle,
        selected && selectedContainerStyle,
      ]}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      
      <Text
        style={[
          styles.label,
          getLabelStyle(),
          labelStyle,
          selected && selectedLabelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      
      {removable && (
        <TouchableOpacity
          style={[
            styles.removeButton,
            {
              backgroundColor: selected
                ? 'rgba(255, 255, 255, 0.3)'
                : theme.colors.border,
            },
          ]}
          onPress={handleRemove}
          disabled={disabled}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <View style={styles.removeIcon}>
            <View
              style={[
                styles.removeLine,
                {
                  backgroundColor: selected
                    ? '#FFFFFF'
                    : theme.colors.text.primary,
                },
                styles.removeLineLeft,
              ]}
            />
            <View
              style={[
                styles.removeLine,
                {
                  backgroundColor: selected
                    ? '#FFFFFF'
                    : theme.colors.text.primary,
                },
                styles.removeLineRight,
              ]}
            />
          </View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
  removeButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  removeIcon: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLine: {
    position: 'absolute',
    width: 8,
    height: 1.5,
    borderRadius: 1,
  },
  removeLineLeft: {
    transform: [{ rotate: '45deg' }],
  },
  removeLineRight: {
    transform: [{ rotate: '-45deg' }],
  },
  chipGroup: {
  flexDirection: 'row',
  flexWrap: 'wrap',
}
});

// Componente para um grupo de chips
interface ChipGroupProps {
  chips: Array<{
    id: string;
    label: string;
    leftIcon?: React.ReactNode;
  }>;
  selectedChipIds: string[];
  onChange: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  containerStyle?: ViewStyle;
  chipStyle?: ViewStyle;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  selectedChipIds,
  onChange,
  multiSelect = false,
  containerStyle,
  chipStyle,
}) => {
  const handleToggleChip = (id: string) => {
    if (multiSelect) {
      // Modo multi-seleção
      const newSelection = selectedChipIds.includes(id)
        ? selectedChipIds.filter(chipId => chipId !== id)
        : [...selectedChipIds, id];
      
      onChange(newSelection);
    } else {
      // Modo seleção única
      onChange(selectedChipIds.includes(id) ? [] : [id]);
    }
  };

  return (
    <View style={[styles.chipGroup, containerStyle]}>
      {chips.map(chip => (
        <Chip
          key={chip.id}
          label={chip.label}
          leftIcon={chip.leftIcon}
          selected={selectedChipIds.includes(chip.id)}
          onPress={() => handleToggleChip(chip.id)}
          containerStyle={chipStyle}
        />
      ))}
    </View>
  );
};

