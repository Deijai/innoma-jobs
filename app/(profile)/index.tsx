// app/(app)/profile/index.tsx
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonProfileHeader } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/firebase';

// Interface for profile data
interface ProfileData {
  id: string;
  name: string;
  title: string;
  about: string;
  location: string;
  skills: string[];
  education: {
    id?: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];
  experience: {
    id?: string;
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
  }[];
  languages: {
    id?: string;
    language: string;
    level: string;
  }[];
  photoURL?: string;
  available: boolean;
  completionPercentage: number;
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    about: true,
    skills: true,
    experience: true,
    education: true,
    languages: true,
  });
  
  // Animation values for sections
  const animations = {
    about: useState(new Animated.Value(1))[0],
    skills: useState(new Animated.Value(1))[0],
    experience: useState(new Animated.Value(1))[0],
    education: useState(new Animated.Value(1))[0],
    languages: useState(new Animated.Value(1))[0],
  };
  
  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    const isExpanded = expandedSections[section];
    
    // Animate section expansion/collapse
    Animated.timing(animations[section], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Update expanded state after animation
    setExpandedSections(prev => ({
      ...prev,
      [section]: !isExpanded,
    }));
  };
  
  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      if (!user?.uid) return;
      
      // Fetch profile data from Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const data = profileDoc.data() as Omit<ProfileData, 'id'>;
        setProfileData({
          id: profileDoc.id,
          ...data,
        });
      } else {
        // Create empty profile object
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
          completionPercentage: 0.1, // Initial profile has only name
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Erro ao carregar dados do perfil', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Update on pull to refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  // Navigate to profile edit screen
  const navigateToEditProfile = () => {
    router.push('/(profile)/edit');
  };

  // Share profile
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

  // Export profile to PDF
  const exportToPDF = () => {
    // Future implementation
    showToast('Exportação para PDF será implementada em breve', 'info');
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SkeletonProfileHeader style={styles.skeletonHeader} />
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
          <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
          <View style={[styles.skeletonSection, { backgroundColor: `${theme.colors.border}30` }]} />
        </View>
      </SafeAreaView>
    );
  }

  // If no profile data, show message
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

  // Render profile section header and toggle button
  const renderSectionHeader = (
    title: string, 
    section: keyof typeof expandedSections,
    count?: number
  ) => (
    <TouchableOpacity 
      style={styles.sectionHeader} 
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionTitleContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {count !== undefined && (
          <View style={[styles.countBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      
      <Icons.CaretDown 
        size={20} 
        color={theme.colors.text.primary} 
        style={{ 
          transform: [{ rotate: expandedSections[section] ? '0deg' : '-90deg' }]
        }} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
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
        {/* Profile Header Card */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.profileCardContent}>
            <View style={styles.avatarContainer}>
              <Avatar
                name={profileData.name}
                size="xl"
                source={profileData.photoURL ? { uri: profileData.photoURL } : undefined}
              />
              
              {profileData.available && (
                <View style={[styles.availableDot, { backgroundColor: theme.colors.success }]} />
              )}
            </View>
            
            <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
              {profileData.name}
            </Text>
            
            <Text style={[styles.profileTitle, { color: theme.colors.text.secondary }]}>
              {profileData.title}
            </Text>
            
            <View style={styles.locationContainer}>
              <Icons.MapPin size={16} color={theme.colors.text.disabled} weight="fill" />
              <Text style={[styles.locationText, { color: theme.colors.text.disabled }]}>
                {profileData.location}
              </Text>
            </View>
            
            <View style={styles.profileActions}>
              <IconButton
                icon={<Icons.Pencil size={18} color={theme.colors.primary} />}
                variant="outline"
                size="md"
                onPress={navigateToEditProfile}
                style={styles.actionButton}
              />
              
              <IconButton
                icon={<Icons.Share size={18} color={theme.colors.primary} />}
                variant="outline"
                size="md"
                onPress={shareProfile}
                style={styles.actionButton}
              />
              
              <IconButton
                icon={<Icons.FilePdf size={18} color={theme.colors.primary} />}
                variant="outline"
                size="md"
                onPress={exportToPDF}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Card>
        
        {/* Profile Completion Card */}
        <Card style={styles.completionCard} variant="outlined">
          <View style={styles.completionHeader}>
            <Text style={[styles.completionTitle, { color: theme.colors.text.primary }]}>
              Perfil {Math.round(profileData.completionPercentage * 100)}% completo
            </Text>
            
            <Text style={[styles.completionValue, { color: theme.colors.primary }]}>
              {Math.round(profileData.completionPercentage * 100)}%
            </Text>
          </View>
          
          <ProgressBar
            progress={profileData.completionPercentage}
            height={6}
            progressColor={theme.colors.primary}
            backgroundColor={`${theme.colors.primary}20`}
            progressStyle={styles.completionProgress}
          />
          
          <Text style={[styles.completionText, { color: theme.colors.text.secondary }]}>
            Complete seu perfil para aumentar suas chances de conexão
          </Text>
          
          <Button
            title="Completar perfil"
            variant="outline"
            onPress={navigateToEditProfile}
            style={styles.completionButton}
            leftIcon={<Icons.PencilSimpleLine size={16} color={theme.colors.primary} />}
            fullWidth
          />
        </Card>
        
        {/* About Section */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader('Sobre', 'about')}
          
          {expandedSections.about && (
            <Animated.View style={[
              styles.sectionContent,
              { opacity: animations.about }
            ]}>
              {profileData.about ? (
                <Text style={[styles.aboutText, { color: theme.colors.text.secondary }]}>
                  {profileData.about}
                </Text>
              ) : (
                <TouchableOpacity 
                  style={styles.addItemButton} 
                  onPress={navigateToEditProfile}
                >
                  <View style={styles.addItemContainer}>
                    <Icons.Plus size={16} color={theme.colors.primary} />
                    <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                      Adicionar descrição sobre você
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Card>
        
        {/* Skills Section */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader('Habilidades', 'skills', profileData.skills.length)}
          
          {expandedSections.skills && (
            <Animated.View style={[
              styles.sectionContent,
              { opacity: animations.skills }
            ]}>
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
                  <View style={styles.addItemContainer}>
                    <Icons.Plus size={16} color={theme.colors.primary} />
                    <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                      Adicionar habilidades
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Card>
        
        {/* Experience Section */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader('Experiência', 'experience', profileData.experience.length)}
          
          {expandedSections.experience && (
            <Animated.View style={[
              styles.sectionContent,
              { opacity: animations.experience }
            ]}>
              {profileData.experience.length > 0 ? (
                <View style={styles.experienceContainer}>
                  {profileData.experience.map((exp, index) => (
                    <View key={`exp-${exp.id || index}`} style={styles.experienceItem}>
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
                          {exp.startDate} - {exp.endDate || 'Atual'}
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
                  <View style={styles.addItemContainer}>
                    <Icons.Plus size={16} color={theme.colors.primary} />
                    <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                      Adicionar experiência profissional
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Card>
        
        {/* Education Section */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader('Formação acadêmica', 'education', profileData.education.length)}
          
          {expandedSections.education && (
            <Animated.View style={[
              styles.sectionContent,
              { opacity: animations.education }
            ]}>
              {profileData.education.length > 0 ? (
                <View style={styles.educationContainer}>
                  {profileData.education.map((edu, index) => (
                    <View key={`edu-${edu.id || index}`} style={styles.educationItem}>
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
                          {edu.startDate} - {edu.endDate || 'Em andamento'}
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
                  <View style={styles.addItemContainer}>
                    <Icons.Plus size={16} color={theme.colors.primary} />
                    <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                      Adicionar formação acadêmica
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Card>
        
        {/* Languages Section */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader('Idiomas', 'languages', profileData.languages.length)}
          
          {expandedSections.languages && (
            <Animated.View style={[
              styles.sectionContent,
              { opacity: animations.languages }
            ]}>
              {profileData.languages.length > 0 ? (
                <View style={styles.languagesContainer}>
                  {profileData.languages.map((lang, index) => (
                    <View key={`lang-${lang.id || index}`} style={styles.languageItem}>
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
                  <View style={styles.addItemContainer}>
                    <Icons.Plus size={16} color={theme.colors.primary} />
                    <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
                      Adicionar idiomas
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Card>
        
        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          <Button
            title="Editar perfil"
            onPress={navigateToEditProfile}
            leftIcon={<Icons.PencilSimpleLine size={16} color="#FFFFFF" />}
            fullWidth
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
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  availableDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButton: {
    marginHorizontal: 8,
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
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  completionCard: {
    padding: 16,
    marginBottom: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  completionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionProgress: {
    marginBottom: 12,
  },
  completionText: {
    fontSize: 14,
    marginBottom: 16,
  },
  completionButton: {
    marginTop: 8,
  },
  sectionCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  addItemButton: {
    paddingVertical: 12,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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
    justifyContent: 'space-between',
  },
  languageName: {
    fontSize: 16,
  },
  languageBadge: {},
  bottomActions: {
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
});