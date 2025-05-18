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
}

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  theme: any;
  isOwnProfile?: boolean;
  onAddProject?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  theme,
  isOwnProfile = false,
  onAddProject,
}) => {
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
          
          {isOwnProfile && (
            <TouchableOpacity
              style={[styles.addProjectButton, { borderColor: theme.colors.primary }]}
              onPress={onAddProject}
            >
              <Text style={[styles.addProjectText, { color: theme.colors.primary }]}>
                Adicionar projeto
              </Text>
            </TouchableOpacity>
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
          }}
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
                    <Icons.Image size={24} color={theme.colors.text.disabled} />
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
              
              <View style={styles.projectCardFooter}>
                <View style={styles.likesContainer}>
                  <Text style={[styles.likesCount, { color: theme.colors.text.primary }]}>
                    {project.likes}
                  </Text>
                  <Icons.Heart size={14} color={theme.colors.primary} style={styles.likeIcon} />
                </View>
                
                <TouchableOpacity 
                  style={styles.viewProjectButton}
                  onPress={() => onSelectProject(project.id)}
                >
                  <Text style={[styles.viewProjectText, { color: theme.colors.primary }]}>
                    Ver detalhes
                  </Text>
                  <Icons.ArrowRight size={14} color={theme.colors.primary} style={styles.viewIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      ))}
      
      {/* Botão para adicionar mais projetos (apenas se for o próprio perfil) */}
      {isOwnProfile && (
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
  } as ViewStyle,
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
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addProjectText: {
    fontWeight: '500',
    fontSize: 14,
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