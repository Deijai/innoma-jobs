import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
  likedBy?: string[];
  createdAt: string;
}

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onLike: (id: string) => void;
  onShare: (project: Project) => void;
  onOpenUrl: (url?: string) => void;
  onOpenVideo: (url?: string) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  theme: any;
  isOwnProfile?: boolean;
  isLiked?: boolean;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onLike,
  onShare,
  onOpenUrl,
  onOpenVideo,
  onEdit,
  onRemove,
  theme,
  isOwnProfile = false,
  isLiked = false,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const imageWidth = screenWidth - 48; // 24px padding on each side
  
  // Estado para controlar o modal de visualização de imagem
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Função para abrir o visualizador de imagens
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };
  
  // Função para navegar para a próxima imagem
  const nextImage = () => {
    if (selectedImageIndex < project.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };
  
  // Função para navegar para a imagem anterior
  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };
  
  return (
    <View style={styles.expandedProject}>
      <TouchableOpacity 
        style={[styles.backButton, { borderColor: theme.colors.border }]}
        onPress={onBack}
      >
        <Icons.CaretLeft size={16} color={theme.colors.text.primary} style={styles.backIcon} />
        <Text style={[styles.backText, { color: theme.colors.text.primary }]}>
          Voltar aos projetos
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.projectTitle, { color: theme.colors.text.primary }]}>
        {project.title}
      </Text>
      
      <Text style={[styles.projectDescription, { color: theme.colors.text.secondary }]}>
        {project.description}
      </Text>
      
      <View style={styles.projectSkills}>
        {project.skills.map((skill, index) => (
          <Badge
            key={`${project.id}-skill-${index}`}
            label={skill}
            variant="primary"
            size="sm"
            style={styles.skillBadge}
          />
        ))}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.projectImagesContainer}
        contentContainerStyle={styles.projectImagesContent}
      >
        {project.images.map((image, index) => (
          <TouchableOpacity 
            key={`${project.id}-image-${index}`}
            onPress={() => openImageViewer(index)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: image }}
              style={[styles.projectImage, { width: imageWidth }]}
              resizeMode="cover"
            />
            <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
              <Icons.MagnifyingGlassPlus size={24} color="#FFFFFF" style={styles.zoomIcon} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.projectLinks}>
        {project.demoUrl && (
          <Button
            title="Ver Demo"
            variant="outline"
            size="sm"
            onPress={() => onOpenUrl(project.demoUrl)}
            style={styles.projectLinkButton}
          />
        )}
        
        {project.repoUrl && (
          <Button
            title="Repositório"
            variant="outline"
            size="sm"
            onPress={() => onOpenUrl(project.repoUrl)}
            style={styles.projectLinkButton}
          />
        )}
        
        {project.videoUrl && (
          <Button
            title="Ver Vídeo"
            variant="outline"
            size="sm"
            onPress={() => onOpenVideo(project.videoUrl)}
            style={styles.projectLinkButton}
          />
        )}
      </View>
      
      <View style={styles.projectSocialLinks}>
        {project.githubUrl && (
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: `${theme.colors.primary}15` }]}
            onPress={() => onOpenUrl(project.githubUrl)}
          >
            <Text style={[styles.socialButtonText, { color: theme.colors.primary }]}>
              GitHub
            </Text>
          </TouchableOpacity>
        )}
        
        {project.linkedinUrl && (
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: `${theme.colors.primary}15` }]}
            onPress={() => onOpenUrl(project.linkedinUrl)}
          >
            <Text style={[styles.socialButtonText, { color: theme.colors.primary }]}>
              LinkedIn
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.projectActions}>
        {isOwnProfile ? (
          <>
            <Button
              title="Editar"
              variant="outline"
              onPress={() => onEdit && onEdit(project.id)}
              style={styles.actionButton}
              leftIcon={<Icons.PencilSimple size={18} color={theme.colors.primary} />}
            />
            <Button
              title="Remover"
              variant="outline"
              onPress={() => onRemove && onRemove(project.id)}
              style={styles.actionButton}
              leftIcon={<Icons.Trash size={18} color={theme.colors.error} />}
              textStyle={{ color: theme.colors.error }}
            />
          </>
        ) : (
          <>
            <Button
              title={`${project.likes}`}
              onPress={() => onLike(project.id)}
              style={{
                ...styles.actionButton, 
                ...(isLiked ? { backgroundColor: theme.colors.primary } : {})
              }}
              leftIcon={
                <Icons.Heart 
                  size={20} 
                  color="#FFFFFF"
                  weight={isLiked ? "fill" : "regular"}
                />
              }
            />
            <Button
              title="Compartilhar"
              variant="outline"
              onPress={() => onShare(project)}
              style={styles.actionButton}
              leftIcon={<Icons.Share size={18} color={theme.colors.primary} />}
            />
          </>
        )}
      </View>
      
      {/* Modal para visualização de imagens em tela cheia */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <SafeAreaView style={[styles.imageViewerContainer, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
          <StatusBar barStyle="light-content" backgroundColor="black" />
          
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity 
              onPress={() => setImageViewerVisible(false)}
              style={styles.closeButton}
            >
              <Icons.X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.imageCounter}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  expandedProject: {
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  backIcon: {
    marginRight: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  projectDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  projectSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  projectImagesContainer: {
    marginBottom: 16,
    height: 250,
  },
  projectImagesContent: {
    alignItems: 'center',
  },
  projectImage: {
    height: 240,
    borderRadius: 8,
    marginRight: 16,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 16,
    bottom: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  zoomIcon: {
    opacity: 0.8,
  },
  projectLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  projectLinkButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  projectSocialLinks: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  socialButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
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
  imageCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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