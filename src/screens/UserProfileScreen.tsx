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
import { useUser } from '../contexts/UserContext';
import { userProfileService, UserProfile } from '../services/userProfileService';

interface UserProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onProfileUpdated?: () => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onBack, onLogout, onProfileUpdated }) => {
  const { user, updateUserProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form state - using new profile structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    playingRole: null as 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper' | null,
    battingHand: null as 'left' | 'right' | null,
    bowlingStyle: null as 'fast' | 'medium' | 'spin' | null,
    jerseyNumber: null as number | null,
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

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
      
      if (user && user.profile) {
        console.log('✅ User profile found in context:', user.profile);
        setFormData({
          name: user.profile.name || user.name || '',
          email: user.profile.email || '',
          dateOfBirth: user.profile.dateOfBirth || '',
          playingRole: user.profile.playingRole || null,
          battingHand: user.profile.battingHand || null,
          bowlingStyle: user.profile.bowlingStyle || null,
          jerseyNumber: user.profile.jerseyNumber || null,
        });
        setProfileImage(user.profile.profilePicture || null);
      } else if (user) {
        console.log('🔄 Loading profile from Firebase...');
        // Load from userProfileService if profile not loaded in context
        const profile = await userProfileService.getUserProfile(user.phoneNumber);
        if (profile) {
          console.log('✅ Profile loaded from Firebase:', profile);
          setFormData({
            name: profile.name || user.name || '',
            email: profile.email || '',
            dateOfBirth: profile.dateOfBirth || '',
            playingRole: profile.playingRole || null,
            battingHand: profile.battingHand || null,
            bowlingStyle: profile.bowlingStyle || null,
            jerseyNumber: profile.jerseyNumber || null,
          });
          setProfileImage(profile.profilePicture || null);
        } else {
          // No profile exists yet, use basic user data
          console.log('📝 No profile found, using basic user data');
          setFormData({
            name: user.name || `User ${user.phoneNumber}`,
            email: '',
            dateOfBirth: '',
            playingRole: null,
            battingHand: null,
            bowlingStyle: null,
            jerseyNumber: null,
          });
          setProfileImage(null);
        }
      } else {
        console.log('❌ No user found in context');
        // Set default values even without user
        setFormData({
          name: '',
          email: '',
          dateOfBirth: '',
          playingRole: null,
          battingHand: null,
          bowlingStyle: null,
          jerseyNumber: null,
        });
        setProfileImage(null);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Name is required
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Email validation (optional but if provided, must be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Jersey number validation (optional but if provided, must be positive)
    if (formData.jerseyNumber && (formData.jerseyNumber < 1 || formData.jerseyNumber > 999)) {
      errors.jerseyNumber = 'Jersey number must be between 1 and 999';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Saving profile data:', formData);

      // Prepare profile data for update
      const profileUpdateData: Partial<UserProfile> = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        playingRole: formData.playingRole,
        battingHand: formData.battingHand,
        bowlingStyle: formData.bowlingStyle,
        jerseyNumber: formData.jerseyNumber,
        profilePicture: profileImage,
        hasCompletedProfile: true,
      };

      console.log('💾 Profile update data:', profileUpdateData);
      console.log('🖼️ Profile image to save:', profileImage);

      // Update profile using UserContext
      await updateUserProfile(profileUpdateData);
      
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setValidationErrors({});
    loadUserProfile(); // Reload original data
  };

  const handleEdit = () => {
    setEditing(true);
    setValidationErrors({});
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]
    );
  };

