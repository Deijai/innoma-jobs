// app/(app)/professionals/index.tsx
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Input } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { db } from '@/services/firebase';
import { ProfileCard } from '@/components/home/ProfileCard';

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

export default function ProfessionalsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  
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
      // Pegar perfis de profissionais (tipo oposto ao do usuário atual)
      const profilesRef = collection(db, 'profiles');
      
      // Determinar qual tipo de perfil buscar baseado no tipo do usuário atual
      const userType = userData?.userType === 'recruiter' ? 'professional' : 'recruiter';
      
      // Criar uma consulta com filtro de tipo e limite
      const q = query(
        profilesRef,
        where('userType', '==', userType),
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

  // Navegar para detalhes do perfil
  const navigateToProfileDetails = (profileId: string) => {
    router.push(`/professionals/${profileId}`);
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
    </View>
  );

  // Filtrar perfis pelo texto de busca
  let filteredProfiles = getFilteredProfiles();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
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
      
      <FlatList
        data={filteredProfiles}
        renderItem={({ item }) => (
          <ProfileCard 
            profile={item}
            onViewProfile={navigateToProfileDetails}
          />
        )}
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
  searchInputContainer: {
    padding: 16,
    marginBottom: 8,
  },
  searchContainer: {
    marginBottom: 0,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyList: {
    flex: 1,
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
});