// components/ui/TextArea.tsx
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

interface TextAreaProps extends TextInputProps {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  errorMessage,
  helperText,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  helperStyle,
  value,
  onChangeText,
  maxLength,
  showCharacterCount = false,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Definir a cor da borda com base nos estados
  const getBorderColor = () => {
    if (errorMessage) {
      return theme.colors.error;
    }
    if (isFocused) {
      return theme.colors.primary;
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
      
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: getBorderColor(),
          },
          isFocused && styles.inputFocused,
          errorMessage && styles.inputError,
          inputStyle,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text.primary },
          ]}
          placeholderTextColor={theme.colors.text.disabled}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          {...rest}
        />
      </View>
      
      <View style={styles.bottomContainer}>
        {errorMessage ? (
          <Text
            style={[
              styles.errorMessage,
              { color: theme.colors.error },
              errorStyle,
            ]}
          >
            {errorMessage}
          </Text>
        ) : helperText ? (
          <Text
            style={[
              styles.helperText,
              { color: theme.colors.text.secondary },
              helperStyle,
            ]}
          >
            {helperText}
          </Text>
        ) : (
          <View />
        )}
        
        {showCharacterCount && maxLength && (
          <Text
            style={[
              styles.charCount,
              { color: theme.colors.text.secondary },
            ]}
          >
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

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
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputError: {
    borderWidth: 1,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  errorMessage: {
    fontSize: 12,
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
});