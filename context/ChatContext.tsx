// context/ChatContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Message,
  Conversation,
  getUserConversations,
  subscribeToConversations,
  getMessages,
  subscribeToMessages,
  sendMessage as sendMessageService,
  getOrCreateConversation,
  markMessagesAsRead
} from '../services/chatService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Tipo para os dados do perfil de outros usuários
interface UserProfileBasic {
  id: string;
  name: string;
  photoURL?: string;
  title?: string;
}

// Tipo para conversas formatadas para exibição
export interface ChatConversation extends Conversation {
  recipientInfo: UserProfileBasic;
  lastMessageText: string;
  lastMessageTime: Date;
  unreadCount: number;
}

interface ChatContextType {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  startConversation: (userId: string) => Promise<string>;
  setCurrentConversation: (conversationId: string | null) => void;
  refreshConversations: () => Promise<void>;
  getRecipientInfo: (participantIds: string[]) => Promise<UserProfileBasic>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfileBasic>>({});

  // Buscar perfil básico de um usuário
  const fetchUserProfile = async (userId: string): Promise<UserProfileBasic> => {
    // Verificar se já temos este perfil em cache
    if (userProfiles[userId]) {
      return userProfiles[userId];
    }

    try {
      const userProfileRef = doc(db, 'profiles', userId);
      const profileDoc = await getDoc(userProfileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        const userProfile = {
          id: userId,
          name: profileData.name || 'Usuário',
          photoURL: profileData.photoURL,
          title: profileData.title
        };
        
        // Adicionar ao cache
        setUserProfiles(prev => ({
          ...prev,
          [userId]: userProfile
        }));
        
        return userProfile;
      }
      
      // Fallback se não encontrar o perfil
      return {
        id: userId,
        name: 'Usuário',
      };
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return {
        id: userId,
        name: 'Usuário',
      };
    }
  };

  // Obter informações do destinatário em uma conversa
  const getRecipientInfo = async (participantIds: string[]): Promise<UserProfileBasic> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Encontrar o ID do outro participante (não o usuário atual)
    const recipientId = participantIds.find(id => id !== user.uid);
    
    if (!recipientId) {
      throw new Error('Destinatário não encontrado');
    }
    
    return fetchUserProfile(recipientId);
  };

  // Carregar conversas iniciais
  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const rawConversations = await getUserConversations(user.uid);
      
      // Converter conversas e adicionar informações do destinatário
      const processedConversations = await Promise.all(
        rawConversations.map(async (conv) => {
          const recipientInfo = await getRecipientInfo(conv.participants);
          
          return {
            ...conv,
            recipientInfo,
            lastMessageText: conv.lastMessage?.text || '',
            lastMessageTime: conv.lastMessage?.timestamp?.toDate() || new Date(),
            unreadCount: 0, // Será atualizado pelo listener de mensagens não lidas
          };
        })
      );
      
      setConversations(processedConversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar uma conversa com outro usuário
  const startConversation = async (recipientId: string): Promise<string> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      // Obter ou criar a conversa
      const conversationId = await getOrCreateConversation(user.uid, recipientId);
      
      // Atualizar a conversa atual
      setCurrentConversationId(conversationId);
      
      return conversationId;
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      throw error;
    }
  };

  // Enviar uma mensagem
  const sendMessage = async (text: string): Promise<void> => {
    if (!user || !currentConversationId || !text.trim()) {
      return;
    }
    
    try {
      await sendMessageService(currentConversationId, user.uid, text.trim());
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  // Carregar mensagens da conversa atual
  useEffect(() => {
    if (!currentConversationId || !user) return;
    
    // Marcar mensagens como lidas
    const markAsRead = async () => {
      try {
        await markMessagesAsRead(currentConversationId, user.uid);
      } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
      }
    };
    
    markAsRead();
    
    // Configurar o listener para as mensagens
    const unsubscribe = subscribeToMessages(currentConversationId, (newMessages) => {
      setMessages(newMessages);
    });
    
    return () => {
      unsubscribe();
      setMessages([]);
    };
  }, [currentConversationId, user]);

  // Configurar o listener para as conversas
  useEffect(() => {
    if (!user) return;
    
    loadConversations();
    
    const unsubscribe = subscribeToConversations(user.uid, async (newConversations) => {
      // Converter conversas e adicionar informações do destinatário
      const processedConversations = await Promise.all(
        newConversations.map(async (conv) => {
          const recipientInfo = await getRecipientInfo(conv.participants);
          
          return {
            ...conv,
            recipientInfo,
            lastMessageText: conv.lastMessage?.text || '',
            lastMessageTime: conv.lastMessage?.timestamp?.toDate() || new Date(),
            unreadCount: 0, // Será atualizado pelo listener de mensagens não lidas
          };
        })
      );
      
      setConversations(processedConversations);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);

  const refreshConversations = async () => {
    await loadConversations();
  };

  const value = {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    sendMessage,
    startConversation,
    setCurrentConversation: setCurrentConversationId,
    refreshConversations,
    getRecipientInfo
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Hook personalizado para usar o contexto de chat
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider');
  }
  
  return context;
};