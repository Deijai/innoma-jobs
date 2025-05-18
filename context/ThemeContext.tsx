import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof lightTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState<boolean>(deviceTheme === 'dark');

  // Determina o tema atual com base no modo
  const theme = isDark ? darkTheme : lightTheme;

  // Carrega a preferência de tema salva quando o app inicializa
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as ThemeMode);
          
          if (savedThemeMode === 'system') {
            setIsDark(deviceTheme === 'dark');
          } else {
            setIsDark(savedThemeMode === 'dark');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Atualiza o tema quando o modo do dispositivo muda (só relevante para o modo 'system')
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(deviceTheme === 'dark');
    }
  }, [deviceTheme, themeMode]);

  // Alterna entre os temas claro e escuro
  const toggleTheme = () => {
    const newThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(newThemeMode);
    setIsDark(!isDark);
    AsyncStorage.setItem('themeMode', newThemeMode);
  };

  // Define o modo do tema (light, dark ou system)
  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    AsyncStorage.setItem('themeMode', mode);

    if (mode === 'system') {
      setIsDark(deviceTheme === 'dark');
    } else {
      setIsDark(mode === 'dark');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        toggleTheme,
        setThemeMode: handleSetThemeMode,
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};
