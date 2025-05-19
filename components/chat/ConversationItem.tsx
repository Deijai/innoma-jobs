// components/chat/ConversationItem.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { ChatConversation } from '@/context/ChatContext';

interface ConversationItemProps {
  conversation: ChatConversation;
  onPress: (conversationId: string) => void;
  isActive?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  isActive = false
}) => {
  const { theme } = useTheme();
  
  // Formatar data relativa
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'agora';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} d`;
    
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { borderBottomColor: theme.colors.border },
        isActive && { backgroundColor: `${theme.colors.primary}10` }
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
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text 
            style={[
              styles.nameText, 
              { color: theme.colors.text.primary },
              conversation.unreadCount > 0 && styles.boldText,
            ]}
            numberOfLines={1}
          >
            {conversation.recipientInfo.name}
          </Text>
          
          <Text 
            style={[
              styles.timeText, 
              { color: theme.colors.text.disabled },
              conversation.unreadCount > 0 && { color: theme.colors.primary },
            ]}
          >
            {formatRelativeTime(conversation.lastMessageTime)}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.messageText, 
            { color: theme.colors.text.secondary },
            conversation.unreadCount > 0 && [
              styles.boldText, 
              { color: theme.colors.text.primary }
            ],
          ]}
          numberOfLines={2}
        >
          {conversation.lastMessageText || 'Iniciar conversa...'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
  },
});