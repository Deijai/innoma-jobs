// app/(auth)/register.tsx
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/Chip';
import { Divider } from '../../components/ui/Divider';
import { IconButton } from '../../components/ui/IconButton';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

// Definindo interface para valores do formulário
interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'professional' | 'recruiter';
}

export default function RegisterScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: (params.userType as 'professional' | 'recruiter') || 'professional',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<FormValues> = {};

    if (!formValues.name) {
      newErrors.name = 'Nome é obrigatório';
    }

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

    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
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

  // Alternar visibilidade da confirmação de senha
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev);
  };

  // Navegar para tela de login
  const navigateToLogin = () => {
    router.push('/login');
  };

  // Voltar para a tela anterior
  const handleGoBack = () => {
    router.back();
  };

  // Mudar tipo de usuário
  const handleUserTypeChange = (selectedIds: string[]) => {
    if (selectedIds.length > 0) {
      handleChange('userType', selectedIds[0] as 'professional' | 'recruiter');
    }
  };

  // Enviar formulário
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register(
        formValues.email, 
        formValues.password, 
        formValues.userType
      );
      
      // Após o registro, atualize os dados do usuário com o nome
      // Isso será implementado depois com updateUserData
      
      showToast('Registro realizado com sucesso!', 'success');
      // Router não é necessário aqui, pois o usuário será redirecionado
      // automaticamente pela verificação de autenticação
    } catch (error: any) {
      // Identificar o tipo de erro
      let errorMessage = 'Ocorreu um erro ao registrar. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca';
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
              Criar Conta
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Registre-se para começar a usar o Innoma Jobs
            </Text>
          </View>
          
          <View style={styles.form}>
            <Input
              label="Nome completo"
              placeholder="Seu nome completo"
              value={formValues.name}
              onChangeText={(value) => handleChange('name', value)}
              errorMessage={errors.name}
            />
            
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
              placeholder="Crie uma senha"
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
              helperText="A senha deve ter pelo menos 6 caracteres"
            />
            
            <Input
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              secureTextEntry={!showConfirmPassword}
              value={formValues.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              errorMessage={errors.confirmPassword}
              rightIcon={
                <TouchableOpacity onPress={toggleShowConfirmPassword}>
                  <Text style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
                    {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </TouchableOpacity>
              }
              onRightIconPress={toggleShowConfirmPassword}
            />
            
            <View style={styles.userTypeContainer}>
              <Text style={[styles.userTypeLabel, { color: theme.colors.text.primary }]}>
                Tipo de perfil
              </Text>
              
              <ChipGroup
                chips={[
                  { id: 'professional', label: 'Profissional' },
                  { id: 'recruiter', label: 'Recrutador' },
                ]}
                selectedChipIds={[formValues.userType]}
                onChange={handleUserTypeChange}
                containerStyle={styles.chipGroup}
              />
            </View>
            
            <Button
              title="Criar conta"
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
              title="Registrar com Google"
              variant="outline"
              size="lg"
              onPress={() => {/* Google registration implementation */}}
              style={styles.socialButton}
              fullWidth
            />
            
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.colors.text.secondary }]}>
                Já tem uma conta?
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                  Entrar
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
  header: {
    marginBottom: 24,
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
    marginBottom: 24,
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  chipGroup: {
    marginTop: 8,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});