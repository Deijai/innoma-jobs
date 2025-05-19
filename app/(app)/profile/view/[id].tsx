import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
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
  ViewStyle,
} from 'react-native';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Divider } from '../../../../components/ui/Divider';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { SkeletonProfileHeader } from '../../../../components/ui/Skeleton';
import { useToast } from '../../../../components/ui/Toast';
import { db } from '../../../../services/firebase';

// Importação dos componentes criados
import { EducationSection } from '../../../../components/profile/view/EducationSection';
import { ExperiencesSection } from '../../../../components/profile/view/ExperiencesSection';
import { LanguagesSection } from '../../../../components/profile/view/LanguagesSection';
import { ProfileHeader } from '../../../../components/profile/view/ProfileHeader';
import { ProfileInfoSection } from '../../../../components/profile/view/ProfileInfoSection';
import { ProfileTabs } from '../../../../components/profile/view/ProfileTabs';
import { ProjectDetail } from '../../../../components/profile/view/ProjectDetail';
import { ProjectList } from '../../../../components/profile/view/ProjectList';

// Interface para os dados do projeto
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
}

// Interface para os dados do perfil
interface ProfileData {
  id: string;
  name: string;
  title: string;
  about: string;
  location: string;
  skills: string[];
  education: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];
  experience: {
    id: string;
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
  }[];
  languages: {
    id: string;
    language: string;
    level: string;
  }[];
  projects: Project[];
  photoURL?: string;
  available: boolean;
}

