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
import { Divider } from '../../components/ui/Divider';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

// Definindo interface para valores do formulário
interface FormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
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
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Bem-vindo de volta
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Faça login para continuar sua jornada profissional
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
              leftIcon={
                <Icons.Envelope size={20} color={theme.colors.text.secondary} />
              }
            />
            
            <Input
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry={!showPassword}
              value={formValues.password}
              onChangeText={(value) => handleChange('password', value)}
              errorMessage={errors.password}
              leftIcon={
                <Icons.Lock size={20} color={theme.colors.text.secondary} />
              }
              rightIcon={
                <TouchableOpacity onPress={toggleShowPassword}>
                  {showPassword ? (
                    <Icons.Eye size={20} color={theme.colors.text.secondary} />
                  ) : (
                    <Icons.EyeSlash size={20} color={theme.colors.text.secondary} />
                  )}
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
            <Divider label="ou continue com" spacing={24} />
            
            <View style={styles.socialButtonsRow}>
              <TouchableOpacity 
                style={[styles.socialButton, { borderColor: theme.colors.border }]}
                onPress={() => {/* Google login implementation */}}
              >
                <Image 
                  source={require('../../assets/images/google.png')} 
                  style={styles.socialIcon} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, { borderColor: theme.colors.border }]}
                onPress={() => {/* Apple login implementation */}}
              >
                <Icons.AppleLogo 
                  size={24} 
                  color={isDark ? theme.colors.text.primary : '#000'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, { borderColor: theme.colors.border }]}
                onPress={() => {/* Facebook login implementation */}}
              >
                <Icons.FacebookLogo 
                  size={24} 
                  color="#1877F2" 
                />
              </TouchableOpacity>
            </View>
            
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logo: {
    width: 180,
    height: 60,
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
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
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