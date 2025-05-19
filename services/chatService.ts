// services/chatService.ts
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  documentId,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Obtém ou cria uma conversa entre dois usuários
 */
export const getOrCreateConversation = async (userId1: string, userId2: string): Promise<string> => {
  // Cria uma array ordenada de participantes para garantir consistência
  const participants = [userId1, userId2].sort();
  
  // Busca a conversa existente
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', '==', participants)
  );
  
  const snapshot = await getDocs(q);
  
  // Se a conversa existir, retorna seu ID
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  
  // Se não existir, cria uma nova conversa
  const newConversation = {
    participants,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: {
      text: '',
      senderId: '',
      timestamp: serverTimestamp(),
    },
  };
  
  const docRef = await addDoc(conversationsRef, newConversation);
  return docRef.id;
};

/**
 * Envia uma mensagem para uma conversa
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string
): Promise<string> => {
  try {
    // Adiciona a mensagem à coleção de mensagens
    const messagesRef = collection(db, 'messages');
    const newMessage = {
      conversationId,
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false,
    };
    
    const messageRef = await addDoc(messagesRef, newMessage);
    
    // Atualiza a última mensagem na conversa
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        text,
        senderId,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};

/**
 * Obtém todas as mensagens de uma conversa
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    throw error;
  }
};

/**
 * Escuta mudanças nas mensagens de uma conversa
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    
    callback(messages);
  });
};

/**
 * Marca todas as mensagens de uma conversa como lidas para um usuário específico
 */
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    const batch = [];
    for (const doc of snapshot.docs) {
      const messageRef = doc.ref;
      batch.push(updateDoc(messageRef, { read: true }));
    }
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    throw error;
  }
};

/**
 * Obtém todas as conversas de um usuário
 */
export const getUserConversations = async (userId: string) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
  } catch (error) {
    console.error('Erro ao obter conversas do usuário:', error);
    throw error;
  }
};

/**
 * Escuta mudanças nas conversas de um usuário
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
    
    callback(conversations);
  });
};

/**
 * Conta mensagens não lidas de uma conversa para um usuário
 */
export const getUnreadMessagesCount = async (conversationId: string, userId: string): Promise<number> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    throw error;
  }
};