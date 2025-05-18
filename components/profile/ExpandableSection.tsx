// components/profile/ExpandableSection.tsx
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExpandableSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  theme: any;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  expanded,
  onToggle,
  children,
  theme,
}) => {
  return (
    <View>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={onToggle}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <View style={styles.expandIcon}>
          <Icons.CaretDown size={24} weight='bold' color={theme.colors.text.primary} style={[
              {
                transform: [{ 
                  rotate: expanded ? '180deg' : '0deg' 
                }],
              }
            ]}  />
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  expandIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIconLine: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
});