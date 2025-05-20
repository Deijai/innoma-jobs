import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Message } from '@/services/chatService';
import * as Icons from 'phosphor-react-native';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTime?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn,
  showTime = true
}) => {
  const { theme, isDark } = useTheme();
  
  // Formatar horário da mensagem
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verificar se a mensagem tem um timestamp válido
  const hasValidTimestamp = message.createdAt && typeof message.createdAt.toDate === 'function';
  const messageTime = hasValidTimestamp ? message.createdAt.toDate() : new Date();

  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownContainer : styles.otherContainer
    ]}>
      <View style={[
        styles.bubble,
        isOwn 
          ? [
              styles.ownBubble, 
              { 
                backgroundColor: theme.colors.primary,
                shadowColor: isDark ? 'rgba(0,0,0,0.3)' : theme.colors.primary,
              }
            ]
          : [
              styles.otherBubble, 
              { 
                backgroundColor: isDark ? `${theme.colors.card}` : '#FFFFFF',
                borderColor: theme.colors.border,
                shadowColor: 'rgba(0,0,0,0.15)',
              }
            ]
      ]}>
        <Text style={[
          styles.messageText,
          { color: isOwn ? '#FFFFFF' : theme.colors.text.primary }
        ]}>
          {message.text}
        </Text>
        
        {showTime && hasValidTimestamp && (
          <View style={styles.timeContainer}>
            {isOwn && message.read && (
              <Icons.CheckCircle 
                size={12} 
                color={isOwn ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.disabled} 
                style={styles.readIcon}
                weight="fill"
              />
            )}
            <Text style={[
              styles.timeText,
              { color: isOwn ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.disabled }
            ]}>
              {formatTime(messageTime)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  readIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 11,
  }
});