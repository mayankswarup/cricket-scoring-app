import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationTestScreenProps {
  onBack: () => void;
}

const NotificationTestScreen: React.FC<NotificationTestScreenProps> = ({ onBack }) => {
  const {
    permissionGranted,
    isLoading,
    showNotification,
    scheduleNotification,
    notifyWicket,
    notifyBoundary,
    notifyOverComplete,
    notifyMilestone,
    notifyInningsComplete,
    notifyMatchStart,
    notifyMatchResult,
  } = useNotifications();

  const handleTestBasicNotification = async () => {
    console.log('🔔 Test button pressed!');
    console.log('Permission granted:', permissionGranted);
    try {
      await showNotification(
        '🏏 Cricket App',
        'This is a test notification!',
        { test: true }
      );
      console.log('✅ Notification sent successfully!');
      Alert.alert('Notification Sent', 'Check your notification center!');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      Alert.alert('Error', `Failed to send notification: ${error}`);
    }
  };

  const handleTestWicket = async () => {
    await notifyWicket('Virat Kohli', 75, 48);
  };

  const handleTestFour = async () => {
    await notifyBoundary('Rohit Sharma', 4, true);
  };

  const handleTestSix = async () => {
    await notifyBoundary('MS Dhoni', 6, true);
  };

  const handleTestOverComplete = async () => {
    await notifyOverComplete(12, 15, 1);
  };

  const handleTestMilestone = async () => {
    await notifyMilestone('Virat Kohli', 50);
  };

  const handleTestCentury = async () => {
    await notifyMilestone('Rohit Sharma', 100);
  };

  const handleTestInningsComplete = async () => {
    await notifyInningsComplete('Mumbai Indians', 189, 5, 20);
  };

  const handleTestMatchStart = async () => {
    await notifyMatchStart('Mumbai Indians', 'Chennai Super Kings');
  };

  const handleTestMatchResult = async () => {
    await notifyMatchResult('Mumbai Indians', '23 runs');
  };

  const handleScheduleNotification = async () => {
    await scheduleNotification(
      '⏰ Scheduled Notification',
      'This notification was scheduled 5 seconds ago!',
      5,
      { scheduled: true }
    );
    Alert.alert('Scheduled', 'Notification will appear in 5 seconds!');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Setting up notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permissionGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>❌ Notification permission denied</Text>
          <Text style={styles.errorSubtext}>
            Please enable notifications in your device settings
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={onBack}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Permissions Granted!</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any button below to test notifications
          </Text>
        </View>

        {/* Basic Notifications */}
        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Basic Notifications</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestBasicNotification}
          >
            <Text style={styles.testButtonText}>🔔 Test Basic Notification</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleScheduleNotification}
          >
            <Text style={styles.testButtonText}>⏰ Schedule Notification (5s)</Text>
          </TouchableOpacity>
        </View>

        {/* Cricket Events */}
        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Cricket Events</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestWicket}>
            <Text style={styles.testButtonText}>🏏 Wicket Notification</Text>
            <Text style={styles.testButtonSubtext}>Virat Kohli out for 75 (48)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestFour}>
            <Text style={styles.testButtonText}>⚡ Four Notification</Text>
            <Text style={styles.testButtonSubtext}>Rohit Sharma hits a FOUR!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestSix}>
            <Text style={styles.testButtonText}>🚀 Six Notification</Text>
            <Text style={styles.testButtonSubtext}>MS Dhoni hits a SIX!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestOverComplete}>
            <Text style={styles.testButtonText}>✅ Over Complete</Text>
            <Text style={styles.testButtonSubtext}>Over 12: 15 runs, 1 wicket</Text>
          </TouchableOpacity>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Milestones</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestMilestone}>
            <Text style={styles.testButtonText}>🎯 Fifty Notification</Text>
            <Text style={styles.testButtonSubtext}>Virat Kohli reaches 50!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestCentury}>
            <Text style={styles.testButtonText}>💯 Century Notification</Text>
            <Text style={styles.testButtonSubtext}>Rohit Sharma reaches 100!</Text>
          </TouchableOpacity>
        </View>

        {/* Match Events */}
        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Match Events</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestMatchStart}>
            <Text style={styles.testButtonText}>🏏 Match Starting</Text>
            <Text style={styles.testButtonSubtext}>MI vs CSK</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestInningsComplete}>
            <Text style={styles.testButtonText}>🏁 Innings Complete</Text>
            <Text style={styles.testButtonSubtext}>MI: 189/5 in 20 overs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestMatchResult}>
            <Text style={styles.testButtonText}>🏆 Match Result</Text>
            <Text style={styles.testButtonSubtext}>MI wins by 23 runs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerBackButton: {
    padding: SIZES.sm,
  },
  headerBackText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  errorText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.error,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  section: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.success,
    marginBottom: SIZES.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  testButton: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  testButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  testButtonSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  bottomSpace: {
    height: SIZES.xl,
  },
});

export default NotificationTestScreen;

