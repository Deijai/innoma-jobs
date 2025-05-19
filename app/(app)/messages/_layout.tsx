// app/(app)/messages/_layout.tsx
import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import React from 'react';
import { ChatProvider } from '@/context/ChatContext';

export default function MessagesLayout() {
  const { theme } = useTheme();

  return (
    <ChatProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="chat/[id]" 
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </ChatProvider>
  );
}