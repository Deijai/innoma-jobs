import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";

// Hook para facilitar o uso do contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
};