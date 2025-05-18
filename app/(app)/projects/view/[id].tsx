import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button } from '../../../../components/ui/Button';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { useToast } from '../../../../components/ui/Toast';
import { db } from '../../../../services/firebase';

// Componentes personalizados
import ProjectImageCarousel from '@/components/projects/ProjectImageCarousel';
import ProjectSkillsList from '@/components/projects/ProjectSkillsList';
import ProjectActions from '../../../../components/projects/ProjectActions';
import ProjectLinks from '../../../../components/projects/ProjectLinks';

// Interface para os dados de projeto
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

export default function ViewProjectScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  
  // Carregar dados do projeto
  useEffect(() => {
    loadProject();
  }, [projectId]);
  
  // Função para carregar o projeto
  const loadProject = async () => {
    setIsLoading(true);
    
    try {
      if (!projectId) {
        showToast('ID do projeto não fornecido', 'error');
        router.back();
        return;
      }
      
      // Buscar projetos no Firestore (primeiro o do usuário atual)
      if (user?.uid) {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          
          if (profileData.projects && Array.isArray(profileData.projects)) {
            const foundProject = profileData.projects.find(p => p.id === projectId);
            
            if (foundProject) {
              setProject(foundProject);
              setIsOwner(true);
              setIsLoading(false);
              return;
            }
          }
        }
      }
      
      // Se não for do usuário atual, buscar em todos os perfis
      const profilesRef = collection(db, 'profiles');
      const profilesSnapshot = await getDocs(profilesRef);
      
      let foundProject = null;
      
      for (const profileDoc of profilesSnapshot.docs) {
        const profileData = profileDoc.data();
        
        if (profileData.projects && Array.isArray(profileData.projects)) {
          const projectMatch = profileData.projects.find(p => p.id === projectId);
          
          if (projectMatch) {
            foundProject = projectMatch;
            break;
          }
        }
      }
      
      if (foundProject) {
        setProject(foundProject);
      } else {
        showToast('Projeto não encontrado', 'error');
        // Para demonstração, criar um projeto fictício
        setProject(createMockProject(projectId));
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      showToast('Erro ao carregar dados do projeto', 'error');
      
      // Para demonstração, criar um projeto fictício
      setProject(createMockProject(projectId));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para criar um projeto fictício para demonstração
  const createMockProject = (id: string): Project => {
    return {
      id,
      title: 'Innoma Jobs - App de Empregos',
      description: 'Aplicativo mobile para conectar profissionais e recrutadores. Desenvolvido com React Native, Expo e Firebase. Permite a criação de perfis profissionais, compartilhamento de projetos e comunicação direta entre candidatos e empresas.',
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
    };
  };
  
  // Função para dar like/match no projeto
  const handleLikeProject = async () => {
    if (!project) return;
    
    try {
      // Implementação futura: atualizar likes no Firestore
      
      // Atualizar contador local
      setProject(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      
      showToast('Você deu match neste projeto!', 'success');
    } catch (error) {
      console.error('Erro ao dar like no projeto:', error);
      showToast('Erro ao dar like no projeto', 'error');
    }
  };
  
  // Função para compartilhar o projeto
  const handleShareProject = async () => {
    if (!project) return;
    
    try {
      const result = await Share.share({
        message: `Confira o projeto "${project.title}": ${project.demoUrl || project.repoUrl || `https://innomajobs.app/projects/${project.id}`}`,
        title: 'Compartilhar Projeto',
      });
    } catch (error) {
      console.error('Erro ao compartilhar projeto:', error);
      showToast('Erro ao compartilhar projeto', 'error');
    }
  };
  
  // Função para abrir URLs
  const handleOpenUrl = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        showToast('Não foi possível abrir este link', 'error');
      }
    });
  };
  
  // Função para abrir vídeo
  const handleOpenVideo = (videoUrl: string) => {
    handleOpenUrl(videoUrl);
  };
  
  // Função para editar o projeto
  const handleEditProject = () => {
    if (!project) return;
    
    router.push(`/projects/edit/${project.id}`);
  };
  
  // Função para confirmar a remoção do projeto
  const confirmRemoveProject = () => {
    if (!project) return;
    
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
          onPress: handleRemoveProject,
        },
      ]
    );
  };
  
  // Função para remover o projeto
  const handleRemoveProject = async () => {
    if (!project || !user?.uid) return;
    
    try {
      // Implementação futura: remover projeto do Firestore
      
      showToast('Projeto removido com sucesso', 'success');
      router.replace('/projects');
    } catch (error) {
      console.error('Erro ao remover projeto:', error);
      showToast('Erro ao remover projeto', 'error');
    }
  };
  
  // Renderizar o carregamento
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="auto" />
        <LoadingOverlay message="Carregando projeto..." />
      </SafeAreaView>
    );
  }
  
  // Se não houver projeto, mostrar erro
  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="auto" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            Projeto não encontrado
          </Text>
          <Button
            title="Voltar"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar a visualização do projeto
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carrossel de imagens */}
        <ProjectImageCarousel 
          images={project.images} 
          theme={theme} 
        />
        
        {/* Conteúdo principal */}
        <View style={styles.content}>
          {/* Título e descrição */}
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {project.title}
          </Text>
          
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {project.description}
          </Text>
          
          {/* Habilidades */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Tecnologias utilizadas
            </Text>
            
            <ProjectSkillsList 
              skills={project.skills} 
              theme={theme} 
            />
          </View>
          
          {/* Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Links
            </Text>
            
            <ProjectLinks
              repoUrl={project.repoUrl}
              demoUrl={project.demoUrl}
              videoUrl={project.videoUrl}
              githubUrl={project.githubUrl}
              linkedinUrl={project.linkedinUrl}
              onOpenUrl={handleOpenUrl}
              onOpenVideo={handleOpenVideo}
            />
          </View>
          
          {/* Ações */}
          <ProjectActions
            isOwner={isOwner}
            onEdit={handleEditProject}
            onRemove={confirmRemoveProject}
            onLike={handleLikeProject}
            onShare={handleShareProject}
            likeCount={project.likes}
            theme={theme}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    width: 150,
  },
});