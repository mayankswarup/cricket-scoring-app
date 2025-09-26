import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface BreadcrumbItem {
  id: string;
  label: string;
  onPress?: () => void;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  activeItem?: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ 
  items, 
  activeItem 
}) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={item.id} style={styles.breadcrumbItem}>
          {index > 0 && (
            <Text style={styles.separator}>›</Text>
          )}
          <TouchableOpacity
            style={[
              styles.breadcrumbButton,
              activeItem === item.id && styles.activeBreadcrumb
            ]}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <Text style={[
              styles.breadcrumbText,
              activeItem === item.id && styles.activeBreadcrumbText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.xs,
  },
  breadcrumbButton: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  activeBreadcrumb: {
    backgroundColor: COLORS.primary + '20',
  },
  breadcrumbText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  activeBreadcrumbText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
});

export default BreadcrumbNavigation;
