// components/chat/ConversationItem.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '../ui/Avatar';
import { ChatConversation } from '@/context/ChatContext';

interface ConversationItemProps {
  conversation: ChatConversation;
  onPress: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onPress }) => {
  const { theme } = useTheme();
  
  // Calcular tempo relativo desde a última mensagem
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'agora';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.conversationItem, 
        { borderBottomColor: theme.colors.border },
        conversation.unreadCount > 0 && [
          styles.newConversationHighlight, 
          { backgroundColor: `${theme.colors.primary}08` }
        ]
      ]}
      onPress={() => onPress(conversation.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar 
          name={conversation.recipientInfo.name} 
          size="md" 
          source={conversation.recipientInfo.photoURL ? { uri: conversation.recipientInfo.photoURL } : undefined} 
        />
        
        {conversation.unreadCount > 0 && (
          <View 
            style={[
              styles.unreadBadge, 
              { backgroundColor: theme.colors.primary }
            ]}
          >
            <Text style={styles.unreadCount}>
              {conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text 
            style={[
              styles.recipientName, 
              { color: theme.colors.text.primary },
              conversation.unreadCount > 0 && styles.boldText,
            ]}
            numberOfLines={1}
          >
            {conversation.recipientInfo.name}
          </Text>
          
          <Text 
            style={[
              styles.messageTime, 
              { color: theme.colors.text.disabled },
              conversation.unreadCount > 0 && { color: theme.colors.primary },
            ]}
          >
            {formatRelativeTime(conversation.lastMessageTime)}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.lastMessage, 
            { color: theme.colors.text.secondary },
            conversation.unreadCount > 0 && [
              styles.boldText, 
              { color: theme.colors.text.primary }
            ],
          ]}
          numberOfLines={2}
        >
          {conversation.lastMessageText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  newConversationHighlight: {
    // Cor de destaque para conversas com mensagens não lidas
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    paddingHorizontal: 4,
  },
  unreadCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
  },
});