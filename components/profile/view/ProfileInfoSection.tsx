import { Badge } from '@/components/ui/Badge';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileInfoSectionProps {
  about: string;
  skills: string[];
  theme: any;
}

export const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
  about,
  skills,
  theme,
}) => {
  return (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Sobre
        </Text>
        
        {about ? (
          <Text style={[styles.aboutText, { color: theme.colors.text.secondary }]}>
            {about}
          </Text>
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
            Este usuário não adicionou uma descrição.
          </Text>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Habilidades
        </Text>
        
        {skills.length > 0 ? (
          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <Badge
                key={`skill-${index}`}
                label={skill}
                variant="primary"
                style={styles.skillBadge}
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
            Este usuário não adicionou habilidades.
          </Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
});