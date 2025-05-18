import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { db } from '../../../services/firebase';

// Definição da interface para os dados de projeto
interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  images: string[];
  videoUrl?: string;
  skills: string[];
  likes: number;
  createdAt: string;
}

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Carregar projetos
  useEffect(() => {
    loadProjects();
  }, []);
  
  // Função para carregar os projetos
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      if (user?.uid) {
        // Buscar projetos no Firestore
        const profileRef = collection(db, 'profiles');
        const q = query(profileRef, where('id', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data();
          if (profileData.projects && Array.isArray(profileData.projects)) {
            setProjects(profileData.projects);
          } else {
            // Perfil existe mas não tem projetos
            setProjects([]);
          }
        } else {
          // Usuário não tem perfil ainda
          setProjects([]);
        }
      } else {
        // Não há usuário logado
        setProjects([]);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      // Para demonstração, vamos usar alguns projetos fictícios
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'Innoma Jobs - App de Empregos',
          description: 'Aplicativo mobile para conectar profissionais e recrutadores. Desenvolvido com React Native, Expo e Firebase.',
          repoUrl: 'https://github.com/user/innoma-jobs',
          demoUrl: 'https://innomajobs.app',
          githubUrl: 'https://github.com/user',
          linkedinUrl: 'https://linkedin.com/in/user',
          images: [
            'https://via.placeholder.com/500x300/4361EE/FFFFFF?text=Tela+Inicial',
            'https://via.placeholder.com/500x300/4361EE/FFFFFF?text=Perfil',
            'https://via.placeholder.com/500x300/4361EE/FFFFFF?text=Busca'
          ],
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          skills: ['React Native', 'Expo', 'Firebase', 'TypeScript'],
          likes: 42,
          createdAt: '2023-10-10T14:48:00.000Z',
        },
        {
          id: '2',
          title: 'E-commerce Dashboard',
          description: 'Dashboard administrativo para gestão de e-commerce. Frontend em React com Material UI, backend em Node.js com Express.',
          repoUrl: 'https://github.com/user/ecommerce-dashboard',
          githubUrl: 'https://github.com/user',
          images: [
            'https://via.placeholder.com/500x300/3F37C9/FFFFFF?text=Dashboard',
            'https://via.placeholder.com/500x300/3F37C9/FFFFFF?text=Relatórios'
          ],
          skills: ['React', 'Node.js', 'Express', 'MongoDB'],
          likes: 27,
          createdAt: '2023-07-15T10:30:00.000Z',
        }
      ];
      setProjects(mockProjects);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Atualizar ao puxar para baixo
  const handleRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };
  
  // Navegar para adicionar novo projeto
  const navigateToAddProject = () => {
    router.push('/projects/add');
  };
  
  // Navegar para visualizar um projeto
  const navigateToViewProject = (id: string) => {
    router.push(`/projects/view/${id}`);
  };
  
  // Navegar para editar um projeto
  const navigateToEditProject = (id: string) => {
    router.push(`/projects/edit/${id}`);
  };
  
  // Confirmar e remover um projeto
  const confirmRemoveProject = (id: string) => {
    Alert.alert(
      'Remover projeto',
      'Tem certeza que deseja remover este projeto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => handleRemoveProject(id),
        },
      ]
    );
  };
  
  // Função para remover um projeto
  const handleRemoveProject = async (id: string) => {
    // Implementação futura: remover projeto do Firestore
    Alert.alert('Projeto removido', 'O projeto foi removido com sucesso.');
    
    // Atualizar lista local
    setProjects(current => current.filter(project => project.id !== id));
  };
  
  // Renderizar item da lista
  const renderProjectItem = ({ item }: { item: Project }) => (
    <Card style={styles.projectCard}>
      <View style={styles.projectCardHeader}>
        <Text style={[styles.projectTitle, { color: theme.colors.text.primary }]}>
          {item.title}
        </Text>
      </View>
      
      <Text 
        style={[styles.projectDescription, { color: theme.colors.text.secondary }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>
      
      <View style={styles.projectCardFooter}>
        <View style={styles.projectCardActions}>
          <Button
            title="Ver"
            variant="outline"
            size="sm"
            onPress={() => navigateToViewProject(item.id)}
            style={styles.actionButton}
          />
          
          <Button
            title="Editar"
            variant="outline"
            size="sm"
            onPress={() => navigateToEditProject(item.id)}
            style={styles.actionButton}
          />
          
          <Button
            title="Remover"
            variant="outline"
            size="sm"
            onPress={() => confirmRemoveProject(item.id)}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Card>
  );
  
  // Renderizar conteúdo vazio
  const renderEmptyContent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Você ainda não tem projetos
      </Text>
      <Text style={[styles.emptyDescription, { color: theme.colors.text.secondary }]}>
        Adicione seu primeiro projeto para compartilhar com recrutadores
      </Text>
      <Button
        title="Adicionar projeto"
        onPress={navigateToAddProject}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Button
          title="Novo Projeto"
          onPress={navigateToAddProject}
          fullWidth
        />
      </View>
      
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
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
        ListEmptyComponent={renderEmptyContent}
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  projectCard: {
    marginBottom: 16,
    padding: 16,
  },
  projectCardHeader: {
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  projectCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  projectCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    width: 200,
  },
});