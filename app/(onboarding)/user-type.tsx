// app/(onboarding)/user-type.tsx
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type UserType = 'professional' | 'recruiter' | null;

export default function UserTypeScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleContinue = () => {
    if (selectedType) {
      router.push('/login');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Quem é você?
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Selecione o tipo de perfil que você deseja criar
        </Text>
      </View>
      
      <View style={styles.content}>
        <UserTypeCard
          type="professional"
          title="Profissional"
          description="Estou procurando novas oportunidades e quero criar meu currículo digital"
          iconSource={require('../../assets/images/professional.png')}
          isSelected={selectedType === 'professional'}
          onSelect={() => setSelectedType('professional')}
          theme={theme}
        />
        
        <UserTypeCard
          type="recruiter"
          title="Recrutador"
          description="Represento uma empresa e estou procurando por talentos"
          iconSource={require('../../assets/images/recruiter.png')}
          isSelected={selectedType === 'recruiter'}
          onSelect={() => setSelectedType('recruiter')}
          theme={theme}
        />
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Continuar" 
          size="lg"
          onPress={handleContinue}
          disabled={!selectedType}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

interface UserTypeCardProps {
  type: UserType;
  title: string;
  description: string;
  iconSource: any;
  isSelected: boolean;
  onSelect: () => void;
  theme: any;
}

const UserTypeCard: React.FC<UserTypeCardProps> = ({
  type,
  title,
  description,
  iconSource,
  isSelected,
  onSelect,
  theme,
}) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onSelect}>
    <Card
      variant={isSelected ? 'elevated' : 'outlined'}
      style={[
        styles.card,
        isSelected && {
          borderColor: theme.colors.primary,
          borderWidth: 2,
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected 
                ? `${theme.colors.primary}15` 
                : theme.colors.card,
            },
          ]}
        >
          <Image source={iconSource} style={styles.icon} resizeMode="contain" />
        </View>
        
        <View style={styles.cardTextContainer}>
          <Text
            style={[
              styles.cardTitle,
              { color: theme.colors.text.primary },
              isSelected && { color: theme.colors.primary },
            ]}
          >
            {title}
          </Text>
          
          <Text
            style={[
              styles.cardDescription,
              { color: theme.colors.text.secondary },
            ]}
          >
            {description}
          </Text>
        </View>
        
        <View
          style={[
            styles.radioContainer,
            {
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              backgroundColor: theme.colors.card,
            },
          ]}
        >
          {isSelected && (
            <View
              style={[
                styles.radioInner,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    width: 32,
    height: 32,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  radioContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
});