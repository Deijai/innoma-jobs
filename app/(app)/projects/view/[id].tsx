import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { useToast } from '../../../../components/ui/Toast';
import { db } from '../../../../services/firebase';

// Componentes personalizados
import ProjectSkillsList from '@/components/projects/ProjectSkillsList';
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
  likedBy?: string[]; // Array de IDs de usuários que curtiram
  createdAt: string;
  authorId?: string; // ID do criador do projeto
}

export default function ViewProjectScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  // Estado para o visualizador de imagens em tela cheia
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
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
              const enhancedProject = {
                ...foundProject,
                likedBy: foundProject.likedBy || [],
                authorId: user.uid
              };
              
              setProject(enhancedProject);
              setIsOwner(true);
              setProfileId(user.uid);
              
              // Verificar se o usuário já curtiu o projeto
              setIsLiked(
                enhancedProject.likedBy && 
                enhancedProject.likedBy.includes(user.uid)
              );
              
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
      let projectOwnerId = null;
      
      for (const profileDoc of profilesSnapshot.docs) {
        const profileData = profileDoc.data();
        
        if (profileData.projects && Array.isArray(profileData.projects)) {
          const projectMatch = profileData.projects.find(p => p.id === projectId);
          
          if (projectMatch) {
            foundProject = {
              ...projectMatch,
              likedBy: projectMatch.likedBy || [],
              authorId: profileDoc.id
            };
            projectOwnerId = profileDoc.id;
            break;
          }
        }
      }
      
      if (foundProject) {
        setProject(foundProject);
        setProfileId(projectOwnerId);
        
        // Verificar se o usuário já curtiu o projeto
        if (user?.uid) {
          setIsLiked(
            foundProject.likedBy && 
            foundProject.likedBy.includes(user.uid)
          );
        }
      } else {
        showToast('Projeto não encontrado', 'error');
        router.back();
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      showToast('Erro ao carregar dados do projeto', 'error');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funções para o visualizador de imagens
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };
  
  const nextImage = () => {
    if (project && selectedImageIndex < project.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };
  
  // Função para dar like/match no projeto
  const handleLikeProject = async () => {
    if (!project || !user?.uid || !profileId) return;
    
    // Previne múltiplos cliques durante o processamento
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      const profileRef = doc(db, 'profiles', profileId);
      const profileDoc = await getDoc(profileRef);
      
      if (!profileDoc.exists()) {
        showToast('Perfil do proprietário não encontrado', 'error');
        return;
      }
      
      const profileData = profileDoc.data();
      const projects = profileData.projects || [];
      
      // Encontrar o índice do projeto na array
      const projectIndex = projects.findIndex((p: Project) => p.id === project.id);
      
      if (projectIndex === -1) {
        showToast('Projeto não encontrado', 'error');
        return;
      }
      
      // Verificar se o usuário já curtiu
      const projectLikedBy = projects[projectIndex].likedBy || [];
      const hasLiked = projectLikedBy.includes(user.uid);
      
      // Array atualizada de projetos
      const updatedProjects = [...projects];
      
      if (hasLiked) {
        // Remover like
        updatedProjects[projectIndex] = {
          ...updatedProjects[projectIndex],
          likes: Math.max((updatedProjects[projectIndex].likes || 0) - 1, 0),
          likedBy: projectLikedBy.filter((id: string) => id !== user.uid)
        };
        
        setIsLiked(false);
        showToast('Curtida removida com sucesso!', 'info');
      } else {
        // Adicionar like
        updatedProjects[projectIndex] = {
          ...updatedProjects[projectIndex],
          likes: (updatedProjects[projectIndex].likes || 0) + 1,
          likedBy: [...projectLikedBy, user.uid]
        };
        
        setIsLiked(true);
        showToast('Você deu match neste projeto!', 'success');
      }
      
      // Atualizar no Firestore
      await updateDoc(profileRef, {
        projects: updatedProjects,
        updatedAt: new Date().toISOString(),
      });
      
      // Atualizar o estado local
      setProject(prev => {
        if (!prev) return null;
        
        if (hasLiked) {
          return {
            ...prev,
            likes: Math.max((prev.likes || 0) - 1, 0),
            likedBy: prev.likedBy?.filter(id => id !== user.uid) || []
          };
        } else {
          return {
            ...prev,
            likes: (prev.likes || 0) + 1,
            likedBy: [...(prev.likedBy || []), user.uid]
          };
        }
      });
    } catch (error) {
      console.error('Erro ao dar curtida no projeto:', error);
      showToast('Erro ao processar sua curtida', 'error');
    } finally {
      setIsLiking(false);
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
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        const projects = profileData.projects || [];
        
        // Filtrar o projeto a ser removido
        const updatedProjects = projects.filter((p: Project) => p.id !== project.id);
        
        // Atualizar a lista de projetos no Firestore
        await updateDoc(profileRef, {
          projects: updatedProjects,
          updatedAt: new Date().toISOString(),
        });
        
        showToast('Projeto removido com sucesso', 'success');
        router.replace('/projects');
      }
    } catch (error) {
      console.error('Erro ao remover projeto:', error);
      showToast('Erro ao remover projeto', 'error');
    }
  };
  
  // Renderizar o carregamento
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <LoadingOverlay message="Carregando projeto..." />
      </SafeAreaView>
    );
  }
  
  // Se não houver projeto, mostrar erro
  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
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
      <StatusBar style={isDark ? "light" : "dark"} />
      {isLiking && <LoadingOverlay message="Processando..." />}
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carrossel de imagens */}
        <View style={styles.imageCarouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageCarousel}
          >
            {project.images.map((image, index) => (
              <TouchableOpacity 
                key={`image-${index}`}
                onPress={() => openImageViewer(index)}
                activeOpacity={0.9}
                style={styles.imageContainer}
              >
                <Image
                  source={{ uri: image }}
                  style={[styles.projectImage, { width: screenWidth }]}
                  resizeMode="cover"
                />
                <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                  <Icons.MagnifyingGlassPlus size={24} color="#FFFFFF" style={styles.zoomIcon} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {project.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {project.images.map((_, index) => (
                  <Text 
                    key={`dot-${index}`}
                    style={selectedImageIndex === index ? styles.activeDot : styles.inactiveDot}
                  >
                    •
                  </Text>
                ))}
              </Text>
            </View>
          )}
        </View>
        
        {/* Conteúdo principal */}
        <View style={styles.content}>
          {/* Ações e estatísticas rápidas */}
          <View style={styles.quickStats}>
            <View style={styles.likeCountContainer}>
              <Icons.Heart 
                size={18} 
                color={theme.colors.primary} 
                weight={project.likes > 0 ? "fill" : "regular"} 
              />
              <Text style={[styles.likeCountText, { color: theme.colors.text.secondary }]}>
                {project.likes || 0}
              </Text>
            </View>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={handleShareProject}
              >
                <Icons.ShareNetwork size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
              
              {!isOwner && (
                <TouchableOpacity 
                  style={[
                    styles.quickActionButton,
                    isLiked && { backgroundColor: `${theme.colors.primary}15` }
                  ]}
                  onPress={handleLikeProject}
                >
                  <Icons.Heart 
                    size={20} 
                    color={isLiked ? theme.colors.primary : theme.colors.text.secondary} 
                    weight={isLiked ? "fill" : "regular"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Título e descrição */}
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {project.title}
          </Text>
          
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {project.description}
          </Text>
          
          {/* Habilidades */}
          <Card style={styles.sectionCard as ViewStyle}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Tecnologias utilizadas
              </Text>
            </View>
            
            <View style={styles.sectionContent}>
              <ProjectSkillsList 
                skills={project.skills} 
                theme={theme} 
              />
            </View>
          </Card>
          
          {/* Links */}
          <Card style={styles.sectionCard as ViewStyle}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Links
              </Text>
            </View>
            
            <View style={styles.sectionContent}>
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
          </Card>
          
          {/* Ações de projeto */}
          <View style={styles.actionContainer}>
            {isOwner ? (
              // Ações para o dono do projeto
              <View style={styles.ownerActions}>
                <Button
                  title="Editar"
                  variant="outline"
                  onPress={handleEditProject}
                  style={styles.actionButton}
                  leftIcon={<Icons.PencilSimple size={18} color={theme.colors.primary} />}
                />
                
                <Button
                  title="Remover"
                  variant="outline"
                  onPress={confirmRemoveProject}
                  style={styles.actionButton}
                  textStyle={{ color: theme.colors.error }}
                  leftIcon={<Icons.Trash size={18} color={theme.colors.error} />}
                />
              </View>
            ) : (
              // Ações para visitantes
              <View style={styles.visitorActions}>
                <Button
                  title={isLiked ? "Remover Match" : "Match"}
                  variant={isLiked ? "primary" : "outline"}
                  onPress={handleLikeProject}
                  style={styles.likeButton}
                  leftIcon={
                    <Icons.Heart 
                      size={18} 
                      color={isLiked ? "#FFFFFF" : theme.colors.primary} 
                      weight={isLiked ? "fill" : "regular"} 
                    />
                  }
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Modal para visualização de imagens em tela cheia */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <SafeAreaView style={[styles.imageViewerContainer, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          <StatusBar style={isDark ? "light" : "dark"} />
          
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity 
              onPress={() => setImageViewerVisible(false)}
              style={styles.closeButton}
            >
              <Icons.X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.imageCounterText}>
              {selectedImageIndex + 1} / {project.images.length}
            </Text>
          </View>
          
          <View style={styles.fullscreenImageContainer}>
            <Image
              source={{ uri: project.images[selectedImageIndex] }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.navigationControls}>
            {selectedImageIndex > 0 && (
              <TouchableOpacity 
                onPress={prevImage}
                style={styles.navButton}
              >
                <Icons.CaretLeft size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            <View style={{ flex: 1 }} />
            
            {selectedImageIndex < project.images.length - 1 && (
              <TouchableOpacity 
                onPress={nextImage}
                style={styles.navButton}
              >
                <Icons.CaretRight size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  imageCarouselContainer: {
    position: 'relative',
    height: 300,
  },
  imageCarousel: {
    height: 300,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  projectImage: {
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  zoomIcon: {
    opacity: 0.8,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  imageCounterText: {
    color: 'white',
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  activeDot: {
    color: '#FFFFFF',
    opacity: 1,
    fontSize: 24,
    marginHorizontal: 2,
  },
  inactiveDot: {
    color: '#FFFFFF',
    opacity: 0.5,
    fontSize: 24,
    marginHorizontal: 2,
  },
  content: {
    padding: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  likeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCountText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visitorActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  likeButton: {
    flex: 0.7,
  },
  shareButton: {
    flex: 1,
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
  // Estilos para o visualizador de imagens em tela cheia
  imageViewerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  navButton: {
    padding: 8,
  },
});