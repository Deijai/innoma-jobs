// app/(app)/messages/chat/[id].tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator,
  FlatList,
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';

// Importar serviços e interfaces de chat
import { 
  Message, 
  Conversation, 
  getMessages, 
  sendMessage as sendNewMessage, 
  markMessagesAsRead, 
  subscribeToMessages 
} from '@/services/chatService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

// Interface para os detalhes do destinatário
interface RecipientInfo {
  id: string;
  name: string;
  photoURL?: string;
  title?: string;
}

// Interface para detalhes da conversa
interface ConversationDetails {
  id: string;
  participants: string[];
  recipientInfo: RecipientInfo;
}

export default function ChatScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = params.id as string;
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    id: '',
    name: 'Carregando...'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  // Carregar detalhes da conversa e configurar listener de mensagens
  useEffect(() => {
    if (!conversationId || !user?.uid) return;
    
    let unsubscribe: any;
    
    const loadConversation = async () => {
      try {
        setIsLoading(true);
        
        // Obter detalhes da conversa
        const conversationDetails = await fetchConversationDetails();
        if (conversationDetails) {
          setRecipientInfo(conversationDetails.recipientInfo);
          
          // Marcar mensagens como lidas
          await markMessagesAsRead(conversationId, user.uid);
          
          // Configurar listener para novas mensagens
          unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
            setMessages(newMessages);
            
            // Marcar mensagens como lidas quando chegarem novas
            if (newMessages.length > 0) {
              markMessagesAsRead(conversationId, user.uid);
            }
          });
        }
      } catch (error) {
        console.error("Erro ao carregar conversa:", error);
        showToast("Erro ao carregar a conversa", "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversation();
    
    // Limpar listener ao desmontar
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [conversationId, user?.uid]);

  // Função para buscar detalhes da conversa
  const fetchConversationDetails = async (): Promise<ConversationDetails | null> => {
    try {
      if (!user?.uid || !conversationId) {
        return null;
      }
      
      // Buscar dados da conversa no Firestore
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        showToast('Conversa não encontrada', 'error');
        return null;
      }
      
      const conversationData = conversationDoc.data();
      const participants = conversationData.participants || [];
      
      // Identificar o ID do outro participante
      const recipientId = participants.find((id: string) => id !== user.uid);
      
      if (!recipientId) {
        showToast('Erro ao identificar o destinatário', 'error');
        return null;
      }
      
      // Buscar informações do perfil do destinatário
      const recipientInfo = await fetchUserInfo(recipientId);
      
      return {
        id: conversationId,
        participants,
        recipientInfo
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes da conversa:', error);
      return null;
    }
  };
  
  // Buscar informações do usuário
  const fetchUserInfo = async (userId: string): Promise<RecipientInfo> => {
    try {
      // Primeiro tentar buscar no perfil completo
      const profileRef = doc(db, 'profiles', userId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        return {
          id: userId,
          name: profileData.name || 'Usuário',
          photoURL: profileData.photoURL,
          title: profileData.title,
        };
      }
      
      // Se não encontrar, buscar nos dados básicos do usuário
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: userId,
          name: userData.displayName || 'Usuário',
          photoURL: userData.photoURL,
          title: userData.userType === 'professional' ? 'Profissional' : 'Recrutador',
        };
      }
      
      // Se nada for encontrado, retornar dados básicos
      return {
        id: userId,
        name: 'Usuário',
        photoURL: undefined,
        title: undefined,
      };
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      return {
        id: userId,
        name: 'Usuário',
        photoURL: undefined,
        title: undefined,
      };
    }
  };

  // Enviar mensagem
  const handleSendMessage = async (text: string) => {
    if (!user?.uid || !conversationId) {
      showToast("Erro ao enviar mensagem", "error");
      return;
    }
    
    try {
      await sendNewMessage(conversationId, user.uid, text);
      
      // Rolar para o final depois de enviar a mensagem
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    }
  };

  // Voltar para a lista de conversas
  const handleBack = () => {
    router.back();
  };

  // Visualizar perfil do destinatário
  const handleViewProfile = () => {
    if (recipientInfo.id) {
      router.push(`/profile/view/${recipientInfo.id}`);
    }
  };

  // Renderizar uma mensagem
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isOwn = user?.uid === item.senderId;
    
    // Verificar se deve mostrar o horário (última mensagem ou mudança de dia)
    const showTime = index === messages.length - 1 || 
      (index < messages.length - 1 && 
        new Date(messages[index + 1].createdAt?.toDate()).getDate() !== 
        new Date(item.createdAt.toDate()).getDate());
    
    return (
      <MessageBubble 
        message={item}
        isOwn={isOwn}
        showTime={showTime}
      />
    );
  };

  // Separador de data entre mensagens
  const renderDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateText;
    if (date.toDateString() === today.toDateString()) {
      dateText = 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateText = 'Ontem';
    } else {
      dateText = date.toLocaleDateString();
    }
    
    return (
      <View style={styles.dateSeparator}>
        <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.dateText, { color: theme.colors.text.secondary }]}>
          {dateText}
        </Text>
        <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
      </View>
    );
  };

  // Ordenar mensagens e adicionar separadores de data
  const getProcessedMessages = () => {
    if (!messages.length) return [];
    
    let currentDate: string | null = null;
    const result: (Message | { id: string; type: 'dateSeparator'; date: Date })[] = [];
    
    // Adicionar as mensagens com separadores de data
    messages.forEach(message => {
      const messageDate = message.createdAt?.toDate() ?? new Date();      
      const dateString = messageDate.toDateString();
      
      if (dateString !== currentDate) {
        result.push({
          id: `date-${dateString}`,
          type: 'dateSeparator',
          date: messageDate
        });
        currentDate = dateString;
      }
      
      result.push(message);
    });
    
    return result;
  };

  // Renderizar um item da lista (mensagem ou separador de data)
  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'dateSeparator') {
      return renderDateSeparator(item.date);
    }
    
    return renderMessage({ item, index: messages.indexOf(item as Message) });
  };

  // Rolar para o final da lista quando novas mensagens chegarem
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Cabeçalho */}
      <ChatHeader
        recipientName={recipientInfo.name}
        recipientPhotoURL={recipientInfo.photoURL}
        recipientTitle={recipientInfo.title}
        onBack={handleBack}
        onViewProfile={handleViewProfile}
      />
      
      {/* Área de mensagens */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Carregando mensagens...
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={getProcessedMessages()}
          renderItem={renderItem}
          keyExtractor={item => ('id' in item) ? item.id : `item-${Math.random()}`}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                Nenhuma mensagem ainda. Comece a conversa!
              </Text>
            </View>
          }
        />
      )}
      
      {/* Input de mensagem */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 12,
    marginHorizontal: 8,
  }
});