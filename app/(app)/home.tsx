import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
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
import { db } from '../../services/firebase';

// Tipos de dados
interface ProfileData {
  id: string;
  name: string;
  title: string;
  location: string;
  tags: string[];
  photoURL?: string;
  available: boolean;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  
  // Carregar perfis iniciais
  useEffect(() => {
    loadProfiles();
  }, []);

  // Função para carregar perfis
  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      console.log("Carregando perfis...");
      
      // Pegar todos os perfis sem filtrar por tipo de usuário
      // Modificação importante: remover o filtro de userType que pode estar causando o problema
      const profilesRef = collection(db, 'profiles');
      
      // Criar uma consulta mais simples, apenas com limit
      const q = query(
        profilesRef,
        limit(20)
      );
      
      console.log("Executando consulta ao Firestore...");
      const querySnapshot = await getDocs(q);
      
      console.log(`Encontrados ${querySnapshot.size} perfis`);
      const loadedProfiles: ProfileData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Processando perfil: ${doc.id}`, data);
        
        // Verificar se temos os dados mínimos necessários
        if (data) {
          loadedProfiles.push({
            id: doc.id,
            name: data.name || 'Usuário',
            title: data.title || 'Título não definido',
            location: data.location || 'Localização não definida',
            tags: data.skills || [],
            photoURL: data.photoURL,
            available: data.available || false,
          });
        }
      });
      
      console.log(`Perfis processados: ${loadedProfiles.length}`);
      setProfiles(loadedProfiles);
      
      if (loadedProfiles.length === 0) {
        console.log("Nenhum perfil encontrado, usando dados de demonstração");
        // Usar dados de demonstração apenas se não encontrarmos nenhum perfil
        const mockProfiles: ProfileData[] = [
          {
            id: '1',
            name: 'João Silva',
            title: 'Desenvolvedor Full Stack',
            location: 'São Paulo, SP',
            tags: ['React', 'Node.js', 'TypeScript'],
            available: true,
          },
          {
            id: '2',
            name: 'Maria Oliveira',
            title: 'UX/UI Designer',
            location: 'Rio de Janeiro, RJ',
            tags: ['Figma', 'Adobe XD', 'UI Design'],
            available: false,
          },
          {
            id: '3',
            name: 'Pedro Santos',
            title: 'Mobile Developer',
            location: 'Belo Horizonte, MG',
            tags: ['React Native', 'Flutter', 'Mobile'],
            available: true,
          },
          {
            id: '4',
            name: 'Ana Souza',
            title: 'Product Manager',
            location: 'Curitiba, PR',
            tags: ['Agile', 'Scrum', 'Product'],
            available: true,
          },
          {
            id: '5',
            name: 'Carlos Mendes',
            title: 'Data Scientist',
            location: 'Porto Alegre, RS',
            tags: ['Python', 'Machine Learning', 'AI'],
            available: false,
          },
        ];
        
        setProfiles(mockProfiles);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      
      // Para fins de demonstração, vamos adicionar alguns perfis fictícios
      // Em produção, isso seria removido
      const mockProfiles: ProfileData[] = [
        {
          id: '1',
          name: 'João Silva',
          title: 'Desenvolvedor Full Stack',
          location: 'São Paulo, SP',
          tags: ['React', 'Node.js', 'TypeScript'],
          available: true,
        },
        {
          id: '2',
          name: 'Maria Oliveira',
          title: 'UX/UI Designer',
          location: 'Rio de Janeiro, RJ',
          tags: ['Figma', 'Adobe XD', 'UI Design'],
          available: false,
        },
        {
          id: '3',
          name: 'Pedro Santos',
          title: 'Mobile Developer',
          location: 'Belo Horizonte, MG',
          tags: ['React Native', 'Flutter', 'Mobile'],
          available: true,
        },
        {
          id: '4',
          name: 'Ana Souza',
          title: 'Product Manager',
          location: 'Curitiba, PR',
          tags: ['Agile', 'Scrum', 'Product'],
          available: true,
        },
        {
          id: '5',
          name: 'Carlos Mendes',
          title: 'Data Scientist',
          location: 'Porto Alegre, RS',
          tags: ['Python', 'Machine Learning', 'AI'],
          available: false,
        },
      ];
      
      setProfiles(mockProfiles);
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

  // Navegar para detalhes do perfil
  const navigateToProfileDetails = (profileId: string) => {
    router.push(`/profile/view/${profileId}`);
  };

  // Navegar para mensagens
  const handleSendMessage = (profileId: string) => {
    // Implementação futura
    console.log(`Enviar mensagem para: ${profileId}`);
  };

  // Renderizar item do perfil
  const renderProfileItem = ({ item }: { item: ProfileData }) => (
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
              <View 
                style={[
                  styles.locationIcon, 
                  { backgroundColor: theme.colors.text.disabled }
                ]} 
              />
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
            onPress={() => navigateToProfileDetails(item.id)}
            style={styles.viewProfileButton}
          />
          
          <Button
            title="Mensagem"
            size="sm"
            onPress={() => handleSendMessage(item.id)}
          />
        </View>
      </TouchableOpacity>
    </Card>
  );

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
        <View 
          style={[
            styles.emptyIconInner, 
            { backgroundColor: theme.colors.primary }
          ]} 
        />
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
        onPress={handleRefresh}
        style={styles.refreshButton}
      />
    </View>
  );

  const filteredProfiles = getFilteredProfiles();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>
            Olá, {userData?.displayName || user?.email?.split('@')[0] || 'Usuário'}
          </Text>
          
          <IconButton
            icon={
              <View style={styles.notificationIcon}>
                <View style={[styles.notificationIconInner, { borderColor: theme.colors.text.primary }]} />
              </View>
            }
            variant="ghost"
            size="sm"
          />
        </View>
        
        <Input
          placeholder={userData?.userType === 'recruiter' 
            ? "Buscar profissionais..." 
            : "Buscar recrutadores..."}
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
        data={filteredProfiles}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
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
    padding: 16,
    paddingTop: 8,
  },
  profileCard: {
    marginBottom: 16,
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
  locationIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
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
  },
  emptyContainer: {
    marginTop: 32,
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
  emptyIconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
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