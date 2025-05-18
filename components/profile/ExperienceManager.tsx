// components/profile/ExperienceManager.tsx
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface ExperienceManagerProps {
  experiences: Experience[];
  onAddExperience: (experience: Omit<Experience, 'id'>) => void;
  onUpdateExperience: (id: string, experience: Omit<Experience, 'id'>) => void;
  onRemoveExperience: (id: string) => void;
  theme: any;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience,
  theme,
}) => {
  const [addingExperience, setAddingExperience] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const resetForm = () => {
    setNewExperience({
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    setEditingExperienceId(null);
    setAddingExperience(false);
  };

  const handleAddOrUpdateExperience = () => {
    // Validar campos
    if (!newExperience.company || !newExperience.position || !newExperience.startDate) {
      Alert.alert('Campos obrigatórios', 'Preencha empresa, cargo e data de início');
      return;
    }
    
    if (editingExperienceId) {
      onUpdateExperience(editingExperienceId, newExperience);
    } else {
      onAddExperience(newExperience);
    }
    
    resetForm();
  };

  const handleEditExperience = (experience: Experience) => {
    setNewExperience({
      company: experience.company,
      position: experience.position,
      description: experience.description,
      startDate: experience.startDate,
      endDate: experience.endDate,
    });
    setEditingExperienceId(experience.id);
    setAddingExperience(true);
  };

  const confirmRemoveExperience = (id: string) => {
    Alert.alert(
      'Remover experiência',
      'Tem certeza que deseja remover esta experiência?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onRemoveExperience(id),
        },
      ]
    );
  };

  return (
    <View>
      {addingExperience ? (
        <View style={styles.formContainer}>
          <Input
            label="Empresa"
            placeholder="Nome da empresa"
            value={newExperience.company}
            onChangeText={(value) => setNewExperience({...newExperience, company: value})}
          />
          
          <Input
            label="Cargo"
            placeholder="Seu cargo ou função"
            value={newExperience.position}
            onChangeText={(value) => setNewExperience({...newExperience, position: value})}
          />
          
          <View style={styles.dateContainer}>
            <View style={styles.dateInput}>
              <Input
                label="Data de início"
                placeholder="MM/AAAA"
                value={newExperience.startDate}
                onChangeText={(value) => setNewExperience({...newExperience, startDate: value})}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.dateInput}>
              <Input
                label="Data de término"
                placeholder="MM/AAAA ou Atual"
                value={newExperience.endDate}
                onChangeText={(value) => setNewExperience({...newExperience, endDate: value})}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          
          <TextArea
            label="Descrição"
            placeholder="Descreva suas responsabilidades e conquistas..."
            value={newExperience.description}
            onChangeText={(value) => setNewExperience({...newExperience, description: value})}
          />
          
          <View style={styles.formButtons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={resetForm}
              style={styles.cancelButton}
            />
            
            <Button
              title={editingExperienceId ? "Atualizar" : "Adicionar"}
              onPress={handleAddOrUpdateExperience}
            />
          </View>
        </View>
      ) : (
        <View>
          {experiences.length > 0 ? (
            <View style={styles.itemList}>
              {experiences.map((exp) => (
                <View key={exp.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                      {exp.position}
                    </Text>
                    
                    <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>
                      {exp.company}
                    </Text>
                    
                    <Text style={[styles.itemDate, { color: theme.colors.text.disabled }]}>
                      {exp.startDate} - {exp.endDate || 'Atual'}
                    </Text>
                    
                    {exp.description && (
                      <Text style={[styles.itemDescription, { color: theme.colors.text.secondary }]}>
                        {exp.description}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.itemActions}>
                    <IconButton
                      icon={
                        <View style={styles.editIcon}>
                          <Icons.Pencil size={18} color={theme.colors.warning} />
                        </View>
                      }
                      variant="ghost"
                      size="sm"
                      onPress={() => handleEditExperience(exp)}
                      style={styles.itemAction}
                    />
                    
                    <IconButton
                      icon={
                        <View style={styles.deleteIcon}>
                         <Icons.Trash size={18} color={theme.colors.error} />
                        </View>
                      }
                      variant="ghost"
                      size="sm"
                      onPress={() => confirmRemoveExperience(exp.id)}
                      style={styles.itemAction}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
              Nenhuma experiência profissional adicionada
            </Text>
          )}
          
          <Button
            title="Adicionar experiência"
            variant="outline"
            onPress={() => setAddingExperience(true)}
            style={styles.addItemButton}
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  itemList: {
    marginTop: 8,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemActions: {
    justifyContent: 'flex-start',
  },
  itemAction: {
    marginBottom: 8,
  },
  editIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconInner: {
    width: 10,
    height: 10,
    borderWidth: 1,
  },
  deleteIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  addItemButton: {
    marginTop: 8,
  },
});