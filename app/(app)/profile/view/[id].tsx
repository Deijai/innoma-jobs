import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
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
import { Divider } from '../../../../components/ui/Divider';
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
  projects: {
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
  }[];
  photoURL?: string;
  available: boolean;
}

export default function ViewProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const profileId = params.id as string;
  const { showToast } = useToast();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
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
          projects: data.projects || [],
          photoURL: data.photoURL,
          available: data.available || false,
        });
      } else {
        showToast('Perfil não encontrado', 'error');
        // Criar perfil fictício para demonstração
        const mockProfile: ProfileData = createMockProfile(profileId);
        setProfileData(mockProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showToast('Erro ao carregar dados do perfil', 'error');

      // Para fins de demonstração, criar perfil fictício
      const mockProfile: ProfileData = createMockProfile(profileId);
      setProfileData(mockProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para criar um perfil fictício para demonstração
  const createMockProfile = (id: string): ProfileData => {
    return {
      id,
      name: 'João Silva',
      title: 'Desenvolvedor Full Stack',
      about: 'Desenvolvedor com 5 anos de experiência em desenvolvimento web e mobile. Especializado em React, React Native, Node.js e TypeScript.',
      location: 'São Paulo, SP',
      skills: ['React', 'React Native', 'Node.js', 'TypeScript', 'Firebase', 'MongoDB'],
      education: [
        {
          id: '1',
          institution: 'Universidade de São Paulo',
          degree: 'Bacharelado',
          field: 'Ciência da Computação',
          startDate: '2015',
          endDate: '2019',
        }
      ],
      experience: [
        {
          id: '1',
          company: 'Tech Solutions',
          position: 'Desenvolvedor Full Stack Senior',
          description: 'Desenvolvimento de aplicações web e mobile utilizando React, React Native e Node.js.',
          startDate: '2020',
          endDate: 'Atual',
        },
        {
          id: '2',
          company: 'Digital Innovations',
          position: 'Desenvolvedor Frontend',
          description: 'Desenvolvimento de interfaces de usuário com React e TypeScript.',
          startDate: '2018',
          endDate: '2020',
        }
      ],
      languages: [
        {
          id: '1',
          language: 'Português',
          level: 'Nativo',
        },
        {
          id: '2',
          language: 'Inglês',
          level: 'Avançado',
        },
        {
          id: '3',
          language: 'Espanhol',
          level: 'Intermediário',
        }
      ],
      projects: [
        {
          id: '1',
          title: 'Innoma Jobs - App de Empregos',
          description: 'Aplicativo mobile para conectar profissionais e recrutadores. Desenvolvido com React Native, Expo e Firebase.',
          repoUrl: 'https://github.com/joaosilva/innoma-jobs',
          demoUrl: 'https://innomajobs.app',
          githubUrl: 'https://github.com/joaosilva',
          linkedinUrl: 'https://linkedin.com/in/joaosilva',
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
          repoUrl: 'https://github.com/joaosilva/ecommerce-dashboard',
          githubUrl: 'https://github.com/joaosilva',
          images: [
            'https://via.placeholder.com/500x300/3F37C9/FFFFFF?text=Dashboard',
            'https://via.placeholder.com/500x300/3F37C9/FFFFFF?text=Relatórios'
          ],
          skills: ['React', 'Node.js', 'Express', 'MongoDB'],
          likes: 27,
          createdAt: '2023-07-15T10:30:00.000Z',
        }
      ],
      available: true,
    };
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

  // Função para dar like/match em um projeto
  const likeProject = (projectId: string) => {
    Alert.alert('Match!', 'Você deu match neste projeto. Em breve implementaremos esta funcionalidade completamente!');
    // Implementação futura: atualizar contagem de likes no Firestore
  };

  // Abrir vídeo do projeto
  const openVideo = (videoUrl?: string) => {
    if (!videoUrl) return;

    // Implementação futura: modal de vídeo ou usar Linking para abrir
    Linking.openURL(videoUrl);
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
  const shareProject = async (project: ProfileData['projects'][0]) => {
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

  const navigateToEditProject = (projectId: string) => {
    if (isOwnProfile) {
      router.push(`/projects/edit/${projectId}`);
    }
  };  // Navegar para adicionar projeto
  const navigateToAddProject = () => {
    if (isOwnProfile) {
      router.push('/projects/add');
    }
  };

  // Se estiver carregando, mostrar skeleton
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="auto" />
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
        <StatusBar style="auto" />
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
      <StatusBar style="auto" />

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
            <ProfileInfoSection
              about={profileData.about}
              skills={profileData.skills}
              theme={theme}
            />

            <Divider spacing={24} />

            <ExperiencesSection
              experiences={profileData.experience}
              theme={theme}
            />

            <Divider spacing={24} />

            <EducationSection
              education={profileData.education}
              theme={theme}
            />

            <Divider spacing={24} />

            <LanguagesSection
              languages={profileData.languages}
              theme={theme}
            />

            {/* Só mostrar botão de mensagem se não for o próprio perfil */}
            {!isOwnProfile && (
              <View style={styles.contactSection}>
                <Button
                  title="Enviar mensagem"
                  onPress={startChat}
                  style={styles.contactButton}
                  fullWidth
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
            />
          </View>
        )}

        {/* Visualização detalhada de um projeto */}
        {selectedProject && selectedProjectData && (
          <View style={styles.projectDetailSection}>
            <ProjectDetail
              project={selectedProjectData}
              onBack={() => setSelectedProject(null)}
              onLike={likeProject}
              onShare={shareProject}
              onOpenUrl={openUrl}
              onOpenVideo={openVideo}
              onEdit={navigateToEditProject}
              theme={theme}
              isOwnProfile={isOwnProfile}
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
  contactSection: {
    padding: 24,
    paddingTop: 0,
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