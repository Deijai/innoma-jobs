// components/profile/view/ProfileHeader.tsx (versão modificada)
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Icons from 'phosphor-react-native';

interface ProfileHeaderProps {
  name: string;
  title: string;
  location: string;
  photoURL?: string;
  available: boolean;
  onShare: () => void;
  theme: any;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  profileId: string; // Adicionado o ID do perfil
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  title,
  location,
  photoURL,
  available,
  onShare,
  theme,
  isOwnProfile = false,
  onEdit,
  profileId
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Avatar
          name={name}
          size="xl"
          source={photoURL ? { uri: photoURL } : undefined}
        />
        
        <View style={styles.profileActions}>
          <IconButton
            icon={<Icons.Share size={20} color={theme.colors.text.primary} />}
            variant="outline"
            size="sm"
            onPress={onShare}
            style={styles.actionButton}
            round
          />
          
          {isOwnProfile && onEdit && (
            <IconButton
              icon={<Icons.PencilSimple size={20} color={theme.colors.text.primary} />}
              variant="outline"
              size="sm"
              onPress={onEdit}
              style={styles.actionButton}
              round
            />
          )}
        </View>
        
        <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
          {name}
        </Text>
        
        <Text style={[styles.profileTitle, { color: theme.colors.text.secondary }]}>
          {title}
        </Text>
        
        <View style={styles.locationContainer}>
          <Icons.MapPin size={16} color={theme.colors.text.disabled} style={styles.locationIcon} />
          <Text style={[styles.locationText, { color: theme.colors.text.disabled }]}>
            {location}
          </Text>
        </View>
        
        {available && (
          <Badge
            label="Disponível para oportunidades"
            variant="success"
            style={styles.availableBadge}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    marginHorizontal: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
  },
  availableBadge: {
    alignSelf: 'center',
  },
});