// components/chat/MessageBubble.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Message } from '@/services/chatService';

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
  const { theme } = useTheme();
  
  // Formatar horário da mensagem
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownContainer : styles.otherContainer
    ]}>
      <View style={[
        styles.bubble,
        isOwn 
          ? [styles.ownBubble, { backgroundColor: theme.colors.primary }]
          : [styles.otherBubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]
      ]}>
        <Text style={[
          styles.messageText,
          { color: isOwn ? '#FFFFFF' : theme.colors.text.primary }
        ]}>
          {message.text}
        </Text>
        
        {showTime && message.createdAt && (
          <Text style={[
            styles.timeText,
            { color: isOwn ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.secondary }
          ]}>
            {formatTime(message.createdAt.toDate())}
          </Text>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  }
});