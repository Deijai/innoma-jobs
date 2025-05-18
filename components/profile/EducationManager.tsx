// components/profile/EducationManager.tsx (continuação)
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface EducationManagerProps {
  education: Education[];
  onAddEducation: (education: Omit<Education, 'id'>) => void;
  onUpdateEducation: (id: string, education: Omit<Education, 'id'>) => void;
  onRemoveEducation: (id: string) => void;
  theme: any;
}

export const EducationManager: React.FC<EducationManagerProps> = ({
  education,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  theme,
}) => {
  const [addingEducation, setAddingEducation] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
  });

  const resetForm = () => {
    setNewEducation({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    });
    setEditingEducationId(null);
    setAddingEducation(false);
  };

  const handleAddOrUpdateEducation = () => {
    // Validar campos
    if (!newEducation.institution || !newEducation.degree || !newEducation.startDate) {
      Alert.alert('Campos obrigatórios', 'Preencha instituição, grau e data de início');
      return;
    }
    
    if (editingEducationId) {
      onUpdateEducation(editingEducationId, newEducation);
    } else {
      onAddEducation(newEducation);
    }
    
    resetForm();
  };

  const handleEditEducation = (education: Education) => {
    setNewEducation({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      startDate: education.startDate,
      endDate: education.endDate,
    });
    setEditingEducationId(education.id);
    setAddingEducation(true);
  };

  const confirmRemoveEducation = (id: string) => {
    Alert.alert(
      'Remover formação',
      'Tem certeza que deseja remover esta formação acadêmica?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onRemoveEducation(id),
        },
      ]
    );
  };

  return (
    <View>
      {addingEducation ? (
        <View style={styles.formContainer}>
          <Input
            label="Instituição"
            placeholder="Nome da instituição de ensino"
            value={newEducation.institution}
            onChangeText={(value) => setNewEducation({...newEducation, institution: value})}
          />
          
          <Input
            label="Grau"
            placeholder="Ex: Bacharelado, Mestrado, Técnico"
            value={newEducation.degree}
            onChangeText={(value) => setNewEducation({...newEducation, degree: value})}
          />
          
          <Input
            label="Área de estudo"
            placeholder="Ex: Ciência da Computação"
            value={newEducation.field}
            onChangeText={(value) => setNewEducation({...newEducation, field: value})}
          />
          
          <View style={styles.dateContainer}>
            <View style={styles.dateInput}>
              <Input
                label="Data de início"
                placeholder="AAAA"
                value={newEducation.startDate}
                onChangeText={(value) => setNewEducation({...newEducation, startDate: value})}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.dateInput}>
              <Input
                label="Data de conclusão"
                placeholder="AAAA ou Em andamento"
                value={newEducation.endDate}
                onChangeText={(value) => setNewEducation({...newEducation, endDate: value})}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          
          <View style={styles.formButtons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={resetForm}
              style={styles.cancelButton}
            />
            
            <Button
              title={editingEducationId ? "Atualizar" : "Adicionar"}
              onPress={handleAddOrUpdateEducation}
            />
          </View>
        </View>
      ) : (
        <View>
          {education.length > 0 ? (
            <View style={styles.itemList}>
              {education.map((edu) => (
                <View key={edu.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                      {edu.degree} em {edu.field}
                    </Text>
                    
                    <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>
                      {edu.institution}
                    </Text>
                    
                    <Text style={[styles.itemDate, { color: theme.colors.text.disabled }]}>
                      {edu.startDate} - {edu.endDate || 'Em andamento'}
                    </Text>
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
                      onPress={() => handleEditEducation(edu)}
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
                      onPress={() => confirmRemoveEducation(edu.id)}
                      style={styles.itemAction}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
              Nenhuma formação acadêmica adicionada
            </Text>
          )}
          
          <Button
            title="Adicionar formação"
            variant="outline"
            onPress={() => setAddingEducation(true)}
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