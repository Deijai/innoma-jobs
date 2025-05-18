import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../ui/Badge';

interface ProjectSkillsListProps {
  skills: string[];
  theme: any;
}

const ProjectSkillsList: React.FC<ProjectSkillsListProps> = ({ 
  skills, 
  theme 
}) => {
  if (skills.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
        Nenhuma habilidade adicionada
      </Text>
    );
  }
  
  return (
    <View style={styles.container}>
      {skills.map((skill, index) => (
        <Badge
          key={`skill-${index}`}
          label={skill}
          variant="primary"
          size="sm"
          style={styles.skillBadge}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
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
});

export default ProjectSkillsList;