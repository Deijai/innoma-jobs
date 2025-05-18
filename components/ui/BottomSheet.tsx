// components/ui/BottomSheet.tsx
import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  showHandle?: boolean;
  backdropOpacity?: number;
  style?: ViewStyle;
  snapPoints?: string[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  height = '50%',
  showHandle = true,
  backdropOpacity = 0.5,
  style,
  snapPoints,
}) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Converter altura para número se for string
  const getHeightValue = (): number => {
    if (typeof height === 'string') {
      const percentage = parseInt(height.replace('%', ''), 10);
      return (percentage / 100) * SCREEN_HEIGHT;
    }
    return height;
  };

  const heightValue = getHeightValue();
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Se o usuário arrastar para baixo mais de 100 pixels, feche o bottom sheet
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          close();
        } else {
          // Caso contrário, volte para a posição original
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Abrir o bottom sheet
  const open = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: backdropOpacity,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  };

  // Fechar o bottom sheet
  const close = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Abrir quando visible mudar para true
  useEffect(() => {
    if (visible) {
      open();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity,
            },
          ]}
        >
          <TouchableOpacity style={styles.backdropTouchable} onPress={close} />
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            {
              height: heightValue,
              backgroundColor: theme.colors.card,
              borderTopLeftRadius: theme.borderRadius.lg,
              borderTopRightRadius: theme.borderRadius.lg,
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, SCREEN_HEIGHT],
                    outputRange: [0, SCREEN_HEIGHT],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
            style,
          ]}
          {...panResponder.panHandlers}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>
          )}
          <View style={styles.childrenContainer}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  backdropTouchable: {
    flex: 1,
  },
  content: {
    width: '100%',
    ...StyleSheet.absoluteFillObject,
    top: undefined,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  childrenContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});