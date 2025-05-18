import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface ExperiencesSectionProps {
  experiences: Experience[];
  theme: any;
}

export const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({
  experiences,
  theme,
}) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Experiência
      </Text>
      
      {experiences.length > 0 ? (
        <View style={styles.experienceContainer}>
          {experiences.map((exp, index) => (
            <View key={`exp-${exp.id || index}`} style={styles.experienceItem}>
              <View style={styles.timelinePoint}>
                <View 
                  style={[
                    styles.timelineCircle,
                    { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }
                  ]}
                />
                {index < experiences.length - 1 && (
                  <View 
                    style={[
                      styles.timelineLine,
                      { backgroundColor: theme.colors.border }
                    ]}
                  />
                )}
              </View>
              
              <View style={styles.experienceContent}>
                <Text style={[styles.experiencePosition, { color: theme.colors.text.primary }]}>
                  {exp.position}
                </Text>
                <Text style={[styles.experienceCompany, { color: theme.colors.text.secondary }]}>
                  {exp.company}
                </Text>
                <Text style={[styles.experiencePeriod, { color: theme.colors.text.disabled }]}>
                  {exp.startDate} - {exp.endDate || 'Atual'}
                </Text>
                {exp.description && (
                  <Text style={[styles.experienceDescription, { color: theme.colors.text.secondary }]}>
                    {exp.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
          Este usuário não adicionou experiências profissionais.
        </Text>
      )}
    </View>
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
  experienceContainer: {
    marginTop: 8,
  },
  experienceItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelinePoint: {
    width: 24,
    alignItems: 'center',
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 12,
    bottom: -12,
    left: 11,
  },
  experienceContent: {
    flex: 1,
    paddingLeft: 12,
  },
  experiencePosition: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 14,
    marginBottom: 4,
  },
  experiencePeriod: {
    fontSize: 12,
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});