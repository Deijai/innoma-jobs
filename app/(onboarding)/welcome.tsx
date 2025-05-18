// app/(onboarding)/welcome.tsx
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const navigateToUserType = () => {
    router.push('/user-type');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Bem-vindo ao Innoma Jobs
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          A plataforma que conecta profissionais talentosos e recrutadores de forma simples e eficiente
        </Text>
        
        <View style={styles.featuresContainer}>
          <FeatureItem 
            theme={theme} 
            title="Crie seu currículo digital"
            description="Prepare seu perfil profissional completo para compartilhar com recrutadores" 
          />
          
          <FeatureItem 
            theme={theme} 
            title="Encontre talentos"
            description="Recrutadores podem buscar profissionais qualificados com filtros avançados" 
          />
          
          <FeatureItem 
            theme={theme} 
            title="Comunicação direta"
            description="Chat integrado para facilitar o contato entre candidatos e empresas" 
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Começar" 
          size="lg"
          onPress={navigateToUserType}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  theme: any;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ theme, title, description }) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
      <View style={[styles.innerIcon, { backgroundColor: theme.colors.primary }]} />
    </View>
    <View style={styles.featureText}>
      <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.5,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  innerIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});