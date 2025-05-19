import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { useToast } from '../../components/ui/Toast';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, userData, logout } = useAuth();
  const { showToast } = useToast();
  
  // Estado local para forçar re-renderização quando o tema mudar
  const [currentTheme, setCurrentTheme] = useState(isDark ? 'dark' : 'light');
  
  // Animação para o toggle do tema
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const themeIconRotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Atualiza o estado local quando o tema global mudar
  useEffect(() => {
    setCurrentTheme(isDark ? 'dark' : 'light');
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isDark]);
  
  // Função wrapper para toggle do tema
  const handleToggleTheme = () => {
    toggleTheme();
    // A atualização do estado local acontecerá no useEffect
  };

  const handleLogout = async () => {
    try {
      await logout();
      // A navegação acontecerá automaticamente devido à proteção de rota
      showToast('Logout realizado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      showToast('Erro ao fazer logout', 'error');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: handleLogout,
          style: 'destructive',
        },
      ]
    );
  };

  const navigateToProfile = () => {
    router.push('/profile/edit');
  };

  // Função para renderizar um item de configuração
  const renderSettingItem = (
    icon: React.ReactNode,
    label: string,
    rightElement?: React.ReactNode,
    onPress?: () => void,
    hasWarning: boolean = false
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingItemLeft}>
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: hasWarning 
              ? `${theme.colors.error}15` 
              : `${theme.colors.primary}15`
          }
        ]}>
          {icon}
        </View>
        <Text style={[
          styles.settingLabel, 
          { 
            color: hasWarning 
              ? theme.colors.error 
              : theme.colors.text.primary
          }
        ]}>
          {label}
        </Text>
      </View>
      {rightElement || (
        onPress && (
          <Icons.CaretRight 
            size={20} 
            color={
              hasWarning 
                ? theme.colors.error 
                : theme.colors.text.secondary
            } 
          />
        )
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Configurações
        </Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard as ViewStyle}>
          <TouchableOpacity 
            style={styles.profileContent}
            onPress={navigateToProfile}
            activeOpacity={0.7}
          >
            <Avatar
              name={userData?.displayName || user?.email?.split('@')[0] || 'Usuário'}
              size="md"
              source={userData?.photoURL ? { uri: userData.photoURL } : undefined}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
                {userData?.displayName || user?.email?.split('@')[0] || 'Usuário'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.text.secondary }]}>
                {user?.email || 'Sem email'}
              </Text>
            </View>
            <Icons.PencilSimple size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </Card>
        
        {/* Appearance Settings */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
          Aparência
        </Text>
        <Card style={styles.card as ViewStyle}>
          {renderSettingItem(
            <Animated.View style={{ transform: [{ rotate: themeIconRotation }] }}>
              {isDark 
                ? <Icons.Moon size={20} color={theme.colors.primary} weight="fill" /> 
                : <Icons.Sun size={20} color={theme.colors.primary} weight="fill" />
              }
            </Animated.View>,
            isDark ? "Tema claro" : "Tema escuro",
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={`${theme.colors.border}80`}
            />
          )}
        </Card>
        
        {/* Account Settings */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
          Conta
        </Text>
        <Card style={styles.card}>
          {renderSettingItem(
            <Icons.UserCircle size={20} color={theme.colors.primary} />,
            "Meu Perfil",
            undefined,
            navigateToProfile
          )}
          
          <Divider style={styles.divider} />
          
          {renderSettingItem(
            <Icons.Bell size={20} color={theme.colors.primary} />,
            "Notificações",
            undefined,
            () => showToast('Configurações de notificações em breve', 'info')
          )}
          
          <Divider style={styles.divider} />
          
          {renderSettingItem(
            <Icons.LockKey size={20} color={theme.colors.primary} />,
            "Privacidade",
            undefined,
            () => showToast('Configurações de privacidade em breve', 'info')
          )}
          
          <Divider style={styles.divider} />
          
          {renderSettingItem(
            <Icons.Devices size={20} color={theme.colors.primary} />,
            "Dispositivos conectados",
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>1</Text>
            </View>,
            () => showToast('Gerenciamento de dispositivos em breve', 'info')
          )}
        </Card>
        
        {/* Support & About */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
          Suporte
        </Text>
        <Card style={styles.card}>
          {renderSettingItem(
            <Icons.Question size={20} color={theme.colors.primary} />,
            "Ajuda e suporte",
            undefined,
            () => showToast('Central de ajuda em breve', 'info')
          )}
          
          <Divider style={styles.divider} />
          
          {renderSettingItem(
            <Icons.Info size={20} color={theme.colors.primary} />,
            "Sobre o aplicativo",
            undefined,
            () => {
              Alert.alert(
                'Innoma Jobs',
                'Versão 1.0.0\n\nInnoma Jobs é um aplicativo para conectar profissionais e recrutadores de forma simples e eficiente.',
                [{ text: 'OK' }]
              );
            }
          )}
          
          <Divider style={styles.divider} />
          
          {renderSettingItem(
            <Icons.Star size={20} color={theme.colors.primary} />,
            "Avaliar o aplicativo",
            undefined,
            () => showToast('Avaliação do app em breve', 'info')
          )}
        </Card>
        
        {/* Logout Button */}
        <Card style={styles.logoutCard as ViewStyle}>
          {renderSettingItem(
            <Icons.SignOut size={20} color={theme.colors.error} />,
            "Sair da conta",
            undefined,
            confirmLogout,
            true
          )}
        </Card>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text.disabled }]}>
            Innoma Jobs • Versão 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  profileCard: {
    marginBottom: 24,
    padding: 0,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingArrow: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowRight: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  divider: {
    marginHorizontal: 16,
  },
  logoutCard: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
  },
});