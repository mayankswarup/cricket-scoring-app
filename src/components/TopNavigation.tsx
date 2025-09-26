import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface TopNavigationProps {
  onMenuPress: () => void;
  onSearchPress: () => void;
  onMessagesPress: () => void;
  onNotificationsPress: () => void;
  messageCount?: number;
  notificationCount?: number;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  onMenuPress,
  onSearchPress,
  onMessagesPress,
  onNotificationsPress,
  messageCount = 0,
  notificationCount = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Left side - Menu and Logo */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏏</Text>
        </View>
      </View>

      {/* Right side - Search, Messages, Notifications */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onMessagesPress} style={styles.iconButton}>
          <Text style={styles.iconText}>💬</Text>
          {messageCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{messageCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onNotificationsPress} style={styles.iconButton}>
          <Text style={styles.iconText}>🔔</Text>
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: SIZES.xs,
    marginRight: SIZES.sm,
  },
  menuIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  logoContainer: {
    marginLeft: SIZES.xs,
  },
  logoIcon: {
    fontSize: 24,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  iconButton: {
    position: 'relative',
    padding: SIZES.xs,
  },
  iconText: {
    fontSize: 18,
    color: COLORS.white,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});

export default TopNavigation;
