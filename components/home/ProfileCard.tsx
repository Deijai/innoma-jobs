// components/home/ProfileCard.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStartChat } from '@/hooks/useStartChat';
import * as Icons from 'phosphor-react-native';

interface ProfileData {
  id: string;
  name: string;
  title: string;
  location: string;
  tags: string[];
  photoURL?: string;
  available: boolean;
}

interface ProfileCardProps {
  profile: ProfileData;
  onViewProfile: (profileId: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onViewProfile
}) => {
  const { theme } = useTheme();
  const { startChatWithUser } = useStartChat();

  const handleViewProfile = () => {
    onViewProfile(profile.id);
  };

  const handleSendMessage = () => {
    startChatWithUser(profile.id);
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        ...theme.shadow.sm
      }
    ]}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handleViewProfile}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <Avatar 
            name={profile.name} 
            size="md" 
            source={profile.photoURL ? { uri: profile.photoURL } : undefined} 
          />
        </View>
        
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text 
              style={[styles.nameText, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {profile.name}
            </Text>
            
            {profile.available && (
              <Badge
                label="Disponível"
                variant="success"
                size="sm"
                style={styles.badge}
              />
            )}
          </View>
          
          <Text 
            style={[styles.titleText, { color: theme.colors.text.secondary }]}
            numberOfLines={1}
          >
            {profile.title}
          </Text>
          
          <View style={styles.locationContainer}>
            <Icons.MapPin size={14} color={theme.colors.text.disabled} style={styles.icon} />
            <Text 
              style={[styles.locationText, { color: theme.colors.text.disabled }]}
              numberOfLines={1}
            >
              {profile.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.tagsContainer}>
        {profile.tags.slice(0, 3).map((tag, index) => (
          <Badge
            key={`tag-${profile.id}-${index}`}
            label={tag}
            variant="primary"
            size="sm"
            style={styles.tag}
          />
        ))}
        {profile.tags.length > 3 && (
          <Badge
            label={`+${profile.tags.length - 3}`}
            variant="info"
            size="sm"
            style={styles.tag}
          />
        )}
      </View>
      
      <View style={[styles.actionsContainer, { borderTopColor: theme.colors.border }]}>
        <Button
          title="Ver perfil"
          variant="outline"
          size="sm"
          onPress={handleViewProfile}
          style={styles.button}
        />
        
        <Button
          title="Mensagem"
          size="sm"
          onPress={handleSendMessage}
          leftIcon={<Icons.ChatTeardropText size={18} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    marginLeft: 'auto',
  },
  titleText: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    marginRight: 8,
  },
});
