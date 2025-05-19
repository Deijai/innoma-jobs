// app/(app)/messages/index.tsx
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
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

  // Renderizar item de conversa
  const renderConversationItem = ({ item }: { item: ChatConversation }) => (
    <ConversationItem
      conversation={item}
      onPress={navigateToChat}
    />
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
        <Icons.ChatText size={32} color={theme.colors.primary} />
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
          leftIcon={<Icons.MagnifyingGlass size={20} color={theme.colors.text.secondary} />}
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
        ListEmptyComponent={isLoading ? null : renderEmptyState()}
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
  },
  exploreButton: {
    width: 200,
  },
});