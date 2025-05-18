// app/(auth)/login.tsx
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
import { Divider } from '../../components/ui/Divider';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

// Definindo interface para valores do formulário
interface FormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formValues, setFormValues] = useState<FormValues>({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<FormValues> = {};

    if (!formValues.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formValues.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formValues.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar valores do formulário
  const handleChange = (name: keyof FormValues, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Alternar visibilidade da senha
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  // Navegar para tela de registro
  const navigateToRegister = () => {
    router.push('/register');
  };

  // Navegar para tela de recuperação de senha
  const navigateToForgotPassword = () => {
    router.push('/forgot-password');
  };

  // Enviar formulário
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formValues.email, formValues.password);
      showToast('Login realizado com sucesso!', 'success');
      router.push('/');
      // O router não é necessário aqui, pois o usuário será redirecionado automaticamente
      // pela verificação de autenticação no index.tsx
    } catch (error: any) {
      // Identificar o tipo de erro
      let errorMessage = 'Ocorreu um erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'E-mail ou senha incorretos';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
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
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Entrar
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Faça login para acessar sua conta
            </Text>
          </View>
          
          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="Seu endereço de e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formValues.email}
              onChangeText={(value) => handleChange('email', value)}
              errorMessage={errors.email}
            />
            
            <Input
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry={!showPassword}
              value={formValues.password}
              onChangeText={(value) => handleChange('password', value)}
              errorMessage={errors.password}
              rightIcon={
                <TouchableOpacity onPress={toggleShowPassword}>
                  <Text style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </TouchableOpacity>
              }
              onRightIconPress={toggleShowPassword}
            />
            
            <TouchableOpacity 
              onPress={navigateToForgotPassword}
              style={styles.forgotPasswordLink}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>
            
            <Button
              title="Entrar"
              size="lg"
              onPress={handleSubmit}
              isLoading={isLoading}
              style={styles.submitButton}
              fullWidth
            />
          </View>
          
          <View style={styles.footer}>
            <Divider label="ou" spacing={24} />
            
            <Button
              title="Entrar com Google"
              variant="outline"
              size="lg"
              onPress={() => {/* Google login implementation */}}
              style={styles.socialButton}
              fullWidth
            />
            
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: theme.colors.text.secondary }]}>
                Não tem uma conta?
              </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                  Registre-se
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
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
    marginBottom: 24,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
  },
  socialButton: {
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});