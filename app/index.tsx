// app/index.tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonProfileHeader } from '../components/ui/Skeleton';

export default function Index() {
  const { isLoading, user, userData } = useAuth();

  // Se estiver carregando, mostra um Skeleton
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonProfileHeader />
      </View>
    );
  }

  // Se o usuário não estiver autenticado, redireciona para a tela de onboarding
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  // Se o usuário estiver autenticado, redireciona para a tela principal
  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});