import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { useToast } from '../../../components/ui/Toast';
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
  const { showToast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Carregar projetos
  useEffect(() => {
    loadProjects();
  }, []);
  
  // Função para carregar os projetos
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      if (!user?.uid) {
        setProjects([]);
        return;
      }

      // Buscar perfil diretamente pelo documento
      const profileDocRef = doc(db, 'profiles', user.uid);
      const profileDocSnap = await getDoc(profileDocRef);
      
      if (profileDocSnap.exists()) {
        const profileData = profileDocSnap.data();
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
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      showToast("Erro ao carregar projetos. Tente novamente.", "error");
      
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
      'Tem certeza que deseja remover este projeto? Esta ação não pode ser desfeita.',
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
    if (!user?.uid) return;
    
    setIsDeleting(true);
    
    try {
      // Buscar perfil no Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDocSnap = await getDoc(profileRef);
      
      if (profileDocSnap.exists()) {
        const profileData = profileDocSnap.data();
        const projects = profileData.projects || [];
        
        // Filtrar o projeto a ser removido
        const updatedProjects = projects.filter((project: Project) => project.id !== id);
        
        // Atualizar a lista de projetos no Firestore
        await updateDoc(profileRef, {
          projects: updatedProjects,
          updatedAt: new Date().toISOString(),
        });
        
        // Atualizar a lista local
        setProjects(updatedProjects);
        showToast('Projeto removido com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao remover projeto:', error);
      showToast('Erro ao remover projeto. Tente novamente.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Renderizar item da lista
  const renderProjectItem = ({ item }: { item: Project }) => (
    <Card style={styles.projectCard}>
      {/* Thumbnail do projeto (primeira imagem) */}
      {item.images && item.images.length > 0 && (
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={styles.projectCardContent}>
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
        
        {/* Skills do projeto */}
        {item.skills && item.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {item.skills.slice(0, 3).map((skill, index) => (
              <View 
                key={`skill-${index}`} 
                style={[
                  styles.skillChip, 
                  { backgroundColor: `${theme.colors.primary}15` }
                ]}
              >
                <Text style={[styles.skillText, { color: theme.colors.primary }]}>
                  {skill}
                </Text>
              </View>
            ))}
            {item.skills.length > 3 && (
              <View 
                style={[
                  styles.skillChip, 
                  { backgroundColor: `${theme.colors.info}15` }
                ]}
              >
                <Text style={[styles.skillText, { color: theme.colors.info }]}>
                  +{item.skills.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <Divider style={styles.divider} />
        
        <View style={styles.projectCardFooter}>
          <Button
            title="Ver"
            variant="outline"
            size="sm"
            onPress={() => navigateToViewProject(item.id)}
            style={styles.actionButton}
            leftIcon={<Icons.Eye size={16} color={theme.colors.primary} />}
          />
          
          <Button
            title="Editar"
            variant="outline"
            size="sm"
            onPress={() => navigateToEditProject(item.id)}
            style={styles.actionButton}
            leftIcon={<Icons.PencilSimple size={16} color={theme.colors.primary} />}
          />
          
          <Button
            title="Remover"
            variant="outline"
            size="sm"
            onPress={() => confirmRemoveProject(item.id)}
            style={styles.actionButton}
            leftIcon={<Icons.Trash size={16} color={theme.colors.primary} />}
          />
        </View>
      </View>
    </Card>
  );
  
  // Renderizar conteúdo vazio
  const renderEmptyContent = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
        <Icons.Briefcase size={48} color={theme.colors.primary} />
      </View>
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
        leftIcon={<Icons.Plus size={20} color="#FFFFFF" />}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      {isDeleting && <LoadingOverlay message="Removendo projeto..." />}
      
      <View style={styles.header}>
        <Button
          title="Novo Projeto"
          onPress={navigateToAddProject}
          fullWidth
          leftIcon={<Icons.Plus size={20} color="#FFFFFF" />}
        />
      </View>
      
      {isLoading ? (
        <LoadingOverlay message="Carregando projetos..." />
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            projects.length === 0 && styles.emptyList
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
          ListEmptyComponent={renderEmptyContent}
        />
      )}
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
    paddingTop: 0,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  projectCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 150,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  projectCardContent: {
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
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillChip: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  projectCardFooter: {
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
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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