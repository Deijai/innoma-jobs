import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileHeaderProps {
  name: string;
  title: string;
  location: string;
  photoURL?: string;
  available: boolean;
  onShare: () => void;
  onMessage: () => void;
  theme: any;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  title,
  location,
  photoURL,
  available,
  onShare,
  onMessage,
  theme,
  isOwnProfile = false,
  onEdit,
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
          {isOwnProfile && onEdit && (
            <IconButton
              icon={
                <Icons.Pencil size={18} color={theme.colors.text.primary} />
              }
              variant="outline"
              size="sm"
              onPress={onEdit}
              style={styles.actionButton}
              round
            />
          )}
          
          <IconButton
            icon={
              <Icons.Share size={18} color={theme.colors.text.primary} />
            }
            variant="outline"
            size="sm"
            onPress={onShare}
            style={styles.actionButton}
            round
          />
          
          {!isOwnProfile && (
            <IconButton
              icon={
                <Icons.ChatCircle size={18} color={theme.colors.text.primary} />
              }
              variant="outline"
              size="sm"
              onPress={onMessage}
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
          <Icons.MapPin size={14} color={theme.colors.text.disabled} style={styles.locationIcon} />
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
      
      {!isOwnProfile && (
        <Card variant="outlined" style={styles.actionCard}>
          <Button
            title="Enviar mensagem"
            onPress={onMessage}
            fullWidth
          />
        </Card>
      )}
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
  actionCard: {
    padding: 16,
  },
});