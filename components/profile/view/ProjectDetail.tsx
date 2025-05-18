import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onLike: (id: string) => void;
  onShare: (project: Project) => void;
  onOpenUrl: (url?: string) => void;
  onOpenVideo: (url?: string) => void;
  onEdit?: (id: string) => void;
  theme: any;
  isOwnProfile?: boolean;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onLike,
  onShare,
  onOpenUrl,
  onOpenVideo,
  onEdit,
  theme,
  isOwnProfile = false,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth - 48; // 24px padding on each side
  
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
          <Image
            key={`${project.id}-image-${index}`}
            source={{ uri: image }}
            style={[styles.projectImage, { width: imageWidth }]}
            resizeMode="cover"
          />
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
            />
            <Button
              title="Compartilhar"
              variant="outline"
              onPress={() => onShare(project)}
              style={styles.actionButton}
            />
          </>
        ) : (
          <>
            <Button
              title={`Match (${project.likes})`}
              onPress={() => onLike(project.id)}
              style={styles.actionButton}
            />
            <Button
              title="Compartilhar"
              variant="outline"
              onPress={() => onShare(project)}
              style={styles.actionButton}
            />
          </>
        )}
      </View>
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
});