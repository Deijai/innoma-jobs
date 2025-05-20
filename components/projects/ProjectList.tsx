import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  images: string[];
  likes: number;
  likedBy?: string[];
}

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  theme: any;
  isOwnProfile?: boolean;
  onAddProject?: () => void;
  onLikeProject?: (id: string) => void;
  isProjectLiked?: (id: string) => boolean;
  onEditProject?: (id: string) => void;
  onRemoveProject?: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  theme,
  isOwnProfile = false,
  onAddProject,
  onLikeProject,
  isProjectLiked,
  onEditProject,
  onRemoveProject,
}) => {
  // Função para verificar se o usuário já curtiu o projeto
  const hasLiked = (projectId: string): boolean => {
    if (isProjectLiked) {
      return isProjectLiked(projectId);
    }
    return false;
  };

  // Se não houver projetos, mostrar uma mensagem diferente baseada em isOwnProfile
  if (projects.length === 0) {
    return (
      <Card style={styles.emptyProjectsCard}>
        <View style={styles.emptyProjectsContent}>
          <Text style={[styles.emptyProjectsTitle, { color: theme.colors.text.primary }]}>
            {isOwnProfile ? 'Nenhum projeto adicionado' : 'Nenhum projeto encontrado'}
          </Text>
          <Text style={[styles.emptyProjectsText, { color: theme.colors.text.secondary }]}>
            {isOwnProfile 
              ? 'Adicione seus projetos para mostrar suas habilidades e experiência.'
              : 'Este usuário ainda não adicionou projetos ao seu perfil.'}
          </Text>
          
          {isOwnProfile && onAddProject && (
            <Button
              title="Adicionar projeto"
              onPress={onAddProject}
              style={styles.addProjectButton}
              leftIcon={<Icons.Plus size={18} color="#FFFFFF" />}
            />
          )}
        </View>
      </Card>
    );
  }

  // Renderizar a lista de projetos
  return (
    <View style={styles.projectsList}>
      {projects.map((project, index) => (
        <Card 
          key={`project-${project.id}`} 
          style={{
            ...styles.projectCard,
            ...(index === 0 ? styles.firstProjectCard : {})
          } as ViewStyle}
          variant="elevated"
        >
          <TouchableOpacity 
            style={styles.projectCardContent}
            onPress={() => onSelectProject(project.id)}
            activeOpacity={0.8}
          >
            {project.images.length > 0 && (
              <View style={styles.projectImageContainer}>
                <View style={styles.projectThumbnail}>
                  {project.images[0] ? (
                    <Image 
                      source={{ uri: project.images[0] }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.noImagePlaceholder, { backgroundColor: `${theme.colors.border}50` }]}>
                      <Icons.Image size={24} color={theme.colors.text.disabled} />
                    </View>
                  )}
                </View>
              </View>
            )}
            
            <View style={styles.projectInfo}>
              <Text 
                style={[styles.projectCardTitle, { color: theme.colors.text.primary }]}
                numberOfLines={1}
              >
                {project.title}
              </Text>
              
              <Text 
                style={[styles.projectCardDescription, { color: theme.colors.text.secondary }]}
                numberOfLines={2}
              >
                {project.description}
              </Text>
              
              {project.skills.length > 0 && (
                <View style={styles.projectSkills}>
                  {project.skills.slice(0, 3).map((skill, skillIndex) => (
                    <Badge
                      key={`${project.id}-skill-mini-${skillIndex}`}
                      label={skill}
                      variant="primary"
                      size="sm"
                      style={styles.skillBadge}
                    />
                  ))}
                  {project.skills.length > 3 && (
                    <Badge
                      label={`+${project.skills.length - 3}`}
                      variant="info"
                      size="sm"
                      style={styles.skillBadge}
                    />
                  )}
                </View>
              )}

              <View style={styles.projectCardFooter}>
                {!isOwnProfile && onLikeProject ? (
                  <TouchableOpacity 
                    style={[
                      styles.likeButton,
                      hasLiked(project.id) && { backgroundColor: `${theme.colors.primary}15` }
                    ]}
                    onPress={() => onLikeProject(project.id)}
                  >
                    <Text style={[styles.likesCount, { color: theme.colors.text.primary }]}>
                      {project.likes}
                    </Text>
                    <Icons.Heart 
                      size={16} 
                      color={theme.colors.primary}
                      weight={hasLiked(project.id) ? "fill" : "regular"} 
                      style={styles.likeIcon} 
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.likesContainer}>
                    <Text style={[styles.likesCount, { color: theme.colors.text.primary }]}>
                      {project.likes}
                    </Text>
                    <Icons.Heart size={16} color={theme.colors.primary} style={styles.likeIcon} />
                  </View>
                )}
                
                {isOwnProfile && onEditProject && onRemoveProject ? (
                  <View style={styles.ownerActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => onEditProject(project.id)}
                    >
                      <Icons.PencilSimple size={18} color={theme.colors.warning} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => onRemoveProject(project.id)}
                    >
                      <Icons.Trash size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.viewProjectButton}
                    onPress={() => onSelectProject(project.id)}
                  >
                    <Text style={[styles.viewProjectText, { color: theme.colors.primary }]}>
                      Ver detalhes
                    </Text>
                    <Icons.ArrowRight size={14} color={theme.colors.primary} style={styles.viewIcon} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      ))}
      
      {/* Botão para adicionar mais projetos (apenas se for o próprio perfil) */}
      {isOwnProfile && onAddProject && (
        <TouchableOpacity
          style={[styles.addMoreProjectButton, { borderColor: theme.colors.primary }]}
          onPress={onAddProject}
        >
          <Icons.Plus size={20} color={theme.colors.primary} style={styles.addIcon} />
          <Text style={[styles.addMoreProjectText, { color: theme.colors.primary }]}>
            Adicionar outro projeto
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  projectsList: {
    marginTop: 16,
  },
  projectCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  firstProjectCard: {
    marginTop: 0,
  },
  projectCardContent: {
    padding: 16,
  },
  projectImageContainer: {
    marginBottom: 12,
  },
  projectThumbnail: {
    height: 160,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
  },
  projectCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  projectCardDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  projectSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  projectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  likeIcon: {
    marginRight: 4,
  },
  viewProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewProjectText: {
    fontWeight: '500',
    fontSize: 14,
  },
  viewIcon: {
    marginLeft: 4,
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyProjectsCard: {
    marginTop: 16,
  },
  emptyProjectsContent: {
    padding: 24,
    alignItems: 'center',
  },
  emptyProjectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyProjectsText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  addProjectButton: {
    marginTop: 16,
  },
  addMoreProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addIcon: {
    marginRight: 8,
  },
  addMoreProjectText: {
    fontWeight: '500',
    fontSize: 14,
  },
});