import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Button } from '../ui/Button';

interface ProjectActionsProps {
  isOwner: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onLike: () => void;
  onShare: () => void;
  likeCount: number;
  theme: any;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  isOwner,
  onEdit,
  onRemove,
  onLike,
  onShare,
  likeCount,
  theme,
}) => {
  // Função auxiliar para criar estilos de botão sem problemas de tipagem
  const getRemoveButtonStyle = (): ViewStyle => {
    return {
      flex: 1,
      marginLeft: 8,
      borderColor: theme.colors.error,
    };
  };
  
  const getActionButtonStyle = (): ViewStyle => {
    return {
      flex: 1
    };
  };
  
  const getSecondButtonStyle = (): ViewStyle => {
    return {
      flex: 1,
      marginLeft: 8
    };
  };

  // Renderiza diferentes ações dependendo se o usuário é o dono do projeto
  if (isOwner) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Button
            title="Editar"
            variant="outline"
            onPress={onEdit}
            style={getActionButtonStyle()}
          />
          
          <Button
            title="Remover"
            variant="outline"
            onPress={onRemove}
            style={getRemoveButtonStyle()}
            textStyle={{ color: theme.colors.error }}
          />
        </View>
        
        <View style={[styles.row, styles.secondRow]}>
          <Button
            title={`Compartilhar`}
            variant="outline"
            onPress={onShare}
            style={getActionButtonStyle()}
          />
        </View>
      </View>
    );
  }
  
  // Ações para visualizadores (não donos)
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button
          title={`Match (${likeCount})`}
          onPress={onLike}
          style={getActionButtonStyle()}
        />
        
        <Button
          title="Compartilhar"
          variant="outline"
          onPress={onShare}
          style={getSecondButtonStyle()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondRow: {
    marginTop: 8,
  },
});

export default ProjectActions;