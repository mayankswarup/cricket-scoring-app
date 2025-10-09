import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { liveScoringService } from '../services/liveScoringService';
import { useUser } from '../contexts/UserContext';

interface AdminManagementProps {
  teamId: string;
  teamName: string;
  onClose: () => void;
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  teamId,
  teamName,
  onClose,
}) => {
  const { user } = useUser();
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const teamAdmins = await liveScoringService.getTeamAdmins(teamId);
      setAdmins(teamAdmins);
    } catch (error) {
      console.error('Error loading admins:', error);
      Alert.alert('Error', 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminPhone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (newAdminPhone === user?.phoneNumber) {
      Alert.alert('Error', 'You are already an admin');
      return;
    }

    try {
      const success = await liveScoringService.addTeamAdmin(teamId, newAdminPhone);
      if (success) {
        setNewAdminPhone('');
        await loadAdmins();
        Alert.alert('Success', `Added ${newAdminPhone} as admin`);
      } else {
        Alert.alert('Error', 'Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      Alert.alert('Error', 'Failed to add admin');
    }
  };

  const removeAdmin = async (adminPhone: string) => {
    if (adminPhone === user?.phoneNumber) {
      Alert.alert('Error', 'You cannot remove yourself as admin');
      return;
    }

    Alert.alert(
      'Remove Admin',
      `Are you sure you want to remove ${adminPhone} as admin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await liveScoringService.removeTeamAdmin(teamId, adminPhone);
              if (success) {
                await loadAdmins();
                Alert.alert('Success', `Removed ${adminPhone} as admin`);
              } else {
                Alert.alert('Error', 'Failed to remove admin');
              }
            } catch (error) {
              console.error('Error removing admin:', error);
              Alert.alert('Error', 'Failed to remove admin');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading admins...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Admins</Text>
        <Text style={styles.teamName}>{teamName}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Admin */}
      <View style={styles.addAdminSection}>
        <Text style={styles.sectionTitle}>Add New Admin</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number (e.g., 9019078195)"
            value={newAdminPhone}
            onChangeText={setNewAdminPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAdmin}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Admins */}
      <View style={styles.adminsSection}>
        <Text style={styles.sectionTitle}>Current Admins ({admins.length})</Text>
        {admins.length === 0 ? (
          <Text style={styles.noAdminsText}>No admins found</Text>
        ) : (
          admins.map((adminPhone, index) => (
            <View key={index} style={styles.adminItem}>
              <View style={styles.adminInfo}>
                <Text style={styles.adminPhone}>{adminPhone}</Text>
                {adminPhone === user?.phoneNumber && (
                  <Text style={styles.youText}>(You)</Text>
                )}
              </View>
              {adminPhone !== user?.phoneNumber && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeAdmin(adminPhone)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Admin Rights</Text>
        <Text style={styles.infoText}>
          • Admins can start matches, score runs, and manage the team
        </Text>
        <Text style={styles.infoText}>
          • Non-admins can only view live scores and match history
        </Text>
        <Text style={styles.infoText}>
          • Team creator is automatically an admin
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  teamName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  closeButton: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    padding: SIZES.sm,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.gray,
  },
  addAdminSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginRight: SIZES.sm,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  adminsSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  noAdminsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SIZES.lg,
  },
  adminItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  adminInfo: {
    flex: 1,
  },
  adminPhone: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  youText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: SIZES.xs,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    margin: SIZES.md,
    borderRadius: SIZES.radius,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SIZES.lg,
  },
});

export default AdminManagement;
