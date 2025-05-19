import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import { EducationManager } from '../../../components/profile/EducationManager';
import { ExpandableSection } from '../../../components/profile/ExpandableSection';
import { ExperienceManager } from '../../../components/profile/ExperienceManager';
import { LanguageManager } from '../../../components/profile/LanguageManager';
import { PersonalInfoForm } from '../../../components/profile/PersonalInfoForm';
import { ProfilePhotoEditor } from '../../../components/profile/ProfilePhotoEditor';
import { SkillsManager } from '../../../components/profile/SkillsManager';
import { Button } from '../../../components/ui/Button';
import { Divider } from '../../../components/ui/Divider';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { useToast } from '../../../components/ui/Toast';
import { db } from '../../../services/firebase';

// Interfaces para os dados
interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface Language {
  id: string;
  language: string;
  level: string;
}

interface ProfileData {
  name: string;
  title: string;
  about: string;
  location: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  languages: Language[];
  photoURL?: string;
  available: boolean;
  completionPercentage: number;
  updatedAt?: string;
}

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  // Estados para seções expansíveis
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    skills: false,
    experience: false,
    education: false,
    languages: false,
  });

  // Estado para os dados do perfil
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    title: '',
    about: '',
    location: '',
    skills: [],
    education: [],
    experience: [],
    languages: [],
    photoURL: '',
    available: false,
    completionPercentage: 0,
  });

  // Estado para carregamento
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    loadProfileData();
  }, []);

  // Função para carregar dados do perfil
  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      if (!user?.uid) return;

      // Buscar dados do perfil no Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        setProfileData(profileDoc.data() as ProfileData);
      } else {
        // Criar perfil com dados iniciais
        setProfileData({
          name: userData?.displayName || '',
          title: '',
          about: '',
          location: '',
          skills: [],
          education: [],
          experience: [],
          languages: [],
          photoURL: userData?.photoURL || '',
          available: false,
          completionPercentage: 0.1,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showToast('Erro ao carregar dados do perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alternar seção expansível
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para atualizar dados pessoais
  const handleNameChange = (value: string) => {
    setProfileData(prev => ({ ...prev, name: value }));
  };

  const handleTitleChange = (value: string) => {
    setProfileData(prev => ({ ...prev, title: value }));
  };

  const handleLocationChange = (value: string) => {
    setProfileData(prev => ({ ...prev, location: value }));
  };

  const handleAboutChange = (value: string) => {
    setProfileData(prev => ({ ...prev, about: value }));
  };

  const handleAvailableChange = (value: boolean) => {
    setProfileData(prev => ({ ...prev, available: value }));
  };

  // Funções para gerenciar habilidades
  const handleAddSkill = (skill: string) => {
    setProfileData(prev => {
      // Verificar se a habilidade já existe
      if (prev.skills.includes(skill)) {
        showToast('Esta habilidade já foi adicionada', 'warning');
        return prev;
      }
      return { ...prev, skills: [...prev.skills, skill] };
    });
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  // Funções para gerenciar experiências
  const handleAddExperience = (experience: Omit<Experience, 'id'>) => {
    setProfileData(prev => ({
      ...prev,
      experience: [
        {
          id: uuid.v4().toString(),
          ...experience,
        },
        ...prev.experience,
      ],
    }));
  };

  const handleUpdateExperience = (id: string, experience: Omit<Experience, 'id'>) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, ...experience } : exp
      ),
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  // Funções para gerenciar educação
  const handleAddEducation = (education: Omit<Education, 'id'>) => {
    setProfileData(prev => ({
      ...prev,
      education: [
        {
          id: uuid.v4().toString(),
          ...education,
        },
        ...prev.education,
      ],
    }));
  };

  const handleUpdateEducation = (id: string, education: Omit<Education, 'id'>) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, ...education } : edu
      ),
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  // Funções para gerenciar idiomas
  const handleAddLanguage = (language: Omit<Language, 'id'>) => {
    setProfileData(prev => ({
      ...prev,
      languages: [
        {
          id: uuid.v4().toString(),
          ...language,
        },
        ...prev.languages,
      ],
    }));
  };

  const handleUpdateLanguage = (id: string, language: Omit<Language, 'id'>) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, ...language } : lang
      ),
    }));
  };

  const handleRemoveLanguage = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id),
    }));
  };

  // Função para atualizar foto de perfil
  const handlePhotoUpdated = (photoURL: string) => {
    setProfileData(prev => ({ ...prev, photoURL }));
  };

  // Calcular porcentagem de conclusão do perfil
  const calculateCompletionPercentage = (data: ProfileData): number => {
    let total = 0;
    let completed = 0;

    // Dados pessoais (5 campos)
    total += 5;
    if (data.name) completed += 1;
    if (data.title) completed += 1;
    if (data.location) completed += 1;
    if (data.about) completed += 1;
    if (data.photoURL) completed += 1;

    // Habilidades
    total += 1;
    if (data.skills.length > 0) completed += 1;

    // Experiência
    total += 1;
    if (data.experience.length > 0) completed += 1;

    // Educação
    total += 1;
    if (data.education.length > 0) completed += 1;

    // Idiomas
    total += 1;
    if (data.languages.length > 0) completed += 1;

    return completed / total;
  };

  // Salvar perfil
  const saveProfile = async () => {
    if (!user?.uid) return;

    try {
      setIsSaving(true);

      // Validar nome
      if (!profileData.name.trim()) {
        Alert.alert('Campo obrigatório', 'O nome é obrigatório');
        setIsSaving(false);
        return;
      }

      // Calcular porcentagem de conclusão
      const completionPercentage = calculateCompletionPercentage(profileData);

      // Dados a serem salvos
      const dataToSave: ProfileData = {
        ...profileData,
        name: profileData.name.trim(),
        completionPercentage,
        updatedAt: new Date().toISOString(),
      };

      // Salvar no Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      
      // Converter o objeto para formato chave-valor para o Firestore
      const flattenedData = Object.entries(dataToSave).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
      
      // Verificar se o documento existe
      const docSnap = await getDoc(profileRef);
      if (docSnap.exists()) {
        // O documento existe, então podemos usar updateDoc
        await updateDoc(profileRef, flattenedData);
      } else {
        // O documento não existe, então devemos usar setDoc
        await setDoc(profileRef, flattenedData);
      }

      showToast('Perfil atualizado com sucesso', 'success');
      //router.replace('/profile'); remover isso aqui
      router.push(`/profile/view/${profileRef.id}`);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      showToast('Erro ao salvar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingOverlay message="Carregando perfil..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.photoSection}>
            <ProfilePhotoEditor
              photoUri={profileData.photoURL || null}
              name={profileData.name || 'Perfil'}
              userId={user?.uid || ''}
              onPhotoUpdated={handlePhotoUpdated}
              onError={(message) => showToast(message, 'error')}
              theme={theme}
            />
          </View>

          <Divider spacing={16} />

          {/* Seção de Informações Pessoais */}
          <ExpandableSection
            title="Informações Pessoais"
            expanded={expandedSections.personal}
            onToggle={() => toggleSection('personal')}
            theme={theme}
          >
            <PersonalInfoForm
              name={profileData.name}
              title={profileData.title}
              location={profileData.location}
              about={profileData.about}
              available={profileData.available}
              onNameChange={handleNameChange}
              onTitleChange={handleTitleChange}
              onLocationChange={handleLocationChange}
              onAboutChange={handleAboutChange}
              onAvailableChange={handleAvailableChange}
              theme={theme}
            />
          </ExpandableSection>

          <Divider />

          {/* Seção de Habilidades */}
          <ExpandableSection
            title="Habilidades"
            expanded={expandedSections.skills}
            onToggle={() => toggleSection('skills')}
            theme={theme}
          >
            <SkillsManager
              skills={profileData.skills}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              theme={theme}
            />
          </ExpandableSection>

          <Divider />

          {/* Seção de Experiência */}
          <ExpandableSection
            title="Experiência Profissional"
            expanded={expandedSections.experience}
            onToggle={() => toggleSection('experience')}
            theme={theme}
          >
            <ExperienceManager
              experiences={profileData.experience}
              onAddExperience={handleAddExperience}
              onUpdateExperience={handleUpdateExperience}
              onRemoveExperience={handleRemoveExperience}
              theme={theme}
            />
          </ExpandableSection>

          <Divider />

          {/* Seção de Educação */}
          <ExpandableSection
            title="Formação Acadêmica"
            expanded={expandedSections.education}
            onToggle={() => toggleSection('education')}
            theme={theme}
          >
            <EducationManager
              education={profileData.education}
              onAddEducation={handleAddEducation}
              onUpdateEducation={handleUpdateEducation}
              onRemoveEducation={handleRemoveEducation}
              theme={theme}
            />
          </ExpandableSection>

          <Divider />

          {/* Seção de Idiomas */}
          <ExpandableSection
            title="Idiomas"
            expanded={expandedSections.languages}
            onToggle={() => toggleSection('languages')}
            theme={theme}
          >
            <LanguageManager
              languages={profileData.languages}
              onAddLanguage={handleAddLanguage}
              onUpdateLanguage={handleUpdateLanguage}
              onRemoveLanguage={handleRemoveLanguage}
              theme={theme}
            />
          </ExpandableSection>

          <View style={styles.buttonContainer}>
            <Button
              title="Salvar Perfil"
              onPress={saveProfile}
              isLoading={isSaving}
              fullWidth
            />
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => router.back()}
              disabled={isSaving}
              style={styles.cancelButton}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  buttonContainer: {
    padding: 24,
    gap: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});