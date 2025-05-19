import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import { Button } from '../../../../components/ui/Button';
import { Divider } from '../../../../components/ui/Divider';
import { Input } from '../../../../components/ui/Input';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { TextArea } from '../../../../components/ui/TextArea';
import { useToast } from '../../../../components/ui/Toast';
import { db, storage } from '../../../../services/firebase';

// Interface para os dados de projeto
interface ProjectFormData {
  title: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  videoUrl: string;
  skills: string[];
  images: string[];
}

// Interface para o projeto completo
interface Project extends ProjectFormData {
  id: string;
  likes: number;
  createdAt: string;
}

export default function EditProjectScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [originalProject, setOriginalProject] = useState<Project | null>(null);
  
  // Estado para os dados do formulário
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    videoUrl: '',
    skills: [],
    images: [],
  });
  
  // Carregar dados do projeto
  useEffect(() => {
    loadProject();
  }, [projectId]);
  
  // Função para carregar o projeto
  const loadProject = async () => {
    setIsLoading(true);
    
    try {
      if (!projectId || !user?.uid) {
        showToast('ID do projeto não fornecido', 'error');
        router.back();
        return;
      }
      
      // Buscar projetos no Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        
        if (profileData.projects && Array.isArray(profileData.projects)) {
          const foundProject = profileData.projects.find(p => p.id === projectId);
          
          if (foundProject) {
            setOriginalProject(foundProject);
            
            // Preencher formulário com dados existentes
            setFormData({
              title: foundProject.title || '',
              description: foundProject.description || '',
              repoUrl: foundProject.repoUrl || '',
              demoUrl: foundProject.demoUrl || '',
              githubUrl: foundProject.githubUrl || '',
              linkedinUrl: foundProject.linkedinUrl || '',
              videoUrl: foundProject.videoUrl || '',
              skills: foundProject.skills || [],
              images: foundProject.images || [],
            });
            
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Se chegou aqui, o projeto não foi encontrado
      showToast('Projeto não encontrado ou você não tem permissão para editá-lo', 'error');
      router.back();
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      showToast('Erro ao carregar dados do projeto', 'error');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar dados do formulário
  const updateFormField = (field: keyof ProjectFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Adicionar uma nova skill
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    
    const newSkill = skillInput.trim();
    if (formData.skills.includes(newSkill)) {
      showToast('Esta habilidade já foi adicionada', 'warning');
      return;
    }
    
    updateFormField('skills', [...formData.skills, newSkill]);
    setSkillInput('');
  };
  
  // Remover uma skill
  const handleRemoveSkill = (skillToRemove: string) => {
    updateFormField('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };
  
  // Selecionar imagens
  const handleSelectImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      showToast('Precisamos de permissão para acessar sua galeria', 'error');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        // Verificar limite de imagens
        const totalImages = formData.images.length + result.assets.length;
        if (totalImages > 5) {
          showToast('Você pode adicionar no máximo 5 imagens', 'warning');
          return;
        }
        
        // Mostrar indicação de upload
        setIsUploading(true);
        showToast('Carregando imagens...', 'info');
        
        // Fazer upload de cada imagem
        const uploadPromises = result.assets.map(asset => uploadImage(asset.uri));
        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Atualizar formulário com as novas URLs
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls.filter(url => url !== null) as string[]],
        }));
        
        setIsUploading(false);
        showToast(`${uploadedUrls.filter(url => url !== null).length} imagens adicionadas!`, 'success');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagens:', error);
      showToast('Erro ao selecionar imagens', 'error');
      setIsUploading(false);
    }
  };
  
  // Fazer upload de uma imagem
  const uploadImage = async (uri: string): Promise<string | null> => {
    if (!user?.uid) return null;
    
    try {
      // Converter URI para Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Gerar nome de arquivo único
      const imageId = uuid.v4().toString();
      const fileRef = ref(storage, `projects/${user.uid}/${imageId}`);
      
      // Fazer upload
      await uploadBytes(fileRef, blob);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload de imagem:', error);
      return null;
    }
  };
  
  // Remover uma imagem
  const handleRemoveImage = (imageUrl: string) => {
    updateFormField('images', formData.images.filter(url => url !== imageUrl));
  };
  
  // Validar e salvar projeto
  const handleSaveProject = async () => {
    // Validar campos obrigatórios
    if (!formData.title.trim()) {
      showToast('O título do projeto é obrigatório', 'error');
      return;
    }
    
    if (!formData.description.trim()) {
      showToast('A descrição do projeto é obrigatória', 'error');
      return;
    }
    
    if (formData.skills.length === 0) {
      showToast('Adicione pelo menos uma habilidade', 'error');
      return;
    }
    
    if (formData.images.length === 0) {
      showToast('Adicione pelo menos uma imagem do projeto', 'error');
      return;
    }
    
    if (!originalProject) {
      showToast('Erro ao identificar o projeto original', 'error');
      return;
    }
    
    // Começar o salvamento
    setIsSaving(true);
    
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar perfil existente
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        
        if (profileData.projects && Array.isArray(profileData.projects)) {
          // Atualizar o projeto existente
          const updatedProjects = profileData.projects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                title: formData.title.trim(),
                description: formData.description.trim(),
                repoUrl: formData.repoUrl.trim() || null,
                demoUrl: formData.demoUrl.trim() || null,
                githubUrl: formData.githubUrl.trim() || null,
                linkedinUrl: formData.linkedinUrl.trim() || null,
                videoUrl: formData.videoUrl.trim() || null,
                skills: formData.skills,
                images: formData.images,
                updatedAt: new Date().toISOString(),
              };
            }
            return project;
          });
          
          // Atualizar projetos no perfil
          await updateDoc(profileRef, {
            projects: updatedProjects,
            updatedAt: new Date().toISOString(),
          });
          
          showToast('Projeto atualizado com sucesso!', 'success');
          router.replace('/projects');
        } else {
          showToast('Erro ao encontrar lista de projetos', 'error');
        }
      } else {
        showToast('Perfil não encontrado', 'error');
      }
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      showToast('Erro ao atualizar projeto. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancelar e voltar
  const handleCancel = () => {
    Alert.alert(
      'Cancelar edição',
      'Tem certeza que deseja cancelar? Todas as alterações não salvas serão perdidas.',
      [
        {
          text: 'Continuar editando',
          style: 'cancel',
        },
        {
          text: 'Sim, cancelar',
          onPress: () => router.back(),
        },
      ]
    );
  };
  
  // Renderizar loading
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <LoadingOverlay message="Carregando projeto..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Informações básicas
            </Text>
            
            <Input
              label="Título do projeto *"
              placeholder="Ex: App de Gestão Financeira"
              value={formData.title}
              onChangeText={(value) => updateFormField('title', value)}
            />
            
            <TextArea
              label="Descrição do projeto *"
              placeholder="Descreva seu projeto, suas funcionalidades e tecnologias utilizadas..."
              value={formData.description}
              onChangeText={(value) => updateFormField('description', value)}
              maxLength={1000}
              showCharacterCount
            />
          </View>
          
          <Divider spacing={16} />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Habilidades e tecnologias utilizadas *
            </Text>
            
            <View style={styles.skillInputContainer}>
              <View style={styles.skillInputWrapper}>
                <Input
                  placeholder="Ex: React Native"
                  value={skillInput}
                  onChangeText={setSkillInput}
                  returnKeyType="done"
                  onSubmitEditing={handleAddSkill}
                />
              </View>
              
              <Button
                title="Adicionar"
                size="sm"
                onPress={handleAddSkill}
                disabled={!skillInput.trim()}
                style={{ alignSelf: 'flex-end' }}
              />
            </View>
            
            {formData.skills.length > 0 ? (
              <View style={styles.skillsContainer}>
                {formData.skills.map((skill, index) => (
                  <View 
                    key={`skill-${index}`} 
                    style={[
                      styles.skillBadge, 
                      { backgroundColor: `${theme.colors.primary}15` }
                    ]}
                  >
                    <Text style={[styles.skillText, { color: theme.colors.primary }]}>
                      {skill}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => handleRemoveSkill(skill)}
                      style={styles.removeSkillButton}
                    >
                      <Text style={[styles.removeSkillText, { color: theme.colors.primary }]}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
                Adicione as tecnologias e habilidades utilizadas no projeto
              </Text>
            )}
          </View>
          
          <Divider spacing={16} />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Imagens do projeto *
            </Text>
            
            <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
              Adicione até 5 imagens do seu projeto. As imagens ajudam a mostrar o visual e as funcionalidades.
            </Text>
            
            <Button
              title="Selecionar imagens"
              variant="outline"
              onPress={handleSelectImages}
              isLoading={isUploading}
              style={styles.selectImagesButton}
              fullWidth
            />
            
            {formData.images.length > 0 ? (
              <View style={styles.imagesContainer}>
                {formData.images.map((imageUrl, index) => (
                  <View key={`image-${index}`} style={styles.imageWrapper}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.imageThumbnail}
                    />
                    <TouchableOpacity
                      style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => handleRemoveImage(imageUrl)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
                Nenhuma imagem adicionada
              </Text>
            )}
          </View>
          
          <Divider spacing={16} />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Links (opcionais)
            </Text>
            
            <Input
              label="URL do repositório"
              placeholder="Ex: https://github.com/usuario/projeto"
              value={formData.repoUrl}
              onChangeText={(value) => updateFormField('repoUrl', value)}
            />
            
            <Input
              label="URL da demo"
              placeholder="Ex: https://meusite.com/demo"
              value={formData.demoUrl}
              onChangeText={(value) => updateFormField('demoUrl', value)}
            />
            
            <Input
              label="URL do vídeo demonstrativo"
              placeholder="Ex: https://youtube.com/watch?v=abcdefg"
              value={formData.videoUrl}
              onChangeText={(value) => updateFormField('videoUrl', value)}
            />
            
            <Input
              label="Seu perfil no GitHub"
              placeholder="Ex: https://github.com/usuario"
              value={formData.githubUrl}
              onChangeText={(value) => updateFormField('githubUrl', value)}
            />
            
            <Input
              label="Seu perfil no LinkedIn"
              placeholder="Ex: https://linkedin.com/in/usuario"
              value={formData.linkedinUrl}
              onChangeText={(value) => updateFormField('linkedinUrl', value)}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Salvar alterações"
              onPress={handleSaveProject}
              isLoading={isSaving}
              fullWidth
            />
            
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleCancel}
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
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  skillInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skillInputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeSkillButton: {
    marginLeft: 6,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSkillText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  selectImagesButton: {
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});