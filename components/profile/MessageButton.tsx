// components/profile/MessageButton.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useStartChat } from '@/hooks/useStartChat';
import * as Icons from 'phosphor-react-native';

interface MessageButtonProps {
  recipientId: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

export const MessageButton: React.FC<MessageButtonProps> = ({
  recipientId,
  fullWidth = true,
  variant = 'primary',
  style
}) => {
  const { startChatWithUser } = useStartChat();

  const handlePress = () => {
    startChatWithUser(recipientId);
  };

  return (
    <Button
      title="Enviar mensagem"
      variant={variant}
      onPress={handlePress}
      style={style ? {...styles.button, ...style} : styles.button}
      fullWidth={fullWidth}
      leftIcon={variant === 'primary' ? <Icons.ChatTeardropText size={20} color="#FFFFFF" /> : <Icons.ChatTeardropText size={20} color="#4F46E5" />}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
  }
});