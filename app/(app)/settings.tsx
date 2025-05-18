import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { useToast } from '../../components/ui/Toast';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();
  
  // Estado local para forçar re-renderização quando o tema mudar
  const [currentTheme, setCurrentTheme] = useState(isDark ? 'dark' : 'light');
  
  // Atualiza o estado local quando o tema global mudar
  useEffect(() => {
    setCurrentTheme(isDark ? 'dark' : 'light');
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

  // Debug para verificar re-renderização
  console.log('Rendering SettingsScreen with theme:', currentTheme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "dark" : "light"} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Configurações
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
              {isDark ? "Tema claro" : "Tema escuro"}
            </Text>
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
              Notificações
            </Text>
            <View style={styles.settingArrow}>
              <View 
                style={[
                  styles.arrowRight, 
                  { borderColor: theme.colors.text.disabled }
                ]} 
              />
            </View>
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
              Privacidade
            </Text>
            <View style={styles.settingArrow}>
              <View 
                style={[
                  styles.arrowRight, 
                  { borderColor: theme.colors.text.disabled }
                ]} 
              />
            </View>
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.card}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
              Ajuda e suporte
            </Text>
            <View style={styles.settingArrow}>
              <View 
                style={[
                  styles.arrowRight, 
                  { borderColor: theme.colors.text.disabled }
                ]} 
              />
            </View>
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
              Sobre o aplicativo
            </Text>
            <View style={styles.settingArrow}>
              <View 
                style={[
                  styles.arrowRight, 
                  { borderColor: theme.colors.text.disabled }
                ]} 
              />
            </View>
          </TouchableOpacity>
        </Card>
        
        <Button
          title="Sair da conta"
          variant="outline"
          onPress={confirmLogout}
          style={styles.logoutButton}
          fullWidth
        />
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
  card: {
    marginBottom: 24,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
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
  logoutButton: {
    marginBottom: 40,
  },
});