// app/_layout.tsx
import { ToastProvider } from '@/components/ui/Toast';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ChatProvider } from '../context/ChatContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ChatProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <StatusBar style="auto" />
          </ChatProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}