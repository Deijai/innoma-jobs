// components/ui/Toast.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  showCloseButton?: boolean;
  autoClose?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  position?: 'top' | 'bottom';
  offset?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  showCloseButton = true,
  autoClose = true,
  containerStyle,
  textStyle,
  position = 'top',
  offset = 60,
}) => {
  const { theme } = useTheme();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(position === 'top' ? -20 : 20)).current;
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Obter a cor de fundo com base no tipo
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
      default:
        return theme.colors.info;
    }
  };

  // Mostrar o toast
  const showToast = () => {
    // Limpar timeout anterior, se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Animação para mostrar
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto fechar após a duração especificada
    if (autoClose) {
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  // Esconder o toast
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === 'top' ? -20 : 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  // Efeito para mostrar/esconder o toast quando a prop 'visible' mudar
  React.useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }

    // Limpar o timeout ao desmontar o componente
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? { top: offset } : { bottom: offset },
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
          ...theme.shadow.md,
        },
        containerStyle,
      ]}
    >
      <Text
        style={[
          styles.message,
          { color: '#FFFFFF' },
          textStyle,
        ]}
      >
        {message}
      </Text>

      {showCloseButton && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
          hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
        >
          <View style={styles.closeIcon}>
            <View style={[styles.closeLine, { backgroundColor: '#FFFFFF' }, styles.closeLineLeft]} />
            <View style={[styles.closeLine, { backgroundColor: '#FFFFFF' }, styles.closeLineRight]} />
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Criando o contexto para o Toast
type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
};

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = React.useState({
    visible: false,
    message: '',
    type: 'info' as ToastType,
    duration: 3000,
  });

  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    setToast({ visible: true, message, type, duration });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine: {
    position: 'absolute',
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  closeLineLeft: {
    transform: [{ rotate: '45deg' }],
  },
  closeLineRight: {
    transform: [{ rotate: '-45deg' }],
  },
});