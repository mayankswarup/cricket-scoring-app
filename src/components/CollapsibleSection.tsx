import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, COUNTRY_COLORS } from '../constants';

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  countryColor?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
  countryColor = COLORS.primary,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.arrow, { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }]}>
          ▶
        </Text>
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  arrow: {
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.md,
  },
});

export default CollapsibleSection;
