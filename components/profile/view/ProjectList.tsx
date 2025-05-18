import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
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
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  theme,
}) => {
  // Função auxiliar para resolver problemas de tipagem com estilos
  const getCardStyle = (index: number): ViewStyle => {
    const style: ViewStyle = {
      ...styles.projectCard,
      ...(index === 0 ? styles.firstProjectCard : {})
    };
    return style;
  };

  if (projects.length === 0) {
    return (
      <Card style={styles.emptyProjectsCard}>
        <View style={styles.emptyProjectsContent}>
          <Text style={[styles.emptyProjectsTitle, { color: theme.colors.text.primary }]}>
            Nenhum projeto encontrado
          </Text>
          <Text style={[styles.emptyProjectsText, { color: theme.colors.text.secondary }]}>
            Este usuário ainda não adicionou projetos ao seu perfil.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.projectsList}>
      {projects.map((project, index) => (
          <Card 
            key={`project-${project.id}`} 
            style={getCardStyle(index)}
            variant="elevated"
          >
          <TouchableOpacity 
            style={styles.projectCardContent}
            onPress={() => onSelectProject(project.id)}
            activeOpacity={0.8}
          >
            {project.images.length > 0 && (
              <Image
                source={{ uri: project.images[0] }}
                style={styles.projectThumbnail}
                resizeMode="cover"
              />
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
              
              <View style={styles.projectCardSkills}>
                {project.skills.slice(0, 2).map((skill, skillIndex) => (
                  <Badge
                    key={`${project.id}-skill-mini-${skillIndex}`}
                    label={skill}
                    variant="primary"
                    size="sm"
                    style={styles.skillBadge}
                  />
                ))}
                {project.skills.length > 2 && (
                  <Badge
                    label={`+${project.skills.length - 2}`}
                    variant="info"
                    size="sm"
                    style={styles.skillBadge}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.projectCardActions}>
              <View style={styles.likesContainer}>
                <Text style={[styles.likesCount, { color: theme.colors.text.primary }]}>
                  {project.likes}
                </Text>
                <View 
                  style={[
                    styles.likeIcon, 
                    { backgroundColor: theme.colors.primary }
                  ]} 
                />
              </View>
              
              <TouchableOpacity 
                style={styles.viewProjectButton}
                onPress={() => onSelectProject(project.id)}
              >
                <Text style={[styles.viewProjectText, { color: theme.colors.primary }]}>
                  Ver projeto
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Card>
      ))}
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
    padding: 0,
  },
  projectThumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: '#f2f2f2',
  },
  projectInfo: {
    padding: 16,
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
  projectCardSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  projectCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  viewProjectButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewProjectText: {
    fontWeight: '500',
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
  },
});