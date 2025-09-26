import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import { authService } from '../services/authService';
import { PlayerRegistration } from '../types';

interface UserProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onProfileUpdated?: () => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onBack, onLogout, onProfileUpdated }) => {
  const [user, setUser] = useState<PlayerRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    preferredRole: 'batsman' as 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper',
    dateOfBirth: '',
    battingStyle: 'right-handed' as 'right-handed' | 'left-handed',
    bowlingStyle: 'right-arm fast' as 'right-arm fast' | 'left-arm fast' | 'right-arm spin' | 'left-arm spin',
  });

  useEffect(() => {
    loadUserProfile();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload profile pictures.');
    }
  };

  const loadUserProfile = async () => {
    try {
      console.log('🔄 Loading user profile...');
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      console.log('👤 Current user from authService:', currentUser);
      
      if (currentUser) {
        console.log('✅ User found, setting form data');
        setUser(currentUser);
        const formDataToSet = {
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          location: currentUser.location,
          preferredRole: currentUser.preferredRole,
          dateOfBirth: currentUser.dateOfBirth,
          battingStyle: currentUser.battingStyle,
          bowlingStyle: currentUser.bowlingStyle || 'right-arm fast',
        };
        console.log('📝 Form data to set:', formDataToSet);
        setFormData(formDataToSet);

        // Load profile image if exists
        if (currentUser.profileImage) {
          setProfileImage(currentUser.profileImage);
          console.log('🖼️ Profile image loaded:', currentUser.profileImage.substring(0, 50) + '...');
        } else {
          setProfileImage(null);
          console.log('🖼️ No profile image found');
        }
      } else {
        console.log('❌ No user found in authService.getCurrentUser()');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      console.log('🏁 Loading completed');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('💾 handleSave called');
      console.log('📝 Current formData state:', formData);
      setSaving(true);
      console.log('🔄 Setting saving to true');
      
      // Validate required fields
      console.log('🔍 Validating form data:', { name: formData.name, email: formData.email });
      if (!formData.name.trim() || !formData.email.trim()) {
        console.log('❌ Validation failed - missing name or email');
        Alert.alert('Validation Error', 'Name and email are required');
        setSaving(false);
        return;
      }
      console.log('✅ Validation passed');

      console.log('📝 Form data:', formData);
      console.log('🖼️ Profile image:', profileImage ? 'Has image' : 'No image');

      // Update user profile
      const updatedUser = {
        ...user!,
        ...formData,
        profileImage: profileImage || undefined,
      };

      console.log('👤 Updated user:', { name: updatedUser.name, hasProfileImage: !!updatedUser.profileImage });

      // Update the user in Firebase
      console.log('🔄 Calling authService.updateUserProfile...');
      await authService.updateUserProfile(updatedUser);
      console.log('✅ authService.updateUserProfile completed');
      
      // Update local state
      console.log('🔄 Updating local state...');
      setUser(updatedUser);
      setEditing(false);
      console.log('✅ Local state updated');
      
      // Notify parent component that profile was updated
      if (onProfileUpdated) {
        console.log('📢 Notifying parent component...');
        onProfileUpdated();
        console.log('✅ Parent component notified');
      }
      
      console.log('🎉 Profile save completed successfully');
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      console.log('🏁 Setting saving to false');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        preferredRole: user.preferredRole || 'batsman',
        dateOfBirth: user.dateOfBirth || '',
        battingStyle: user.battingStyle || 'right-handed',
        bowlingStyle: user.bowlingStyle || 'right-arm fast',
      });
    }
    setEditing(false);
  };

  const handleEdit = () => {
    // Load current user data into form when editing starts
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        preferredRole: user.preferredRole || 'batsman',
        dateOfBirth: user.dateOfBirth || '',
        battingStyle: user.battingStyle || 'right-handed',
        bowlingStyle: user.bowlingStyle || 'right-arm fast',
      });
    }
    setEditing(true);
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // This will help with cross-platform compatibility
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const base64 = result.assets[0].base64;
        
        // Create a data URI that works across platforms
        const dataUri = `data:image/jpeg;base64,${base64}`;
        setProfileImage(dataUri);
        
        console.log('Image selected:', { uri: imageUri, base64: base64 ? 'present' : 'missing' });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDeleteImage = async () => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting profile image...');
              
              // Update user profile with undefined profileImage
              const updatedUser = {
                ...user!,
                profileImage: undefined,
              };
              
              console.log('🔄 Saving updated user to Firebase...');
              await authService.updateUserProfile(updatedUser);
              console.log('✅ Profile image deleted and saved to Firebase');
              
              // Update local state
              setUser(updatedUser);
              setProfileImage(null);
              
              // Notify parent component
              if (onProfileUpdated) {
                onProfileUpdated();
              }
              
              Alert.alert('Success', 'Profile picture deleted successfully!');
              
            } catch (error) {
              console.error('❌ Error deleting profile image:', error);
              Alert.alert('Error', 'Failed to delete profile image');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>👤 Profile</Text>
          {!editing && (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Content */}
        <View style={styles.profileContent}>
          {/* Profile Picture */}
          <View style={styles.profilePictureSection}>
            <TouchableOpacity 
              onPress={handleImagePicker} 
              style={styles.profilePictureContainer}
              disabled={!editing}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profilePicture}
                  onError={() => {
                    console.log('Image failed to load, falling back to placeholder');
                    setProfileImage(null);
                  }}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Text style={styles.profilePictureText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                  </Text>
                  <Text style={styles.profilePictureLabel}>
                    {editing ? 'Tap to add photo' : user?.name || 'No photo'}
                  </Text>
                </View>
              )}
              {editing && (
                <View style={styles.editOverlay}>
                  <Text style={styles.editOverlayText}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Delete Button - only show when editing and has image */}
            {editing && profileImage && (
              <TouchableOpacity 
                onPress={handleDeleteImage}
                style={styles.deleteImageButton}
              >
                <Text style={styles.deleteImageText}>🗑️ Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.name}
                onChangeText={(text) => {
                  console.log('📝 Name changed:', text);
                  setFormData({ ...formData, name: text });
                }}
                editable={editing}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.email}
                onChangeText={(text) => {
                  console.log('📧 Email changed:', text);
                  setFormData({ ...formData, email: text });
                }}
                editable={editing}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                editable={editing}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                editable={editing}
                placeholder="Enter your location"
              />
            </View>
          </View>

          {/* Cricket Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cricket Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Role</Text>
              <View style={styles.roleContainer}>
                {(['batsman', 'bowler', 'all-rounder', 'wicket-keeper'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.preferredRole === role && styles.roleButtonActive,
                      !editing && styles.roleButtonDisabled,
                    ]}
                    onPress={() => editing && setFormData({ ...formData, preferredRole: role })}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.preferredRole === role && styles.roleButtonTextActive,
                      !editing && styles.roleButtonTextDisabled,
                    ]}>
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                editable={editing}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Batting Style</Text>
              <View style={styles.styleContainer}>
                {(['right-handed', 'left-handed'] as const).map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.styleButton,
                      formData.battingStyle === style && styles.styleButtonActive,
                      !editing && styles.styleButtonDisabled,
                    ]}
                    onPress={() => editing && setFormData({ ...formData, battingStyle: style })}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.styleButtonText,
                      formData.battingStyle === style && styles.styleButtonTextActive,
                      !editing && styles.styleButtonTextDisabled,
                    ]}>
                      {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bowling Style</Text>
              <View style={styles.styleContainer}>
                {(['right-arm fast', 'left-arm fast', 'right-arm spin', 'left-arm spin'] as const).map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.styleButton,
                      formData.bowlingStyle === style && styles.styleButtonActive,
                      !editing && styles.styleButtonDisabled,
                    ]}
                    onPress={() => editing && setFormData({ ...formData, bowlingStyle: style })}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.styleButtonText,
                      formData.bowlingStyle === style && styles.styleButtonTextActive,
                      !editing && styles.styleButtonTextDisabled,
                    ]}>
                      {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {editing ? (
            <View style={styles.actionButtons}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                size="large"
                style={styles.cancelButton}
              />
              <Button
                title={saving ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                size="large"
                style={styles.saveButton}
                disabled={saving}
              />
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <Button
                title="🔐 Change Password"
                onPress={() => Alert.alert('Coming Soon', 'Password reset feature will be added soon!')}
                variant="outline"
                size="large"
                style={styles.secondaryButton}
              />
              <Button
                title="🚪 Logout"
                onPress={handleLogout}
                variant="outline"
                size="large"
                style={styles.logoutButton}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    flex: 1,
  },
  editButton: {
    padding: SIZES.sm,
  },
  editButtonText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  profileContent: {
    flex: 1,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.gray,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  roleButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  roleButtonText: {
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  roleButtonTextDisabled: {
    color: COLORS.gray,
  },
  styleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  styleButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  styleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  styleButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  styleButtonText: {
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  styleButtonTextActive: {
    color: COLORS.white,
  },
  styleButtonTextDisabled: {
    color: COLORS.gray,
  },
  actionButtons: {
    gap: SIZES.md,
    marginTop: SIZES.xl,
  },
  cancelButton: {
    borderColor: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
  },
  logoutButton: {
    borderColor: COLORS.error || '#ff4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  profilePictureContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profilePicture: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  profilePicturePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureText: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  profilePictureLabel: {
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    textAlign: 'center',
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlayText: {
    fontSize: 24,
    color: COLORS.white,
  },
  deleteImageButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
    alignSelf: 'center',
  },
  deleteImageText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
});

export default UserProfileScreen;
