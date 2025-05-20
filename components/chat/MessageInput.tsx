import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Animated,
  Keyboard,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import * as Icons from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  disabled = false,
  placeholder = "Digite uma mensagem..." 
}) => {
  const { theme, isDark } = useTheme();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  // Animate button when message changes
  useEffect(() => {
    if (message.trim().length > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [message]);

  // Função para enviar mensagem
  const handleSend = async () => {
    if (!message.trim() || disabled || isSending) return;
    
    // Provide haptic feedback on send
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const currentMessage = message;
    setMessage('');
    setIsSending(true);
    
    try {
      await onSendMessage(currentMessage);
      // Focus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Restore message on error
      setMessage(currentMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Content height change handler for multiline input
  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(40, height), 120);
    setInputHeight(newHeight);
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? theme.colors.card : theme.colors.background,
        borderTopColor: theme.colors.border,
      }
    ]}>
      <View style={styles.inputContainer}>
        <View style={[
          styles.textInputWrapper,
          { 
            backgroundColor: isDark ? `${theme.colors.background}90` : theme.colors.card,
            borderColor: message.trim().length > 0 ? theme.colors.primary : theme.colors.border,
            borderWidth: message.trim().length > 0 ? 1.5 : 1,
          }
        ]}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { 
                color: theme.colors.text.primary,
                height: inputHeight,
              }
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.disabled}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            returnKeyType="default"
            onContentSizeChange={handleContentSizeChange}
            editable={!disabled}
          />
        </View>
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { 
                backgroundColor: message.trim().length > 0 
                  ? theme.colors.primary 
                  : isDark 
                    ? `${theme.colors.primary}60` 
                    : `${theme.colors.primary}40`,
                shadowColor: theme.colors.primary,
              },
              message.trim().length === 0 && styles.disabledButton
            ]}
            onPress={handleSend}
            disabled={disabled || !message.trim() || isSending}
            activeOpacity={0.7}
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Icons.PaperPlaneTilt color="#FFFFFF" size={20} weight="fill" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  input: {
    fontSize: 16,
    maxHeight: 120,
    padding: 0,
    paddingTop: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  }
});