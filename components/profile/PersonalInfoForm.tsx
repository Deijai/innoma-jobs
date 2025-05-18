// components/profile/PersonalInfoForm.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Toggle } from '../ui/Toggle';

interface PersonalInfoFormProps {
  name: string;
  title: string;
  location: string;
  about: string;
  available: boolean;
  onNameChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onAboutChange: (value: string) => void;
  onAvailableChange: (value: boolean) => void;
  theme: any;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  name,
  title,
  location,
  about,
  available,
  onNameChange,
  onTitleChange,
  onLocationChange,
  onAboutChange,
  onAvailableChange,
  theme,
}) => {
  return (
    <View>
      <Input
        label="Nome completo"
        placeholder="Digite seu nome completo"
        value={name}
        onChangeText={onNameChange}
      />
      
      <Input
        label="Título profissional"
        placeholder="Ex: Desenvolvedor Full Stack, Designer UX/UI"
        value={title}
        onChangeText={onTitleChange}
      />
      
      <Input
        label="Localização"
        placeholder="Ex: São Paulo, SP"
        value={location}
        onChangeText={onLocationChange}
      />
      
      <TextArea
        label="Sobre"
        placeholder="Fale sobre você, sua experiência e objetivos profissionais..."
        value={about}
        onChangeText={onAboutChange}
        maxLength={500}
        showCharacterCount
      />
      
      <View style={styles.toggleContainer}>
        <Text style={[styles.toggleLabel, { color: theme.colors.text.primary }]}>
          Disponível para novas oportunidades
        </Text>
        <Toggle
          value={available}
          onToggle={onAvailableChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleLabel: {
    fontSize: 16,
  },
});