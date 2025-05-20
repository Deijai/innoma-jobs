// hooks/useStartChat.ts
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/components/ui/Toast';

/**
 * Hook personalizado para iniciar uma conversa com um usuário
 * Pode ser usado em qualquer componente que precisa iniciar um chat
 */
export const useStartChat = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { startConversation } = useChat();
  const { showToast } = useToast();

  /**
   * Inicia uma conversa com outro usuário e navega para a tela de chat
   */
  const startChatWithUser = async (recipientId: string) => {
    if (!user) {
      showToast('Você precisa estar logado para enviar mensagens', 'error');
      return;
    }
    
    if (user.uid === recipientId) {
      showToast('Você não pode iniciar uma conversa consigo mesmo', 'error');
      return;
    }
    
    try {
      // Obter ou criar a conversa
      const conversationId = await startConversation(recipientId);
      
      // Navegar para a tela de chat
      router.navigate(`/(app)/messages/chat/${conversationId}`);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      showToast('Erro ao iniciar conversa', 'error');
    }
  };

  return { startChatWithUser };
};