export default function ViewProfileScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const profileId = params.id as string;
  const { showToast } = useToast();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects'>('profile');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Verificar se o usuário está visualizando seu próprio perfil
  const isOwnProfile = user?.uid === profileId;

  // Carregar dados do perfil
  useEffect(() => {
    loadProfileData();
  }, [profileId]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      if (!profileId) {
        showToast('ID do perfil não fornecido', 'error');
        return;
      }

      // Buscar dados do perfil no Firestore
      const profileRef = doc(db, 'profiles', profileId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const data = profileDoc.data();
        
        // Garantir que todos os projetos tenham o campo likedBy
        const enhancedProjects = (data.projects || []).map((project: Project) => ({
          ...project,
          likedBy: project.likedBy || [],
        }));
        
        setProfileData({
          id: profileDoc.id,
          name: data.name || 'Nome não informado',
          title: data.title || 'Título não informado',
          about: data.about || '',
          location: data.location || 'Localização não informada',
          skills: data.skills || [],
          education: data.education || [],
          experience: data.experience || [],
          languages: data.languages || [],
          projects: enhancedProjects,
          photoURL: data.photoURL,
          available: data.available || false,
        });
      } else {
        showToast('Perfil não encontrado', 'error');
        router.back();
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showToast('Erro ao carregar dados do perfil', 'error');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  // Função para dar like/match em um projeto
  const likeProject = async (projectId: string) => {
    if (!user?.uid || !profileData || isLiking) return;
    
    setIsLiking(true);
    
    try {
      // Encontra o projeto específico
      const projectIndex = profileData.projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        showToast('Projeto não encontrado', 'error');
        return;
      }
      
      const project = profileData.projects[projectIndex];
      const projectLikedBy = project.likedBy || [];
      const hasLiked = projectLikedBy.includes(user.uid);
      
      // Cria uma cópia dos projetos para atualização
      const updatedProjects = [...profileData.projects];
      
      if (hasLiked) {
        // Remover like
        updatedProjects[projectIndex] = {
          ...updatedProjects[projectIndex],
          likes: Math.max((updatedProjects[projectIndex].likes || 0) - 1, 0),
          likedBy: projectLikedBy.filter(id => id !== user.uid)
        };
        showToast('Curtida removida com sucesso!', 'info');
      } else {
        // Adicionar like
        updatedProjects[projectIndex] = {
          ...updatedProjects[projectIndex],
          likes: (updatedProjects[projectIndex].likes || 0) + 1,
          likedBy: [...projectLikedBy, user.uid]
        };
        showToast('Você deu match neste projeto!', 'success');
      }
      
      // Atualizar no Firestore
      const profileRef = doc(db, 'profiles', profileId);
      await updateDoc(profileRef, {
        projects: updatedProjects,
        updatedAt: new Date().toISOString(),
      });
      
      // Atualizar o estado local
      setProfileData(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          projects: updatedProjects
        };
      });
    } catch (error) {
      console.error('Erro ao dar curtida no projeto:', error);
      showToast('Erro ao processar sua curtida', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  // Verificar se o usuário atual curtiu um determinado projeto
  const isProjectLiked = (projectId: string): boolean => {
    if (!user?.uid || !profileData) return false;
    
    const project = profileData.projects.find(p => p.id === projectId);
    if (!project) return false;
    
    return (project.likedBy || []).includes(user.uid);
  };

  // Abrir vídeo do projeto
  const openVideo = (videoUrl?: string) => {
    if (!videoUrl) return;
    openUrl(videoUrl);
  };

  // Funções para abrir URLs
  const openUrl = (url?: string) => {
    if (!url) return;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        showToast('Não foi possível abrir este link', 'error');
      }
    });
  };

  // Compartilhar perfil
  const shareProfile = async () => {
    try {
      const result = await Share.share({
        message: `Confira o perfil profissional de ${profileData?.name}: https://innomajobs.app/profile/${profileId}`,
        title: 'Compartilhar Perfil Profissional',
      });
    } catch (error) {
      showToast('Erro ao compartilhar perfil', 'error');
    }
  };

  // Compartilhar projeto
  const shareProject = async (project: Project) => {
    try {
      const result = await Share.share({
        message: `Confira o projeto "${project.title}" de ${profileData?.name}: ${project.demoUrl || project.repoUrl || 'https://innomajobs.app/project/' + project.id}`,
        title: 'Compartilhar Projeto',
      });
    } catch (error) {
      showToast('Erro ao compartilhar projeto', 'error');
    }
  };

  // Iniciar chat
  const startChat = () => {
    if (!profileData) return;

    // Implementação futura
    Alert.alert('Mensagem', `Iniciar conversa com ${profileData.name}`);
    // router.push(`/messages/chat/${profileId}`);
  };

  // Navegar para edição de perfil
  const navigateToEditProfile = () => {
    if (isOwnProfile) {
      router.push('/profile/edit');
    }
  };

  // Navegar para editar projeto
  const navigateToEditProject = (projectId: string) => {
    if (isOwnProfile) {
      router.push(`/projects/edit/${projectId}`);
    }
  };

  // Navegar para adicionar projeto
  const navigateToAddProject = () => {
    if (isOwnProfile) {
      router.push('/projects/add');
    }
  };

  // Remover projeto
  const handleRemoveProject = async (projectId: string) => {
    if (!isOwnProfile || !user?.uid) return;
    
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
          onPress: async () => {
            try {
              const profileRef = doc(db, 'profiles', user.uid);
              const profileDoc = await getDoc(profileRef);
              
              if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                const projects = profileData.projects || [];
                
                // Filtrar o projeto a ser removido
                const updatedProjects = projects.filter((p: Project) => p.id !== projectId);
                
                // Atualizar a lista de projetos no Firestore
                await updateDoc(profileRef, {
                  projects: updatedProjects,
                  updatedAt: new Date().toISOString(),
                });
                
                // Atualizar estado local
                setProfileData(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    projects: prev.projects.filter(p => p.id !== projectId)
                  };
                });
                
                // Se estiver visualizando um projeto, voltar para a lista
                if (selectedProject === projectId) {
                  setSelectedProject(null);
                }
                
                showToast('Projeto removido com sucesso', 'success');
              }
            } catch (error) {
              console.error('Erro ao remover projeto:', error);
              showToast('Erro ao remover projeto', 'error');
            }
          },
        },
      ]
    );
  };

  // Se estiver carregando, mostrar skeleton
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.loadingContainer}>
          <SkeletonProfileHeader style={styles.skeletonHeader} />
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
            <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
            <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Se não houver dados de perfil, mostrar mensagem de erro
  if (!profileData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            Não foi possível carregar o perfil
          </Text>
          <Button
            title="Tentar novamente"
            onPress={loadProfileData}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Encontrar o projeto selecionado
  const selectedProjectData = selectedProject
    ? profileData.projects.find(p => p.id === selectedProject)
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {isLiking && <LoadingOverlay message="Processando curtida..." />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho do perfil */}
        <ProfileHeader
          name={profileData.name}
          title={profileData.title}
          location={profileData.location}
          photoURL={profileData.photoURL}
          available={profileData.available}
          onShare={shareProfile}
          onMessage={startChat}
          theme={theme}
          isOwnProfile={isOwnProfile}
          onEdit={navigateToEditProfile}
        />

        {/* Tabs de navegação */}
        <ProfileTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          theme={theme}
        />

        <Divider spacing={8} />

        {/* Conteúdo da aba de perfil */}
        {activeTab === 'profile' && !selectedProject && (
          <>
            <Card style={styles.sectionCard as ViewStyle}>
              <View style={styles.sectionContent}>
                <ProfileInfoSection
                  about={profileData.about}
                  skills={profileData.skills}
                  theme={theme}
                />
              </View>
            </Card>

            <Card style={styles.sectionCard as ViewStyle}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Experiência
                </Text>
              </View>
              <View style={styles.sectionContent}>
                <ExperiencesSection
                  experiences={profileData.experience}
                  theme={theme}
                />
              </View>
            </Card>

            <Card style={styles.sectionCard as ViewStyle}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Formação acadêmica
                </Text>
              </View>
              <View style={styles.sectionContent}>
                <EducationSection
                  education={profileData.education}
                  theme={theme}
                />
              </View>
            </Card>

            <Card style={styles.sectionCard as ViewStyle}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Idiomas
                </Text>
              </View>
              <View style={styles.sectionContent}>
                <LanguagesSection
                  languages={profileData.languages}
                  theme={theme}
                />
              </View>
            </Card>

            {/* Só mostrar botão de mensagem se não for o próprio perfil */}
            {!isOwnProfile && (
              <View style={styles.contactSection}>
                <Button
                  title="Enviar mensagem"
                  onPress={startChat}
                  style={styles.contactButton}
                  fullWidth
                  leftIcon={<Icons.ChatTeardropText size={20} color="#FFFFFF" />}
                />
              </View>
            )}

            {/* Mostrar botão de edição se for o próprio perfil */}
            {isOwnProfile && (
              <View style={styles.contactSection}>
                <Button
                  title="Editar perfil"
                  onPress={navigateToEditProfile}
                  style={styles.contactButton}
                  fullWidth
                  variant="outline"
                  leftIcon={<Icons.PencilSimple size={20} color={theme.colors.primary} />}
                />
              </View>
            )}
          </>
        )}

        {/* Conteúdo da aba de projetos */}
        {activeTab === 'projects' && !selectedProject && (
          <View style={styles.projectsSection}>
            <ProjectList
              projects={profileData.projects}
              onSelectProject={setSelectedProject}
              theme={theme}
              isOwnProfile={isOwnProfile}
              onAddProject={navigateToAddProject}
              onLikeProject={likeProject}
              isProjectLiked={isProjectLiked}
              onEditProject={navigateToEditProject}
              onRemoveProject={handleRemoveProject}
            />
          </View>
        )}

        {/* Visualização detalhada de um projeto */}
        {selectedProject && selectedProjectData && (
          <View style={styles.projectDetailSection}>
            <ProjectDetail
              project={selectedProjectData}
              onBack={() => setSelectedProject(null)}
              onLike={(projectId) => likeProject(projectId)}
              onShare={shareProject}
              onOpenUrl={openUrl}
              onOpenVideo={openVideo}
              onEdit={navigateToEditProject}
              onRemove={handleRemoveProject}
              theme={theme}
              isOwnProfile={isOwnProfile}
              isLiked={isProjectLiked(selectedProjectData.id)}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactSection: {
    padding: 24,
    paddingTop: 8,
  },
  contactButton: {
    marginTop: 16,
  },
  skeletonHeader: {
    padding: 24,
  },
  skeletonContent: {
    padding: 24,
  },
  skeletonSection: {
    height: 120,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    width: 200,
  },
  projectsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  projectDetailSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});