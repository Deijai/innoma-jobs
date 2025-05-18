// app/(auth)/forgot-password.tsx
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);

  // Voltar para a tela anterior
  const handleGoBack = () => {
    router.back();
  };

  // Validar e-mail
  const validateEmail = (): boolean => {
    if (!email) {
      setError('E-mail é obrigatório');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('E-mail inválido');
      return false;
    }
    return true;
  };

  // Limpar erro quando usuário começa a digitar
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  // Enviar e-mail de recuperação de senha
  const handleSubmit = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsResetSent(true);
      showToast('E-mail de recuperação enviado com sucesso!', 'success');
    } catch (error: any) {
      // Identificar o tipo de erro
      let errorMessage = 'Não foi possível enviar o e-mail de recuperação. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Não encontramos uma conta com este e-mail';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Voltar para a tela de login
  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <IconButton
              icon={
                <View style={styles.backIcon}>
                  <View style={[styles.backIconLine, { backgroundColor: theme.colors.text.primary }]} />
                </View>
              }
              variant="ghost"
              onPress={handleGoBack}
              style={styles.backButton}
            />
            
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Recuperar senha
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              {isResetSent 
                ? 'Verifique seu e-mail e siga as instruções para redefinir sua senha.'
                : 'Informe seu e-mail para receber instruções de recuperação de senha.'
              }
            </Text>
          </View>
          
          {isResetSent ? (
            <View style={styles.successContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.success}15` }]}>
                <View style={[styles.successIcon, { borderColor: theme.colors.success }]} />
              </View>
              
              <Text style={[styles.successText, { color: theme.colors.text.primary }]}>
                E-mail enviado com sucesso!
              </Text>
              
              <Text style={[styles.successDescription, { color: theme.colors.text.secondary }]}>
                Se {email} estiver associado a uma conta, você receberá um link para criar uma nova senha.
              </Text>
              
              <Button
                title="Voltar para o Login"
                size="lg"
                onPress={handleBackToLogin}
                style={styles.backToLoginButton}
                fullWidth
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="E-mail"
                placeholder="Seu endereço de e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={handleEmailChange}
                errorMessage={error}
              />
              
              <Button
                title="Recuperar senha"
                size="lg"
                onPress={handleSubmit}
                isLoading={isLoading}
                style={styles.submitButton}
                fullWidth
              />
              
              <TouchableOpacity 
                onPress={handleBackToLogin}
                style={styles.backToLoginLink}
              >
                <Text style={[styles.backToLoginText, { color: theme.colors.primary }]}>
                  Voltar para o login
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconLine: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
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
  form: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
  },
  backToLoginLink: {
    alignSelf: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 32,
    height: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    transform: [{ rotate: '45deg' }],
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  backToLoginButton: {
    marginTop: 16,
  },
});