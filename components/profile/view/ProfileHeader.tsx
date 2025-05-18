import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
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
            icon={
              <View style={styles.shareIcon}>
                <View style={[styles.shareIconArrow, { borderColor: theme.colors.text.primary }]} />
              </View>
            }
            variant="outline"
            size="sm"
            onPress={onShare}
            style={styles.actionButton}
            round
          />
          
          <IconButton
            icon={
              <View style={styles.messageIcon}>
                <View style={[styles.messageIconBubble, { borderColor: theme.colors.text.primary }]} />
              </View>
            }
            variant="outline"
            size="sm"
            onPress={onMessage}
            style={styles.actionButton}
            round
          />
        </View>
        
        <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
          {name}
        </Text>
        
        <Text style={[styles.profileTitle, { color: theme.colors.text.secondary }]}>
          {title}
        </Text>
        
        <View style={styles.locationContainer}>
          <View 
            style={[
              styles.locationIcon, 
              { backgroundColor: theme.colors.text.disabled }
            ]} 
          />
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
      
      <Card variant="outlined" style={styles.actionCard}>
        <Button
          title="Enviar mensagem"
          onPress={onMessage}
          fullWidth
        />
      </Card>
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
  shareIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIconArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomWidth: 8,
  },
  messageIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageIconBubble: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
