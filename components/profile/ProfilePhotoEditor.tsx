// components/profile/ProfilePhotoEditor.tsx
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { ReactNode, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { storage } from '../../services/firebase';
import { Avatar } from '../ui/Avatar';

interface ProfilePhotoEditorProps {
  photoUri: string | null;
  icon?: ReactNode,
  name: string;
  userId: string;
  onPhotoUpdated: (photoURL: string) => void;
  onError: (message: string) => void;
  theme: any;
}

export const ProfilePhotoEditor: React.FC<ProfilePhotoEditorProps> = ({
  photoUri,
  icon,
  name,
  userId,
  onPhotoUpdated,
  onError,
  theme,
}) => {
  const [photoUploading, setPhotoUploading] = useState(false);

  // Selecionar foto de perfil
  const pickImage = async () => {
    // Pedir permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      onError('Precisamos de permissão para acessar suas fotos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      onError('Erro ao selecionar imagem');
    }
  };

  // Fazer upload da foto para o Firebase Storage
  const uploadProfilePhoto = async (uri: string) => {
    if (!userId) return;
    
    try {
      setPhotoUploading(true);
      
      // Converter URI para Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Referência para o arquivo no Storage
      const fileRef = ref(storage, `profile_photos/${userId}`);
      
      // Fazer upload
      await uploadBytes(fileRef, blob);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(fileRef);
      
      // Callback para atualizar o perfil
      onPhotoUpdated(downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      onError('Erro ao fazer upload da foto');
      return null;
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <View style={styles.photoContainer}>
      {photoUploading ? (
        <View style={[styles.photoLoading, { backgroundColor: theme.colors.border }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <Avatar
          name={name}
          size="xl"
          source={photoUri ? { uri: photoUri } : undefined}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.photoEditButton, { borderColor: theme.colors.primary }]}
        onPress={pickImage}
      >
        <View style={styles.editIconSmall}>
          <View>
             {icon}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  photoLoading: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconSmall: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});