  const handleImagePicker = async () => {
    try {
      console.log('📸 Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('✅ Image selected:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
        console.log('🖼️ Profile image state updated');
      } else {
        console.log('❌ Image selection canceled');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const getErrorMessage = (field: string): string => {
    return validationErrors[field] || '';
  };

  const hasError = (field: string): boolean => {
    return !!validationErrors[field];
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
      <ScrollView style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          {!editing ? (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editButton} />
          )}
        </View>

        <View style={styles.profileContent}>
          {/* Profile Picture */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <View style={styles.imageContainer}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profileImage}
                  onError={(error) => {
                    console.log('❌ Image failed to load:', error);
                    setProfileImage(null); // Reset to placeholder if image fails
                  }}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {formData.name && formData.name !== 'Loading...' ? formData.name.charAt(0).toUpperCase() : '👤'}
                  </Text>
                </View>
              )}
              {editing && (
                <TouchableOpacity onPress={handleImagePicker} style={styles.changeImageButton}>
                  <Text style={styles.changeImageText}>📷 Change</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  !editing && styles.inputDisabled,
                  hasError('name') && styles.inputError
                ]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={editing}
                placeholder="Enter your name"
              />
              {hasError('name') && (
                <Text style={styles.errorText}>{getErrorMessage('name')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Optional)</Text>
              <TextInput
                style={[
                  styles.input, 
                  !editing && styles.inputDisabled,
                  hasError('email') && styles.inputError
                ]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                editable={editing}
                placeholder="Enter your email (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {hasError('email') && (
                <Text style={styles.errorText}>{getErrorMessage('email')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.phoneNumber ? `+91 ${user.phoneNumber}` : 'Not available'}
                editable={false}
                placeholder="Phone number from login"
              />
              <Text style={styles.helpText}>Phone number cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth (Optional)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                editable={editing}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {/* Cricket Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cricket Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Playing Role (Optional)</Text>
              <View style={styles.roleContainer}>
                {['batsman', 'bowler', 'all-rounder', 'wicket-keeper'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.playingRole === role && styles.roleButtonActive,
                      !editing && styles.roleButtonDisabled
                    ]}
                    onPress={() => editing && setFormData({ ...formData, playingRole: role as any })}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.playingRole === role && styles.roleButtonTextActive,
                      !editing && styles.roleButtonTextDisabled
                    ]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Batting Hand (Optional)</Text>
              <View style={styles.roleContainer}>
                {['left', 'right'].map((hand) => (
                  <TouchableOpacity
                    key={hand}
                    style={[
                      styles.roleButton,
                      formData.battingHand === hand && styles.roleButtonActive,
                      !editing && styles.roleButtonDisabled
                    ]}
                    onPress={() => editing && setFormData({ ...formData, battingHand: hand as any })}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.battingHand === hand && styles.roleButtonTextActive,
                      !editing && styles.roleButtonTextDisabled
                    ]}>
                      {hand.charAt(0).toUpperCase() + hand.slice(1)}-handed
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bowling Style (Optional)</Text>
              <View style={styles.roleContainer}>
                {['fast', 'medium', 'spin'].map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.roleButton,
                      formData.bowlingStyle === style && styles.roleButtonActive,
                      !editing && styles.roleButtonDisabled
                    ]}
                    onPress={() => editing && setFormData({ ...formData, bowlingStyle: style as any })}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.bowlingStyle === style && styles.roleButtonTextActive,
                      !editing && styles.roleButtonTextDisabled
                    ]}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jersey Number (Optional)</Text>
              <TextInput
                style={[
                  styles.input, 
                  !editing && styles.inputDisabled,
                  hasError('jerseyNumber') && styles.inputError
                ]}
                value={formData.jerseyNumber ? formData.jerseyNumber.toString() : ''}
                onChangeText={(text) => {
                  const num = text ? parseInt(text) : null;
                  setFormData({ ...formData, jerseyNumber: num });
                }}
                editable={editing}
                placeholder="Enter jersey number (1-999)"
                keyboardType="numeric"
              />
              {hasError('jerseyNumber') && (
                <Text style={styles.errorText}>{getErrorMessage('jerseyNumber')}</Text>
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    fontFamily: FONTS.regular,
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
    minWidth: 50,
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
    fontSize: SIZES.h2, // Increased from SIZES.h3 (16) to SIZES.h2 (18)
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.h3, // Increased from SIZES.font (14) to SIZES.h3 (16)
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  required: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    fontSize: SIZES.h3, // Increased from SIZES.font (14) to SIZES.h3 (16)
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.gray,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.font, // Increased from SIZES.sm (8) to SIZES.font (14)
    fontFamily: FONTS.regular,
    marginTop: SIZES.xs,
  },
  helpText: {
    color: COLORS.gray,
    fontSize: SIZES.font, // Increased from SIZES.sm (8) to SIZES.font (14)
    fontFamily: FONTS.regular,
    marginTop: SIZES.xs,
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
    borderColor: COLORS.lightGray,
  },
  roleButtonText: {
    fontSize: SIZES.font, // Increased from SIZES.sm (8) to SIZES.font (14)
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  roleButtonTextDisabled: {
    color: COLORS.gray,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SIZES.sm,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileImageText: {
    fontSize: SIZES.h2,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  changeImageButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  changeImageText: {
    color: COLORS.white,
    fontSize: SIZES.font, // Increased from SIZES.sm (8) to SIZES.font (14)
    fontFamily: FONTS.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.xl,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  logoutButton: {
    flex: 1,
  },
});

export default UserProfileScreen;