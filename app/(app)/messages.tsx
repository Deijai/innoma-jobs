// app/(app)/messages.tsx
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

// Interface para conversas
interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientPhoto?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export default function MessagesScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Conversas fictícias para demonstração
  const mockConversations: Conversation[] = [
    {
      id: '1',
      recipientId: '101',
      recipientName: 'Ana Silva',
      lastMessage: 'Olá! Vi seu perfil e gostaria de conversar sobre uma oportunidade...',
      lastMessageTime: new Date(new Date().getTime() - 1000 * 60 * 5), // 5 minutos atrás
      unreadCount: 2,
    },
    {
      id: '2',
      recipientId: '102',
      recipientName: 'Carlos Mendes',
      lastMessage: 'Obrigado pelo retorno! Podemos marcar uma entrevista para a próxima semana?',
      lastMessageTime: new Date(new Date().getTime() - 1000 * 60 * 60 * 2), // 2 horas atrás
      unreadCount: 0,
    },
    {
      id: '3',
      recipientId: '103',
      recipientName: 'TechCorp Recrutamento',
      lastMessage: 'Enviamos o feedback da sua entrevista técnica. Parabéns!',
      lastMessageTime: new Date(new Date().getTime() - 1000 * 60 * 60 * 24), // 1 dia atrás
      unreadCount: 1,
    },
  ];

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

  // Atualizar ao puxar para baixo
  const handleRefresh = () => {
    setRefreshing(true);
    // Simular carregamento
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Navegar para a conversa
  const navigateToChat = (conversationId: string, recipientId: string, recipientName: string) => {
    // Placeholder para navegação para a tela de chat
    showToast(`Funcionalidade de chat será implementada em breve`, 'info');
  };

  // Filtrar conversas pelo termo de busca
  const getFilteredConversations = () => {
    if (!searchQuery) return mockConversations;
    
    const query = searchQuery.toLowerCase();
    return mockConversations.filter(
      conversation => conversation.recipientName.toLowerCase().includes(query)
    );
  };

  // Renderizar item de conversa
  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={[styles.conversationItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => navigateToChat(item.id, item.recipientId, item.recipientName)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationLeft}>
        <Avatar 
          name={item.recipientName} 
          size="md" 
          source={item.recipientPhoto ? { uri: item.recipientPhoto } : undefined} 
        />
        
        {item.unreadCount > 0 && (
          <View 
            style={[
              styles.unreadBadge, 
              { backgroundColor: theme.colors.primary }
            ]}
          >
            <Text style={styles.unreadCount}>
              {item.unreadCount}
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
              item.unreadCount > 0 && styles.boldText,
            ]}
            numberOfLines={1}
          >
            {item.recipientName}
          </Text>
          
          <Text 
            style={[
              styles.messageTime, 
              { color: theme.colors.text.disabled },
              item.unreadCount > 0 && { color: theme.colors.primary },
            ]}
          >
            {formatRelativeTime(item.lastMessageTime)}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.lastMessage, 
            { color: theme.colors.text.secondary },
            item.unreadCount > 0 && [
              styles.boldText, 
              { color: theme.colors.text.primary }
            ],
          ]}
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Renderizar quando não há conversas
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View 
        style={[
          styles.emptyIcon, 
          { backgroundColor: `${theme.colors.primary}15` }
        ]}
      >
        <View 
          style={[
            styles.emptyIconInner, 
            { borderColor: theme.colors.primary }
          ]} 
        />
      </View>
      
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Nenhuma mensagem
      </Text>
      
      <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
        Quando você receber mensagens, elas aparecerão aqui.
      </Text>
      
      <Button
        title="Explorar perfis"
        onPress={() => router.push('/home')}
        style={styles.exploreButton}
      />
    </View>
  );

  const filteredConversations = getFilteredConversations();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
       <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Mensagens
        </Text>
        
        <Input
          placeholder="Buscar conversas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={
            <View style={styles.searchIcon}>
              <View style={[styles.searchIconCircle, { borderColor: theme.colors.text.secondary }]} />
              <View style={[styles.searchIconLine, { backgroundColor: theme.colors.text.secondary }]} />
            </View>
          }
          containerStyle={styles.searchContainer}
        />
      </View>
      
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredConversations.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 0,
  },
  searchIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  searchIconCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchIconLine: {
    width: 6,
    height: 2,
    position: 'absolute',
    bottom: 4,
    right: 2,
    transform: [{ rotate: '45deg' }],
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  conversationLeft: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconInner: {
    width: 32,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    width: 200,
  },
});