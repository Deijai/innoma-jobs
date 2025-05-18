import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface EducationSectionProps {
  education: Education[];
  theme: any;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  theme,
}) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Formação acadêmica
      </Text>
      
      {education.length > 0 ? (
        <View style={styles.educationContainer}>
          {education.map((edu, index) => (
            <View key={`edu-${edu.id || index}`} style={styles.educationItem}>
              <View style={styles.timelinePoint}>
                <View 
                  style={[
                    styles.timelineCircle,
                    { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }
                  ]}
                />
                {index < education.length - 1 && (
                  <View 
                    style={[
                      styles.timelineLine,
                      { backgroundColor: theme.colors.border }
                    ]}
                  />
                )}
              </View>
              
              <View style={styles.educationContent}>
                <Text style={[styles.educationDegree, { color: theme.colors.text.primary }]}>
                  {edu.degree} em {edu.field}
                </Text>
                <Text style={[styles.educationInstitution, { color: theme.colors.text.secondary }]}>
                  {edu.institution}
                </Text>
                <Text style={[styles.educationPeriod, { color: theme.colors.text.disabled }]}>
                  {edu.startDate} - {edu.endDate || 'Em andamento'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
          Este usuário não adicionou formação acadêmica.
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
  educationContainer: {
    marginTop: 8,
  },
  educationItem: {
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
  educationContent: {
    flex: 1,
    paddingLeft: 12,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  educationInstitution: {
    fontSize: 14,
    marginBottom: 4,
  },
  educationPeriod: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});