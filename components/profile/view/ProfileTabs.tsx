import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileTabsProps {
  activeTab: 'profile' | 'projects';
  onChangeTab: (tab: 'profile' | 'projects') => void;
  theme: any;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onChangeTab,
  theme,
}) => {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'profile' && [
            styles.activeTab,
            { borderColor: theme.colors.primary }
          ]
        ]}
        onPress={() => onChangeTab('profile')}
      >
        <Text 
          style={[
            styles.tabText, 
            { 
              color: activeTab === 'profile' 
                ? theme.colors.primary 
                : theme.colors.text.secondary 
            }
          ]}
        >
          Perfil
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'projects' && [
            styles.activeTab,
            { borderColor: theme.colors.primary }
          ]
        ]}
        onPress={() => onChangeTab('projects')}
      >
        <Text 
          style={[
            styles.tabText, 
            { 
              color: activeTab === 'projects' 
                ? theme.colors.primary 
                : theme.colors.text.secondary 
            }
          ]}
        >
          Projetos
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
});