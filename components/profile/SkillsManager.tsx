// components/profile/SkillsManager.tsx
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SkillsManagerProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  theme: any;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  onAddSkill,
  onRemoveSkill,
  theme,
}) => {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  return (
    <View>
      <View style={styles.skillInputContainer}>
        <View style={styles.skillInput}>
          <Input
            placeholder="Ex: React Native"
            value={newSkill}
            onChangeText={setNewSkill}
            returnKeyType="done"
            onSubmitEditing={handleAddSkill}
          />
        </View>
        
        <Button
          title="Adicionar"
          onPress={handleAddSkill}
          disabled={!newSkill.trim()}
          style={styles.addButton}
        />
      </View>
      
      {skills.length > 0 ? (
        <View style={styles.skillsContainer}>
          {skills.map((skill, index) => (
            <Badge
              key={`skill-${index}`}
              label={skill}
              variant="primary"
              style={styles.skillBadge}
              removable
             onRemove={() => onRemoveSkill(skill)}
            >
              <Icons.Trash size={18} color={theme.colors.primary} />
            </Badge>
            
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
          Adicione suas habilidades técnicas e interpessoais
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  skillInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    alignSelf: 'baseline',
    height: 45
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
});