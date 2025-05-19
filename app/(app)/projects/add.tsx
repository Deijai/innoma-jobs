import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
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
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Divider } from '../../../components/ui/Divider';
import { Input } from '../../../components/ui/Input';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { TextArea } from '../../../components/ui/TextArea';
import { useToast } from '../../../components/ui/Toast';
import { db, storage } from '../../../services/firebase';

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

export default function AddProjectScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  
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
    
    // Começar o salvamento
    setIsLoading(true);
    
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar perfil existente
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      // Criar novo projeto
      const newProject = {
        id: uuid.v4().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        repoUrl: formData.repoUrl.trim() || null,
        demoUrl: formData.demoUrl.trim() || null,
        githubUrl: formData.githubUrl.trim() || null,
        linkedinUrl: formData.linkedinUrl.trim() || null,
        videoUrl: formData.videoUrl.trim() || null,
        skills: formData.skills,
        images: formData.images,
        likes: 0,
        createdAt: new Date().toISOString(),
      };
      
      if (profileDoc.exists()) {
        // Se o perfil existir, atualizar a lista de projetos
        const profileData = profileDoc.data();
        const projects = profileData.projects || [];
        
        // Atualizar projetos no perfil existente
        await updateDoc(profileRef, {
          projects: [...projects, newProject],
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Se o perfil não existir, criar um novo
        await setDoc(profileRef, {
          id: user.uid,
          name: user.displayName || '',
          title: '',
          about: '',
          location: '',
          skills: [],
          education: [],
          experience: [],
          languages: [],
          photoURL: user.photoURL || '',
          available: false,
          completionPercentage: 0.1,
          projects: [newProject],
          updatedAt: new Date().toISOString(),
        });
      }
      
      showToast('Projeto adicionado com sucesso!', 'success');
      router.replace('/projects');
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      showToast('Erro ao salvar projeto. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar e voltar
  const handleCancel = () => {
    Alert.alert(
      'Cancelar',
      'Tem certeza que deseja cancelar? Todas as informações não salvas serão perdidas.',
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message="Salvando projeto..." />}
      
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
              leftIcon={<Icons.Notepad size={20} color={theme.colors.text.secondary} />}
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
                  leftIcon={<Icons.Code size={20} color={theme.colors.text.secondary} />}
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
                  <Badge
                    key={`skill-${index}`}
                    label={skill}
                    variant="primary"
                    size="md"
                    style={styles.skillBadge}
                    removable
                    onRemove={() => handleRemoveSkill(skill)}
                  />
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
              leftIcon={<Icons.Images size={20} color={theme.colors.primary} />}
            />
            
            {formData.images.length > 0 ? (
              <View style={styles.imagesContainer}>
                {formData.images.map((imageUrl, index) => (
                  <View key={`image-${index}`} style={styles.imageWrapper}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.imageThumbnail}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => handleRemoveImage(imageUrl)}
                    >
                      <Icons.X size={16} color="#FFFFFF" />
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
              leftIcon={<Icons.GithubLogo size={20} color={theme.colors.text.secondary} />}
            />
            
            <Input
              label="URL da demo"
              placeholder="Ex: https://meusite.com/demo"
              value={formData.demoUrl}
              onChangeText={(value) => updateFormField('demoUrl', value)}
              leftIcon={<Icons.Globe size={20} color={theme.colors.text.secondary} />}
            />
            
            <Input
              label="URL do vídeo demonstrativo"
              placeholder="Ex: https://youtube.com/watch?v=abcdefg"
              value={formData.videoUrl}
              onChangeText={(value) => updateFormField('videoUrl', value)}
              leftIcon={<Icons.YoutubeLogo size={20} color={theme.colors.text.secondary} />}
            />
            
            <Input
              label="Seu perfil no GitHub"
              placeholder="Ex: https://github.com/usuario"
              value={formData.githubUrl}
              onChangeText={(value) => updateFormField('githubUrl', value)}
              leftIcon={<Icons.GithubLogo size={20} color={theme.colors.text.secondary} />}
            />
            
            <Input
              label="Seu perfil no LinkedIn"
              placeholder="Ex: https://linkedin.com/in/usuario"
              value={formData.linkedinUrl}
              onChangeText={(value) => updateFormField('linkedinUrl', value)}
              leftIcon={<Icons.LinkedinLogo size={20} color={theme.colors.text.secondary} />}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Salvar projeto"
              onPress={handleSaveProject}
              isLoading={isLoading}
              fullWidth
              leftIcon={<Icons.FloppyDisk size={20} color="#FFFFFF" />}
            />
            
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleCancel}
              disabled={isLoading}
              style={styles.cancelButton}
              fullWidth
              leftIcon={<Icons.X size={20} color={theme.colors.primary} />}
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
    marginRight: 8,
    marginBottom: 8,
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
  buttonContainer: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});