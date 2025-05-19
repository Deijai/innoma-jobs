// components/profile/view/ProfileActions.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Button } from '@/components/ui/Button';
import { MessageButton } from '@/components/profile/MessageButton';
import * as Icons from 'phosphor-react-native';

interface ProfileActionsProps {
  profileId: string;
  isOwnProfile: boolean;
  onEdit?: () => void;
  theme: any;
  style?: ViewStyle;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  profileId,
  isOwnProfile,
  onEdit,
  theme,
  style
}) => {
  // Combinar estilos
  const containerStyle = style ? {...styles.container, ...style} : styles.container;
  
  // Se for o próprio perfil, mostrar opção de editar
  if (isOwnProfile) {
    return (
      <View style={containerStyle}>
        <Button
          title="Editar perfil"
          onPress={onEdit}
          variant="outline"
          fullWidth
          leftIcon={<Icons.PencilSimple size={20} color={theme.colors.primary} />}
        />
      </View>
    );
  }
  
  // Se for perfil de outro usuário, mostrar botão de mensagem
  return (
    <View style={containerStyle}>
      <MessageButton 
        recipientId={profileId} 
        fullWidth 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  }
});