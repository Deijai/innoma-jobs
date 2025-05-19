import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
import {
  Image,
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
  const { theme, isDark } = useTheme();
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
      <StatusBar style={isDark ? "light" : "dark"} />
      
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
              icon={<Icons.CaretLeft size={24} color={theme.colors.text.primary} />}
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
                <Icons.CheckCircle 
                  size={48} 
                  color={theme.colors.success} 
                  weight="fill"
                />
              </View>
              
              <Text style={[styles.successText, { color: theme.colors.text.primary }]}>
                E-mail enviado com sucesso!
              </Text>
              
              <Text style={[styles.successDescription, { color: theme.colors.text.secondary }]}>
                Se <Text style={{ fontWeight: 'bold' }}>{email}</Text> estiver associado a uma conta, você receberá um link para criar uma nova senha.
              </Text>
              
              <View style={styles.emailIllustration}>
                <View style={[
                  styles.emailIcon, 
                  { backgroundColor: isDark ? theme.colors.card : '#F3F4F6' }
                ]}>
                  <Icons.EnvelopeSimple size={32} color={theme.colors.primary} />
                </View>
                <Icons.ArrowRight size={20} color={theme.colors.text.secondary} style={styles.arrowIcon} />
                <View style={[
                  styles.deviceIcon, 
                  { backgroundColor: isDark ? theme.colors.card : '#F3F4F6' }
                ]}>
                  <Icons.DeviceMobile size={32} color={theme.colors.primary} />
                </View>
              </View>
              
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
                leftIcon={<Icons.Envelope size={20} color={theme.colors.text.secondary} />}
              />
              
              <View style={styles.helpContainer}>
                <Icons.Info size={18} color={theme.colors.info} />
                <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
                  Enviaremos um link para o e-mail informado para que você possa redefinir sua senha.
                </Text>
              </View>
              
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
                <Icons.CaretLeft size={14} color={theme.colors.primary} />
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
    padding: 0,
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
  helpContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  helpText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
  backToLoginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  emailIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emailIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    marginHorizontal: 16,
  },
  backToLoginButton: {
    marginTop: 16,
  },
});