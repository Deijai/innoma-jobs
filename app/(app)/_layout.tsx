// app/(app)/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Redirect, Tabs } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';


// Ícones para as tabs
function HomeIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Icons.House size={24} color={color} />
    </View>
  );
}

function ProfileIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={styles.iconContainer}>
       <Icons.UserCircle size={24} color={color} />
    </View>
  );
}

function MessagesIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={styles.iconContainer}>
       <Icons.ChatCircle size={24} color={color} />
    </View>
  );
}

function SettingsIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Icons.Gear size={24} color={color} />
    </View>
  );
}

function ProjectsIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Icons.BracketsAngle size={24} color={color} />
    </View>
  );
}

export default function AppLayout() {
  const { theme } = useTheme();
  const { user, isLoading } = useAuth();

  // Verificar autenticação
  if (isLoading) {
    return null; // Ou uma tela de carregamento
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.disabled,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color }) => <HomeIcon focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ focused, color }) => <MessagesIcon focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => <ProfileIcon focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused, color }) => <SettingsIcon focused={focused} color={color} />,
        }}
      />

       <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused, color }) => <ProjectsIcon focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});