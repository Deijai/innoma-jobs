// components/ui/Select.tsx
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  selectStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Selecione uma opção',
  options,
  value,
  onChange,
  disabled = false,
  errorMessage,
  containerStyle,
  labelStyle,
  selectStyle,
  optionStyle,
  optionTextStyle,
  errorStyle,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Encontrar opção selecionada
  const selectedOption = options.find(option => option.value === value);

  const openModal = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    closeModal();
  };

  // Estilo da borda baseado no erro
  const getBorderColor = () => {
    if (errorMessage) {
      return theme.colors.error;
    }
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
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

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={openModal}
        disabled={disabled}
        style={[
          styles.selectButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: getBorderColor(),
            opacity: disabled ? 0.6 : 1,
          },
          selectStyle,
        ]}
      >
        <Text
          style={[
            styles.selectedText,
            {
              color: selectedOption
                ? theme.colors.text.primary
                : theme.colors.text.disabled,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        
        {/* Ícone de dropdown */}
        <View style={styles.arrowContainer}>
          <View
            style={[
              styles.arrow,
              { backgroundColor: theme.colors.text.secondary },
            ]}
          />
        </View>
      </TouchableOpacity>

      {errorMessage && (
        <Text
          style={[
            styles.errorMessage,
            { color: theme.colors.error },
            errorStyle,
          ]}
        >
          {errorMessage}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.card,
                ...theme.shadow.lg,
                borderRadius: theme.borderRadius.md,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              {label || 'Selecione uma opção'}
            </Text>

            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && {
                      backgroundColor: `${theme.colors.primary}15`,
                    },
                    optionStyle,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text.primary },
                      item.value === value && {
                        color: theme.colors.primary,
                        fontWeight: '600',
                      },
                      optionTextStyle,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  arrowContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  errorMessage: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: height * 0.5,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
  },
});