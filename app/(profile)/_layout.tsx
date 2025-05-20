// app/(app)/profile/_layout.tsx
import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="professionals/index" />
      <Stack.Screen name="professionals/[id]" options={{
        headerShown: true,
        headerTitle: 'Perfil profissional',
        headerTintColor: theme.colors.text.primary,
        presentation: 'modal',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
      }} />
      <Stack.Screen
        name="view/[id]"
        options={{
          headerShown: true,
          headerTitle: 'Perfil',
          headerTintColor: theme.colors.text.primary,
          presentation: 'modal',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}