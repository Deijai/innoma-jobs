// components/ui/TabBar.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  labelStyle?: TextStyle;
  activeLabelStyle?: TextStyle;
  indicatorStyle?: ViewStyle;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  containerStyle,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
  indicatorStyle,
}) => {
  const { theme } = useTheme();
  const [tabWidths, setTabWidths] = React.useState<{ [key: string]: number }>(
    {}
  );
  const [tabPositions, setTabPositions] = React.useState<{
    [key: string]: number;
  }>({});
  
  // Animação do indicador
  const indicatorPosition = React.useRef(new Animated.Value(0)).current;
  const indicatorWidth = React.useRef(new Animated.Value(0)).current;

  // Atualiza a posição e largura do indicador quando a aba ativa muda
  React.useEffect(() => {
    if (tabPositions[activeTab] !== undefined && tabWidths[activeTab] !== undefined) {
      Animated.parallel([
        Animated.spring(indicatorPosition, {
          toValue: tabPositions[activeTab],
          useNativeDriver: false,
          friction: 8,
        }),
        Animated.spring(indicatorWidth, {
          toValue: tabWidths[activeTab],
          useNativeDriver: false,
          friction: 8,
        }),
      ]).start();
    }
  }, [activeTab, tabPositions, tabWidths]);

  // Armazena a largura e posição de cada aba
  const handleTabLayout = (key: string) => (event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    
    setTabWidths(prev => ({
      ...prev,
      [key]: width,
    }));
    
    setTabPositions(prev => ({
      ...prev,
      [key]: x,
    }));

    // Se for a aba ativa e ainda não temos informações sobre ela, 
    // atualize imediatamente o indicador
    if (key === activeTab && (tabPositions[key] === undefined || tabWidths[key] === undefined)) {
      indicatorPosition.setValue(x);
      indicatorWidth.setValue(width);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.card },
        containerStyle,
      ]}
    >
      {tabs.map(tab => {
        const isActive = tab.key === activeTab;
        
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.key)}
            style={[
              styles.tab,
              tabStyle,
              isActive && activeTabStyle,
            ]}
            onLayout={handleTabLayout(tab.key)}
          >
            {tab.icon && (
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
            )}
            
            <Text
              style={[
                styles.label,
                { color: theme.colors.text.secondary },
                labelStyle,
                isActive && {
                  color: theme.colors.primary,
                  fontWeight: '600',
                },
                isActive && activeLabelStyle,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      
      {/* Indicador de aba ativa */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.colors.primary,
            left: indicatorPosition,
            width: indicatorWidth,
          },
          indicatorStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
    height: 48,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});