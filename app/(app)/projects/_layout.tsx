import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function ProjectsLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text.primary,
        headerShadowVisible: false,
        contentStyle: { 
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Meus Projetos'
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Novo Projeto',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Editar Projeto',
        }}
      />
      <Stack.Screen
        name="view/[id]"
        options={{
          title: 'Detalhes do Projeto',
        }}
      />
    </Stack>
  );
}