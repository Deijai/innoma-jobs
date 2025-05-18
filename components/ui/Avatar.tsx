// components/ui/Avatar.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  textStyle?: TextStyle;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  style,
  textStyle,
  backgroundColor,
}) => {
  const { theme } = useTheme();

  // Definir tamanho do avatar com base na prop size
  const getSize = (): number => {
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 32;
      case 'md':
        return 48;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  // Definir tamanho da fonte para iniciais
  const getFontSize = (): number => {
    switch (size) {
      case 'xs':
        return 10;
      case 'sm':
        return 12;
      case 'md':
        return 16;
      case 'lg':
        return 24;
      case 'xl':
        return 32;
      default:
        return 16;
    }
  };

  // Gerar iniciais a partir do nome
  const getInitials = (): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Gerar cor de fundo aleatória mas consistente com base no nome
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    
    if (!name) return theme.colors.primary;
    
    // Gerar uma cor consistente com base no nome
    const charCodes = name
      .split('')
      .map(char => char.charCodeAt(0))
      .reduce((sum, code) => sum + code, 0);
    
    const hue = charCodes % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();
  const bgColor = getBackgroundColor();

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: fontSize,
              lineHeight: fontSize * 1.4,
            },
            textStyle,
          ]}
        >
          {getInitials()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: 'white',
    fontWeight: '600',
  },
});