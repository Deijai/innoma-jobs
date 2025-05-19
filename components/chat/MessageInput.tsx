// components/chat/MessageInput.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import * as Icons from 'phosphor-react-native';

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
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Enviar mensagem
  const handleSend = async () => {
    if (!message.trim() || disabled || isSending) return;
    
    try {
      setIsSending(true);
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={[
        styles.container,
        { 
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        }
      ]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text.primary,
                borderColor: theme.colors.border,
              }
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.disabled}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!disabled}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
              (disabled || !message.trim() || isSending) && { opacity: 0.5 }
            ]}
            onPress={handleSend}
            disabled={disabled || !message.trim() || isSending}
          >
            <Icons.PaperPlaneTilt color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: '100%',
  },
  container: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 8,
    borderWidth: 1,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  }
});