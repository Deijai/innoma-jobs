// app/(app)/messages/index.tsx
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useChat, ChatConversation } from '@/context/ChatContext';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConversationItem } from '@/components/chat/ConversationItem';
import * as Icons from 'phosphor-react-native';

export default function MessagesScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, isLoading, refreshConversations } = useChat();
  const { showToast } = useToast();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Atualizar ao puxar para baixo
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshConversations();
    } catch (error) {
      console.error('Erro ao atualizar conversas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrar conversas pelo termo de busca
  const getFilteredConversations = (): ChatConversation[] => {
    if (!searchQuery) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      conversation => conversation.recipientInfo.name.toLowerCase().includes(query)
    );
  };

  // Navegar para a conversa
  const navigateToChat = (conversationId: string) => {
    router.push(`/messages/chat/${conversationId}`);
  };

  // Renderizar quando não há conversas
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View 
        style={[
          styles.emptyIcon, 
          { backgroundColor: `${theme.colors.primary}15` }
        ]}
      >
        <Icons.ChatText size={32} color={theme.colors.primary} weight="fill" />
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

  // Renderizar estado de carregamento
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
        Carregando conversas...
      </Text>
    </View>
  );

  const filteredConversations = getFilteredConversations();
  const hasUnreadMessages = conversations.some(c => c.unreadCount > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Mensagens
          </Text>
          
          {hasUnreadMessages && (
            <View style={[styles.headerBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.headerBadgeText}>Novas</Text>
            </View>
          )}
        </View>
        
        <Input
          placeholder="Buscar conversas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Icons.MagnifyingGlass size={20} color={theme.colors.text.secondary} />}
          containerStyle={styles.searchContainer}
        />
      </View>
      
      {isLoading && !refreshing ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={item} 
              onPress={navigateToChat}
            />
          )}
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
          ListEmptyComponent={!isLoading ? renderEmptyState() : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingVertical: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerBadge: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 0,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  exploreButton: {
    width: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});