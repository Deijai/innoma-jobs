// app/(app)/profile/index.tsx
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { IconButton } from '../../../components/ui/IconButton';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { SkeletonProfileHeader } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import { db } from '../../../services/firebase';

// Interface para os dados do perfil
interface ProfileData {
  id: string;
  name: string;
  title: string;
  about: string;
  location: string;
  skills: string[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];
  experience: {
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
  }[];
  languages: {
    language: string;
    level: string;
  }[];
  photoURL?: string;
  available: boolean;
  completionPercentage: number;
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  // Carregar dados do perfil
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      if (!user?.uid) return;
      
      // Buscar dados do perfil no Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const data = profileDoc.data() as Omit<ProfileData, 'id'>;
        setProfileData({
          id: profileDoc.id,
          ...data,
        });
      } else {
        // Criar objeto de perfil vazio
        setProfileData({
          id: user.uid,
          name: userData?.displayName || user.email?.split('@')[0] || 'Usuário',
          title: 'Adicione seu cargo ou título profissional',
          about: '',
          location: 'Adicione sua localização',
          skills: [],
          education: [],
          experience: [],
          languages: [],
          photoURL: userData?.photoURL || '',
          available: false,
          completionPercentage: 0.1, // Perfil inicial tem apenas nome
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showToast('Erro ao carregar dados do perfil', 'error');
      
      // Para fins de demo, criar perfil fictício
      const mockProfile: ProfileData = {
        id: user?.uid || '1',
        name: userData?.displayName || user?.email?.split('@')[0] || 'João Silva',
        title: 'Desenvolvedor Full Stack',
        about: 'Desenvolvedor com 5 anos de experiência em desenvolvimento web e mobile. Especializado em React, React Native, Node.js e TypeScript.',
        location: 'São Paulo, SP',
        skills: ['React', 'React Native', 'Node.js', 'TypeScript', 'Firebase', 'MongoDB'],
        education: [
          {
            institution: 'Universidade de São Paulo',
            degree: 'Bacharelado',
            field: 'Ciência da Computação',
            startDate: '2015',
            endDate: '2019',
          }
        ],
        experience: [
          {
            company: 'Tech Solutions',
            position: 'Desenvolvedor Full Stack Senior',
            description: 'Desenvolvimento de aplicações web e mobile utilizando React, React Native e Node.js.',
            startDate: '2020',
            endDate: 'Atual',
          },
          {
            company: 'Digital Innovations',
            position: 'Desenvolvedor Frontend',
            description: 'Desenvolvimento de interfaces de usuário com React e TypeScript.',
            startDate: '2018',
            endDate: '2020',
          }
        ],
        languages: [
          {
            language: 'Português',
            level: 'Nativo',
          },
          {
            language: 'Inglês',
            level: 'Avançado',
          },
          {
            language: 'Espanhol',
            level: 'Intermediário',
          }
        ],
        available: true,
        completionPercentage: 0.85,
      };
      
      setProfileData(mockProfile);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Atualizar ao puxar para baixo
  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  // Navegar para edição de perfil
  const navigateToEditProfile = () => {
    router.push('/profile/edit');
  };

  // Compartilhar perfil
  const shareProfile = async () => {
    try {
      const result = await Share.share({
        message: `Confira meu perfil profissional: https://innomajobs.app/profile/${user?.uid}`,
        title: 'Compartilhar Perfil Profissional',
      });
    } catch (error) {
      showToast('Erro ao compartilhar perfil', 'error');
    }
  };

  // Exportar perfil para PDF
  const exportToPDF = () => {
    // Implementação futura
    showToast('Exportação para PDF será implementada em breve', 'info');
  };

  // Se estiver carregando, mostrar skeleton
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="auto" />
        <SkeletonProfileHeader style={styles.skeletonHeader} />
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
          <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
          <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
        </View>
      </SafeAreaView>
    );
  }

  // Se não houver dados de perfil, mostrar mensagem
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Avatar
              name={profileData.name}
              size="xl"
              source={profileData.photoURL ? { uri: profileData.photoURL } : undefined}
            />
            
            <View style={styles.profileActions}>
              <IconButton
                icon={
                  <View style={styles.editIcon}>
                    <View style={[styles.editIconInner, { borderColor: theme.colors.text.primary }]} />
                  </View>
                }
                variant="outline"
                size="sm"
                onPress={navigateToEditProfile}
                style={styles.actionButton}
                round
              />
              
              <IconButton
                icon={
                  <View style={styles.shareIcon}>
                    <View style={[styles.shareIconArrow, { borderColor: theme.colors.text.primary }]} />
                  </View>
                }
                variant="outline"
                size="sm"
                onPress={shareProfile}
                style={styles.actionButton}
                round
              />
              
              <IconButton
                icon={
                  <View style={styles.pdfIcon}>
                    <Text style={[styles.pdfText, { color: theme.colors.text.primary }]}>PDF</Text>
                  </View>
                }
                variant="outline"
                size="sm"
                onPress={exportToPDF}
                style={styles.actionButton}
                round
              />
            </View>
            
            <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
              {profileData.name}
            </Text>
            
            <Text style={[styles.profileTitle, { color: theme.colors.text.secondary }]}>
              {profileData.title}
            </Text>
            
            <View style={styles.locationContainer}>
              <View 
                style={[
                  styles.locationIcon, 
                  { backgroundColor: theme.colors.text.disabled }
                ]} 
              />
              <Text style={[styles.locationText, { color: theme.colors.text.disabled }]}>
                {profileData.location}
              </Text>
            </View>
            
            {profileData.available && (
              <Badge
                label="Disponível para oportunidades"
                variant="success"
                style={styles.availableBadge}
              />
            )}
          </View>
          
          <Card variant="outlined" style={styles.completionCard}>
            <Text style={[styles.completionTitle, { color: theme.colors.text.primary }]}>
              Perfil {Math.round(profileData.completionPercentage * 100)}% completo
            </Text>
            
            <ProgressBar
              progress={profileData.completionPercentage}
              height={8}
              progressColor={theme.colors.primary}
              progressStyle={styles.completionProgress}
            />
            
            <Text style={[styles.completionText, { color: theme.colors.text.secondary }]}>
              Complete seu perfil para aumentar suas chances de conexão
            </Text>
            
            <Button
              title="Completar perfil"
              variant="outline"
              size="sm"
              onPress={navigateToEditProfile}
              style={styles.completionButton}
              fullWidth
            />
          </Card>
        </View>
        
        <Divider spacing={24} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Sobre
          </Text>
          
          {profileData.about ? (
            <Text style={[styles.aboutText, { color: theme.colors.text.secondary }]}>
              {profileData.about}
            </Text>
          ) : (
            <TouchableOpacity 
              style={styles.addItemButton} 
              onPress={navigateToEditProfile}
            >
              <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                Adicionar descrição sobre você
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Divider spacing={24} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Habilidades
          </Text>
          
          {profileData.skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {profileData.skills.map((skill, index) => (
                <Badge
                  key={`skill-${index}`}
                  label={skill}
                  variant="primary"
                  style={styles.skillBadge}
                />
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addItemButton} 
              onPress={navigateToEditProfile}
            >
              <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                Adicionar habilidades
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Divider spacing={24} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Experiência
          </Text>
          
          {profileData.experience.length > 0 ? (
            <View style={styles.experienceContainer}>
              {profileData.experience.map((exp, index) => (
                <View key={`exp-${index}`} style={styles.experienceItem}>
                  <View style={styles.timelinePoint}>
                    <View 
                      style={[
                        styles.timelineCircle,
                        { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }
                      ]}
                    />
                    {index < profileData.experience.length - 1 && (
                      <View 
                        style={[
                          styles.timelineLine,
                          { backgroundColor: theme.colors.border }
                        ]}
                      />
                    )}
                  </View>
                  
                  <View style={styles.experienceContent}>
                    <Text style={[styles.experiencePosition, { color: theme.colors.text.primary }]}>
                      {exp.position}
                    </Text>
                    <Text style={[styles.experienceCompany, { color: theme.colors.text.secondary }]}>
                      {exp.company}
                    </Text>
                    <Text style={[styles.experiencePeriod, { color: theme.colors.text.disabled }]}>
                      {exp.startDate} - {exp.endDate}
                    </Text>
                    {exp.description && (
                      <Text style={[styles.experienceDescription, { color: theme.colors.text.secondary }]}>
                        {exp.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addItemButton} 
              onPress={navigateToEditProfile}
            >
              <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                Adicionar experiência profissional
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Divider spacing={24} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Formação acadêmica
          </Text>
          
          {profileData.education.length > 0 ? (
            <View style={styles.educationContainer}>
              {profileData.education.map((edu, index) => (
                <View key={`edu-${index}`} style={styles.educationItem}>
                  <View style={styles.timelinePoint}>
                    <View 
                      style={[
                        styles.timelineCircle,
                        { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }
                      ]}
                    />
                    {index < profileData.education.length - 1 && (
                      <View 
                        style={[
                          styles.timelineLine,
                          { backgroundColor: theme.colors.border }
                        ]}
                      />
                    )}
                  </View>
                  
                  <View style={styles.educationContent}>
                    <Text style={[styles.educationDegree, { color: theme.colors.text.primary }]}>
                      {edu.degree} em {edu.field}
                    </Text>
                    <Text style={[styles.educationInstitution, { color: theme.colors.text.secondary }]}>
                      {edu.institution}
                    </Text>
                    <Text style={[styles.educationPeriod, { color: theme.colors.text.disabled }]}>
                      {edu.startDate} - {edu.endDate}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addItemButton} 
              onPress={navigateToEditProfile}
            >
              <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                Adicionar formação acadêmica
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Divider spacing={24} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Idiomas
          </Text>
          
          {profileData.languages.length > 0 ? (
            <View style={styles.languagesContainer}>
              {profileData.languages.map((lang, index) => (
                <View key={`lang-${index}`} style={styles.languageItem}>
                  <Text style={[styles.languageName, { color: theme.colors.text.primary }]}>
                    {lang.language}
                  </Text>
                  <Badge
                    label={lang.level}
                    variant="info"
                    size="sm"
                    style={styles.languageBadge}
                  />
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addItemButton} 
              onPress={navigateToEditProfile}
            >
              <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                Adicionar idiomas
              </Text>
            </TouchableOpacity>
          )}
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
    paddingBottom: 40,
  },
  header: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    marginHorizontal: 8,
  },
  editIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconInner: {
    width: 10,
    height: 10,
    borderWidth: 2,
  },
  shareIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIconArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomWidth: 8,
  },
  pdfIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
  },
  availableBadge: {
    alignSelf: 'center',
  },
  completionCard: {
    padding: 16,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  completionProgress: {
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    marginBottom: 16,
  },
  completionButton: {
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  addItemButton: {
    paddingVertical: 12,
  },
  addItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  experienceContainer: {
    marginTop: 8,
  },
  experienceItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelinePoint: {
    width: 24,
    alignItems: 'center',
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 12,
    bottom: -12,
    left: 11,
  },
  experienceContent: {
    flex: 1,
    paddingLeft: 12,
  },
  experiencePosition: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 14,
    marginBottom: 4,
  },
  experiencePeriod: {
    fontSize: 12,
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  educationContainer: {
    marginTop: 8,
  },
  educationItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  educationContent: {
    flex: 1,
    paddingLeft: 12,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  educationInstitution: {
    fontSize: 14,
    marginBottom: 4,
  },
  educationPeriod: {
    fontSize: 12,
  },
  languagesContainer: {
    marginTop: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageName: {
    fontSize: 16,
    marginRight: 8,
  },
  languageBadge: {},
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
});