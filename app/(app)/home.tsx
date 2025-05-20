// app/(app)/home.tsx (modificado)
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { Input } from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/firebase';
import { useStartChat } from '@/hooks/useStartChat';
import { useChat } from '@/context/ChatContext';

// Tipos de dados
interface ProfileData {
  id: string;
  name: string;
  title: string;
  location: string;
  tags: string[];
  photoURL?: string;
  available: boolean;
  userType?: 'professional' | 'recruiter';
}

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const { startChatWithUser } = useStartChat();
  const { conversations } = useChat();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  
  // Calcular notificações não lidas
  const unreadMessagesCount = conversations.reduce(
    (count, conversation) => count + (conversation.unreadCount || 0), 
    0
  );
  
  // Animação para o loading dos cards
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Carregar perfis iniciais
  useEffect(() => {
    loadProfiles();
  }, []);

  // Animação quando os perfis forem carregados
  useEffect(() => {
    if (!isLoading && profiles.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, profiles]);

  // Função para carregar perfis
  const loadProfiles = async () => {
    setIsLoading(true);
    fadeAnim.setValue(0);
    
    try {
      // Pegar todos os perfis
      const profilesRef = collection(db, 'profiles');
      
      // Criar uma consulta com limite
      const q = query(
        profilesRef,
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const loadedProfiles: ProfileData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Verificar se temos os dados mínimos necessários
        // E se NÃO é o usuário atual
        if (data && doc.id !== user?.uid) {
          loadedProfiles.push({
            id: doc.id,
            name: data.name || 'Usuário',
            title: data.title || 'Título não definido',
            location: data.location || 'Localização não definida',
            tags: data.skills || [],
            photoURL: data.photoURL,
            available: data.available || false,
            userType: data.userType
          });
        }
      });
      
      setProfiles(loadedProfiles);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      showToast('Ocorreu um erro ao carregar os perfis', 'error');
      
      // Em caso de erro, mantemos a lista vazia
      setProfiles([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Atualizar ao puxar para baixo
  const handleRefresh = () => {
    setRefreshing(true);
    loadProfiles();
  };

  // Filtrar perfis baseado na busca
  const getFilteredProfiles = () => {
    if (!searchQuery) return profiles;
    
    return profiles.filter(profile => {
      const searchLower = searchQuery.toLowerCase();
      return (
        profile.name.toLowerCase().includes(searchLower) ||
        profile.title.toLowerCase().includes(searchLower) ||
        profile.location.toLowerCase().includes(searchLower) ||
        profile.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
  };

  // Filtrar por tipo de usuário oposto ao atual
  const getProfilesByUserType = (profiles: ProfileData[]) => {
    // Se não temos informação do tipo de usuário, mostrar todos
    if (!userData?.userType) return profiles;
    
    // Mostrar perfis do tipo oposto (recrutadores veem profissionais e vice-versa)
    const oppositeType = userData.userType === 'professional' ? 'recruiter' : 'professional';
    
    // Se temos muitos perfis sem userType definido, não filtrar por enquanto
    const profilesWithType = profiles.filter(p => p.userType);
    if (profilesWithType.length < profiles.length * 0.5) return profiles;
    
    return profiles.filter(profile => profile.userType === oppositeType);
  };

  // Navegar para detalhes do perfil
  const navigateToProfileDetails = (profileId: string) => {
    // Navegar para a nova rota de visualização de profissionais
    router.push(`/(profile)/professionals/${profileId}`);
  };

  // Navegar para a tela de mensagens
  const navigateToMessages = () => {
    router.push('/messages');
  };

  // Navegar para a tela de lista de profissionais
  const navigateToProfessionals = () => {
    router.push('/(profile)/professionals');
  };

  // Iniciar chat com um usuário
  const handleSendMessage = (profileId: string) => {
    // Usar startChatWithUser para iniciar conversa e navegar para o chat
    startChatWithUser(profileId);
  };

  // Renderizar item do perfil
  const renderProfileItem = ({ item, index }: { item: ProfileData, index: number }) => {
    // Calcular o atraso de animação com base no índice
    const delay = index * 100;
    
    return (
      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }]
      }}>
        <Card style={styles.profileCard} variant="elevated">
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => navigateToProfileDetails(item.id)}
            style={styles.profileCardContent}
          >
            <View style={styles.profileCardHeader}>
              <Avatar 
                name={item.name} 
                size="md" 
                source={item.photoURL ? { uri: item.photoURL } : undefined} 
              />
              
              <View style={styles.profileInfo}>
                <Text 
                  style={[styles.profileName, { color: theme.colors.text.primary }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                
                <Text 
                  style={[styles.profileTitle, { color: theme.colors.text.secondary }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                
                <View style={styles.profileLocation}>
                  <Icons.MapPin size={12} color={theme.colors.text.disabled} style={{ marginRight: 4 }} />
                  <Text 
                    style={[styles.locationText, { color: theme.colors.text.disabled }]}
                    numberOfLines={1}
                  >
                    {item.location}
                  </Text>
                </View>
              </View>
              
              {item.available && (
                <Badge
                  label="Disponível"
                  variant="success"
                  size="sm"
                  style={styles.availableBadge}
                />
              )}
            </View>
            
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={`${item.id}-${tag}-${index}`}
                  label={tag}
                  variant="primary"
                  size="sm"
                  style={styles.tagBadge}
                />
              ))}
              {item.tags.length > 3 && (
                <Badge
                  label={`+${item.tags.length - 3}`}
                  variant="info"
                  size="sm"
                  style={styles.tagBadge}
                />
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              <Button
                title="Ver perfil"
                variant="outline"
                size="sm"
                leftIcon={<Icons.User size={16} color={theme.colors.primary} />}
                onPress={() => navigateToProfileDetails(item.id)}
                style={styles.viewProfileButton}
              />
              
              <Button
                title="Mensagem"
                size="sm"
                leftIcon={<Icons.ChatCircle size={16} color="#FFFFFF" />}
                onPress={() => handleSendMessage(item.id)}
              />
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  // Renderizar componente de carregamento
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((item) => (
        <SkeletonCard key={item} style={styles.skeletonCard} />
      ))}
    </View>
  );

  // Renderizar quando não há resultados
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View 
        style={[
          styles.emptyIcon, 
          { backgroundColor: `${theme.colors.primary}15` }
        ]}
      >
        <Icons.Users size={32} color={theme.colors.primary} />
      </View>
      
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Nenhum resultado encontrado
      </Text>
      
      <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
        {searchQuery 
          ? 'Tente mudar os termos de busca ou remover filtros' 
          : 'Não encontramos perfis para mostrar no momento'
        }
      </Text>
      
      <Button
        title="Atualizar"
        variant="outline"
        leftIcon={<Icons.ArrowClockwise size={16} color={theme.colors.primary} />}
        onPress={handleRefresh}
        style={styles.refreshButton}
      />
    </View>
  );

  // Filtrar perfis pelo texto de busca
  let filteredProfiles = getFilteredProfiles();
  
  // Filtrar por tipo de usuário oposto
  filteredProfiles = getProfilesByUserType(filteredProfiles);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>
              Olá, {userData?.displayName || user?.email?.split('@')[0] || 'Usuário'}
            </Text>
            <Text style={[styles.subGreeting, { color: theme.colors.text.secondary }]}>
              {userData?.userType === 'recruiter' 
                ? 'Encontre profissionais para sua empresa'
                : 'Conecte-se com recrutadores e oportunidades'}
            </Text>
          </View>
          
          {/* Ícone de notificação com contador de mensagens não lidas */}
          <View style={styles.notificationContainer}>
            <IconButton
              icon={<Icons.Bell size={24} color={theme.colors.text.primary} />}
              variant="ghost"
              size="md"
              onPress={navigateToMessages}
              style={styles.notificationButton}
            />
            {unreadMessagesCount > 0 && (
              <View style={[
                styles.notificationBadge,
                { backgroundColor: theme.colors.primary }
              ]}>
                <Text style={styles.notificationCount}>
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.searchInputContainer}>
          <Input
            placeholder={userData?.userType === 'recruiter' 
              ? "Buscar profissionais por nome, cargo ou habilidade..." 
              : "Buscar recrutadores por nome, cargo ou empresa..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Icons.MagnifyingGlass size={20} color={theme.colors.text.secondary} />}
            containerStyle={styles.searchContainer}
          />
        </View>
      </View>
      
      <View style={styles.contentHeading}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          {userData?.userType === 'recruiter' 
            ? 'Profissionais Disponíveis'
            : 'Recrutadores Ativos'}
        </Text>
        
        <TouchableOpacity 
          onPress={navigateToProfessionals}
          style={styles.viewAllLink}
        >
          <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
            Ver todos
          </Text>
          <Icons.ArrowRight size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredProfiles}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredProfiles.length === 0 && styles.emptyList
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
        ListEmptyComponent={isLoading ? renderLoading : renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationButton: {
    marginTop: -4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchInputContainer: {
    marginBottom: 8,
  },
  searchContainer: {
    marginBottom: 0,
  },
  contentHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  resultCount: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyList: {
    flex: 1,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  profileCardContent: {
    padding: 16,
  },
  profileCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
  },
  availableBadge: {
    alignSelf: 'flex-start',
    marginLeft: 'auto',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewProfileButton: {
    flex: 1,
    marginRight: 8,
  },
  loadingContainer: {
    marginTop: 16,
  },
  skeletonCard: {
    marginBottom: 16,
    height: 150,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    width: 150,
  },
});