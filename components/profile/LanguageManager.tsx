// components/profile/LanguageManager.tsx
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface Language {
  id: string;
  language: string;
  level: string;
}

interface LanguageManagerProps {
  languages: Language[];
  onAddLanguage: (language: Omit<Language, 'id'>) => void;
  onUpdateLanguage: (id: string, language: Omit<Language, 'id'>) => void;
  onRemoveLanguage: (id: string) => void;
  theme: any;
}

export const LanguageManager: React.FC<LanguageManagerProps> = ({
  languages,
  onAddLanguage,
  onUpdateLanguage,
  onRemoveLanguage,
  theme,
}) => {
  const [addingLanguage, setAddingLanguage] = useState(false);
  const [editingLanguageId, setEditingLanguageId] = useState<string | null>(null);
  const [newLanguage, setNewLanguage] = useState({
    language: '',
    level: '',
  });

  // Níveis de proficiência em idiomas
  const languageLevels = [
    { label: 'Básico', value: 'Básico' },
    { label: 'Intermediário', value: 'Intermediário' },
    { label: 'Avançado', value: 'Avançado' },
    { label: 'Fluente', value: 'Fluente' },
    { label: 'Nativo', value: 'Nativo' },
  ];

  const resetForm = () => {
    setNewLanguage({
      language: '',
      level: '',
    });
    setEditingLanguageId(null);
    setAddingLanguage(false);
  };

  const handleAddOrUpdateLanguage = () => {
    // Validar campos
    if (!newLanguage.language || !newLanguage.level) {
      Alert.alert('Campos obrigatórios', 'Preencha idioma e nível de proficiência');
      return;
    }
    
    if (editingLanguageId) {
      onUpdateLanguage(editingLanguageId, newLanguage);
    } else {
      onAddLanguage(newLanguage);
    }
    
    resetForm();
  };

  const handleEditLanguage = (language: Language) => {
    setNewLanguage({
      language: language.language,
      level: language.level,
    });
    setEditingLanguageId(language.id);
    setAddingLanguage(true);
  };

  const confirmRemoveLanguage = (id: string) => {
    Alert.alert(
      'Remover idioma',
      'Tem certeza que deseja remover este idioma?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onRemoveLanguage(id),
        },
      ]
    );
  };

  return (
    <View>
      {addingLanguage ? (
        <View style={styles.formContainer}>
          <Input
            label="Idioma"
            placeholder="Ex: Inglês, Espanhol, Francês"
            value={newLanguage.language}
            onChangeText={(value) => setNewLanguage({...newLanguage, language: value})}
          />
          
          <Select
            label="Nível de proficiência"
            placeholder="Selecione o nível"
            options={languageLevels}
            value={newLanguage.level}
            onChange={(value) => setNewLanguage({...newLanguage, level: value})}
          />
          
          <View style={styles.formButtons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={resetForm}
              style={styles.cancelButton}
            />
            
            <Button
              title={editingLanguageId ? "Atualizar" : "Adicionar"}
              onPress={handleAddOrUpdateLanguage}
            />
          </View>
        </View>
      ) : (
        <View>
          {languages.length > 0 ? (
            <View style={styles.itemList}>
              {languages.map((lang) => (
                <View key={lang.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                      {lang.language}
                    </Text>
                    
                    <Badge
                      label={lang.level}
                      variant="info"
                      size="sm"
                      style={styles.levelBadge}
                    />
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
                      onPress={() => handleEditLanguage(lang)}
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
                      onPress={() => confirmRemoveLanguage(lang.id)}
                      style={styles.itemAction}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.text.disabled }]}>
              Nenhum idioma adicionado
            </Text>
          )}
          
          <Button
            title="Adicionar idioma"
            variant="outline"
            onPress={() => setAddingLanguage(true)}
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
  levelBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
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