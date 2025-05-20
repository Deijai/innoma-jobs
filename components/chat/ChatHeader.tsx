import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated,
  Platform
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import * as Icons from 'phosphor-react-native';

interface ChatHeaderProps {
  recipientName: string;
  recipientPhotoURL?: string;
  recipientTitle?: string;
  onBack?: () => void;
  onViewProfile: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  recipientName,
  recipientPhotoURL,
  recipientTitle,
  onBack,
  onViewProfile,
}) => {
  const { theme, isDark } = useTheme();
  
  // Animações para visual polido
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  
  // Animar ao montar
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.border,
        shadowColor: isDark ? '#000000' : theme.colors.primary,
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
          
          <Animated.View 
            style={[
              styles.nameSection, 
              { 
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }] 
              }
            ]}
          >
            <Text 
              style={[styles.recipientName, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {recipientName}
            </Text>
            
            {recipientTitle && (
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                <Text 
                  style={[styles.recipientTitle, { color: theme.colors.text.secondary }]}
                  numberOfLines={1}
                >
                  {recipientTitle}
                </Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.rightSection}>
        <IconButton
          icon={<Icons.User size={20} color={theme.colors.text.primary} />}
          variant="ghost"
          onPress={onViewProfile}
          style={styles.profileButton}
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
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
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  nameSection: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  recipientTitle: {
    fontSize: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginLeft: 4,
  },
});