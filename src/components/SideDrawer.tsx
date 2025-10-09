import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { PlayerRegistration } from '../types';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
}

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  user?: PlayerRegistration | null;
  onProfilePress: () => void;
  onLogout: () => void;
  onTossPress?: () => void;
  onNotificationTestPress?: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({
  visible,
  onClose,
  user,
  onProfilePress,
  onLogout,
  onTossPress,
  onNotificationTestPress,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'pro',
      label: 'PRO starting at ₹199',
      icon: '📊',
      onPress: () => console.log('PRO pressed'),
      badge: 'PRO',
      badgeColor: COLORS.success,
    },
    {
      id: 'tournament',
      label: 'Add a Tournament/Series',
      icon: '🏆',
      onPress: () => console.log('Tournament pressed'),
      badge: 'FREE',
      badgeColor: COLORS.warning,
    },
    {
      id: 'match',
      label: 'Start A Match',
      icon: '🪙',
      onPress: () => console.log('Start Match pressed'),
      badge: 'FREE',
      badgeColor: COLORS.warning,
    },
    {
      id: 'live',
      label: 'Go Live',
      icon: '▶️',
      onPress: () => console.log('Go Live pressed'),
    },
    {
      id: 'toss',
      label: 'Toss',
      icon: '🎯',
      onPress: () => {
        onClose();
        onTossPress?.();
      },
    },
    // Notifications - Skipped for now (requires dev build for iOS)
    // {
    //   id: 'notifications',
    //   label: 'Test Notifications',
    //   icon: '🔔',
    //   onPress: () => {
    //     onClose();
    //     onNotificationTestPress?.();
    //   },
    //   badge: 'TEST',
    //   badgeColor: COLORS.primary,
    // },
    {
      id: 'mycricket',
      label: 'My Cricket',
      icon: '🏏',
      onPress: () => console.log('My Cricket pressed'),
    },
    {
      id: 'performance',
      label: 'My Performance',
      icon: '📊',
      onPress: () => console.log('Performance pressed'),
    },
    {
      id: 'store',
      label: 'CricHeroes Store',
      icon: '🛍️',
      onPress: () => console.log('Store pressed'),
    },
    {
      id: 'playerleaderboard',
      label: 'Player Leaderboard',
      icon: '🏆',
      onPress: () => console.log('Player Leaderboard pressed'),
    },
    {
      id: 'teamleaderboard',
      label: 'Team Leaderboard',
      icon: '🏆',
      onPress: () => console.log('Team Leaderboard pressed'),
    },
    {
      id: 'awards',
      label: 'CricHeroes Awards',
      icon: '🏅',
      onPress: () => console.log('Awards pressed'),
    },
    {
      id: 'bookground',
      label: 'BookMyGround',
      icon: '#️⃣',
      onPress: () => console.log('BookMyGround pressed'),
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: '🔄',
      onPress: () => console.log('Challenges pressed'),
    },
    {
      id: 'looking',
      label: 'Looking For',
      icon: '🔍',
      onPress: () => console.log('Looking For pressed'),
    },
  ];

  const additionalMenuItems: MenuItem[] = [
    {
      id: 'share',
      label: 'Share the app',
      icon: '↗️',
      onPress: () => console.log('Share app pressed'),
    },
    {
      id: 'rate',
      label: 'Rate us',
      icon: '⭐',
      onPress: () => console.log('Rate us pressed'),
    },
    {
      id: 'appcode',
      label: 'App code',
      icon: '🔒',
      onPress: () => console.log('App code pressed'),
    },
    {
      id: 'whatsnew',
      label: "What's New",
      icon: 'ℹ️',
      onPress: () => console.log('What\'s New pressed'),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: '📷',
      onPress: () => console.log('Instagram pressed'),
    },
    {
      id: 'youtube',
      label: 'YouTube',
      icon: '▶️',
      onPress: () => console.log('YouTube pressed'),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: '📘',
      onPress: () => console.log('Facebook pressed'),
    },
    {
      id: 'twitter',
      label: 'X',
      icon: '🐦',
      onPress: () => console.log('X/Twitter pressed'),
    },
    {
      id: 'about',
      label: 'About Us',
      icon: '👤',
      onPress: () => console.log('About Us pressed'),
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: '✏️',
      onPress: () => console.log('Blog pressed'),
    },
    {
      id: 'help',
      label: 'Help / FAQs',
      icon: '❓',
      onPress: () => console.log('Help/FAQs pressed'),
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: '🔍',
      onPress: () => console.log('Privacy Policy pressed'),
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      icon: '📝',
      onPress: () => console.log('Terms of Service pressed'),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
        delayPressIn={0}
        delayPressOut={0}
      >
        <TouchableOpacity 
          style={styles.drawer}
          activeOpacity={1}
          onPress={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          delayPressIn={0}
          delayPressOut={0}
        >
          {/* Header with close button and user profile */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerSpacer} />
              <Text style={styles.headerTitle}>Menu</Text>
              <View style={styles.headerSpacer} />
            </View>
            
            <TouchableOpacity onPress={onProfilePress} style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {user?.profileImage ? (
                  <Image 
                    source={{ uri: user.profileImage }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                <Text style={styles.userPhone}>{user?.phone || '+91 00000 00000'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                <View style={styles.userStatus}>
                  <Text style={styles.userStatusText}>Free User</Text>
                </View>
              </View>
              <Text style={styles.profileArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Menu items */}
          <ScrollView style={styles.menuContainer}>
            {/* Main Cricket Features */}
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                {item.badge && (
                  <View style={[
                    styles.badge,
                    { backgroundColor: item.badgeColor }
                  ]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* App & Social Features */}
            {additionalMenuItems.slice(0, 4).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Social Media Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More</Text>
            </View>
            {additionalMenuItems.slice(4, 8).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Support & Legal */}
            {additionalMenuItems.slice(8).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>
            
            {/* Close Icon Button */}
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeIconButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawer: {
    width: '80%',
    backgroundColor: COLORS.white,
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  closeIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.md,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeIconText: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.xs,
  },
  profileImageContainer: {
    marginRight: SIZES.md,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 24,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  userStatus: {
    alignSelf: 'flex-start',
  },
  userStatusText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  profileArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SIZES.md,
    width: 24,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  footer: {
    padding: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  logoutButton: {
    paddingVertical: SIZES.sm,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.sm,
  },
  sectionHeader: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
});

export default SideDrawer;
