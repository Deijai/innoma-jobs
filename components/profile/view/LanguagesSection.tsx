import { Badge } from '@/components/ui/Badge';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Language {
  id: string;
  language: string;
  level: string;
}

interface LanguagesSectionProps {
  languages: Language[];
  theme: any;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  theme,
}) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Idiomas
      </Text>
      
      {languages.length > 0 ? (
        <View style={styles.languagesContainer}>
          {languages.map((lang, index) => (
            <View key={`lang-${lang.id || index}`} style={styles.languageItem}>
              <Text style={[styles.languageName, { color: theme.colors.text.primary }]}>
                {lang.language}
              </Text>
              <Badge
                label={lang.level}
                variant="info"
                size="sm"
                style={styles.languageBadge}
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
          Este usuário não adicionou idiomas.
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
  languagesContainer: {
    marginTop: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageName: {
    fontSize: 16,
    marginRight: 8,
  },
  languageBadge: {},
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});