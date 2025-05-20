import React, { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View,
  Animated,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import * as Icons from 'phosphor-react-native';

// Importar serviços e interfaces de chat
import { 
  Message, 
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
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  // Animações para a UI
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Rolar para o final da lista quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      if (messages.length > 0 && flatListRef.current && messagesLoaded) {
        scrollToEnd();
      }
      
      return () => {};
    }, [messages.length, messagesLoaded])
  );

  // Animar elementos ao carregar
  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isLoading]);

  // Função para rolar até o final da lista de mensagens
  const scrollToEnd = (animated = true) => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated });
      }
    }, 200);
  };

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
            setMessagesLoaded(true);
            
            // Marcar mensagens como lidas quando chegarem novas
            if (newMessages.length > 0) {
              markMessagesAsRead(conversationId, user.uid);
              scrollToEnd();
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
  const fetchConversationDetails = async (): Promise<{id: string; participants: string[]; recipientInfo: RecipientInfo} | null> => {
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
    if (!user?.uid || !conversationId || isSending) {
      showToast("Erro ao enviar mensagem", "error");
      return;
    }
    
    try {
      setIsSending(true);
      await sendNewMessage(conversationId, user.uid, text);
      scrollToEnd();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Voltar para a lista de conversas
  const handleBack = () => {
    router.replace('/messages');
  };

  // Visualizar perfil do destinatário
  const handleViewProfile = () => {
    if (recipientInfo.id) {
      router.push(`/(profile)/view/${recipientInfo.id}`);
    }
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
      dateText = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    return (
      <View style={styles.dateSeparator}>
        <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
        <View style={[styles.dateBubble, { 
          backgroundColor: isDark ? `${theme.colors.card}95` : theme.colors.card,
          borderColor: theme.colors.border,
        }]}>
          <Text style={[styles.dateText, { color: theme.colors.text.secondary }]}>
            {dateText}
          </Text>
        </View>
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
  const renderItem = ({ item, index }: { item: any, index: number }) => {
    if (item.type === 'dateSeparator') {
      return renderDateSeparator(item.date);
    }
    
    const isOwn = user?.uid === item.senderId;
    
    // Verificar se deve mostrar o horário
    const showTime = index === messages.length - 1 || 
      (index < messages.length - 1 && 
        messages[index + 1] && 
        messages[index + 1].createdAt && 
        item.createdAt && 
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

  // Rolar para o final quando as mensagens forem carregadas inicialmente
  useEffect(() => {
    if (messagesLoaded && messages.length > 0 && !isLoading) {
      scrollToEnd(false);
    }
  }, [messagesLoaded, isLoading]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Cabeçalho aprimorado */}
      <ChatHeader
        recipientName={recipientInfo.name}
        recipientPhotoURL={recipientInfo.photoURL}
        recipientTitle={recipientInfo.title}
        onBack={handleBack}
        onViewProfile={handleViewProfile}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              Carregando mensagens...
            </Text>
          </View>
        ) : (
          <Animated.View 
            style={[
              styles.messagesContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <FlatList
              ref={flatListRef}
              data={getProcessedMessages()}
              renderItem={renderItem}
              keyExtractor={(item) => ('id' in item) ? item.id : `item-${Math.random()}`}
              contentContainerStyle={styles.messagesList}
              inverted={false}
              onContentSizeChange={() => {
                if (messagesLoaded) {
                  scrollToEnd(false);
                }
              }}
              onLayout={() => {
                if (messagesLoaded) {
                  scrollToEnd(false);
                }
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <Icons.ChatText size={32} color={theme.colors.primary} weight="fill" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
                    Inicie uma conversa
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                    Nenhuma mensagem ainda. Envie uma mensagem para começar a conversa!
                  </Text>
                </View>
              }
            />
          </Animated.View>
        )}
        
        {/* Input de mensagem aprimorado */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading || isSending}
          placeholder={`Mensagem para ${recipientInfo.name.split(' ')[0]}...`}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Dimensões da tela para melhor responsividade
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  // Estilos das mensagens
  messagesList: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  
  // Estilos do separador de data
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 8,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateBubble: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Estilos de estados de carregamento e vazios
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 120,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 24,
  },
});