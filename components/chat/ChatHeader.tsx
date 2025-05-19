// components/chat/ChatHeader.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import * as Icons from 'phosphor-react-native';

interface ChatHeaderProps {
  recipientName: string;
  recipientPhotoURL?: string;
  recipientTitle?: string;
  onBack: () => void;
  onViewProfile: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  recipientName,
  recipientPhotoURL,
  recipientTitle,
  onBack,
  onViewProfile,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.border,
      }
    ]}>
      <View style={styles.leftSection}>
        <IconButton
          icon={<Icons.CaretLeft size={24} color={theme.colors.text.primary} />}
          variant="ghost"
          onPress={onBack}
          style={styles.backButton}
        />
        
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={onViewProfile}
          activeOpacity={0.7}
        >
          <Avatar
            size="md"
            name={recipientName}
            source={recipientPhotoURL ? { uri: recipientPhotoURL } : undefined}
          />
          
          <View style={styles.nameSection}>
            <Text 
              style={[styles.recipientName, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {recipientName}
            </Text>
            
            {recipientTitle && (
              <Text 
                style={[styles.recipientTitle, { color: theme.colors.text.secondary }]}
                numberOfLines={1}
              >
                {recipientTitle}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.rightSection}>
        <IconButton
          icon={<Icons.User size={22} color={theme.colors.text.primary} />}
          variant="ghost"
          onPress={onViewProfile}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameSection: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipientTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});