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
import { imageUploadService } from '../services/imageUploadService';

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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [userTeams, setUserTeams] = useState<{ teamId: string; teamName: string; joinedAt: string }[]>([]);

  // Form state - using new profile structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
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

  useEffect(() => {
    if (user) {
      loadUserTeams();
    }
  }, [user]);

  const loadUserTeams = async () => {
    if (!user) return;
    
    try {
      const teams = await userProfileService.getUserTeams(user.phoneNumber);
      setUserTeams(teams);
    } catch (error) {
      console.error('❌ Failed to load user teams:', error);
      setUserTeams([]);
    }
  };

  // Debug log to see current formData values (only in development)
  useEffect(() => {
    if (__DEV__) {
      console.log('🔍 Current formData values:', formData);
    }
  }, [formData]);


  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload profile pictures.');
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      if (user && user.profile) {
        const formDataToSet = {
          name: user.profile.name || user.name || '',
          email: user.profile.email || '',
          phoneNumber: user.phoneNumber || '',
          dateOfBirth: user.profile.dateOfBirth || '',
          playingRole: user.profile.playingRole || null,
          battingHand: user.profile.battingHand || null,
          bowlingStyle: user.profile.bowlingStyle || null,
          jerseyNumber: user.profile.jerseyNumber || null,
        };
        setFormData(formDataToSet);
        // Load profile image from Firebase Storage if available
        if (user.profile.profilePicture) {
          setProfileImage(user.profile.profilePicture);
        } else {
          // Try to get image from Firebase Storage
          try {
            const imageURL = await imageUploadService.getProfilePictureURL(user.phoneNumber);
            setProfileImage(imageURL);
          } catch (error) {
            setProfileImage(null);
          }
        }
      } else if (user) {
        // Load from userProfileService if profile not loaded in context
        const profile = await userProfileService.getUserProfile(user.phoneNumber);
        if (profile) {
          const formDataToSet = {
            name: profile.name || user.name || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || user.phoneNumber || '',
            dateOfBirth: profile.dateOfBirth || '',
            playingRole: profile.playingRole || null,
            battingHand: profile.battingHand || null,
            bowlingStyle: profile.bowlingStyle || null,
            jerseyNumber: profile.jerseyNumber || null,
          };
          setFormData(formDataToSet);
          // Load profile image from Firebase Storage if available
          if (profile.profilePicture) {
            setProfileImage(profile.profilePicture);
          } else {
            // Try to get image from Firebase Storage
            try {
              const imageURL = await imageUploadService.getProfilePictureURL(user.phoneNumber);
              setProfileImage(imageURL);
            } catch (error) {
              setProfileImage(null);
            }
          }
        } else {
          // No profile exists yet, use basic user data
          setFormData({
            name: user.name || `User ${user.phoneNumber}`,
            email: '',
            phoneNumber: user.phoneNumber || '',
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
          phoneNumber: '',
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
    
    // Phone number validation (required)
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\+91\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be in format +91xxxxxxxxxx';
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

      // Prepare profile data for update (don't include phoneNumber as it's the document ID)
      const profileUpdateData: Partial<UserProfile> = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        playingRole: formData.playingRole,
        battingHand: formData.battingHand,
        bowlingStyle: formData.bowlingStyle,
        jerseyNumber: formData.jerseyNumber,
        profilePicture: profileImage, // This will be the Firebase Storage URL
        hasCompletedProfile: true,
      };

      // Update profile using UserContext
      await updateUserProfile(profileUpdateData);
      
      setEditing(false);
      
      // Refresh team data after profile update
      await loadUserTeams();
      
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        
        // Show loading state
        setLoading(true);
        
        try {
          // Upload image to Firebase Storage
          const downloadURL = await imageUploadService.uploadProfilePicture(
            user?.phoneNumber || 'unknown',
            result.assets[0].uri
          );
          
          setProfileImage(downloadURL);
          
        } catch (uploadError) {
          console.error('❌ Failed to upload image:', uploadError);
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    // For web, use confirm instead of Alert.alert
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm('Are you sure you want to remove your profile picture?');
      if (!confirmed) {
        return;
      }
    } else {
      // Fallback to Alert.alert for mobile
      Alert.alert(
        'Remove Profile Picture',
        'Are you sure you want to remove your profile picture?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive', 
            onPress: () => removeImageFromProfile()
          }
        ]
      );
      return;
    }
    
    // If we reach here, user confirmed on web
    removeImageFromProfile();
  };

  const removeImageFromProfile = async () => {
    try {
      setLoading(true);
      
      // Remove from Firebase Storage (if not in development mode)
      if (process.env.NODE_ENV !== 'development' && window.location.hostname !== 'localhost') {
        await imageUploadService.deleteProfilePicture(user?.phoneNumber || '');
      }
      
      // Update profile in Firestore to remove image
      const profileUpdateData: Partial<UserProfile> = {
        profilePicture: null,
      };
      
      await updateUserProfile(profileUpdateData);
      
      // Update local state immediately
      setProfileImage(null);
      
    } catch (error) {
      console.error('❌ Failed to remove profile image:', error);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Failed to remove profile image. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to remove profile image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (field: string): string => {
    return validationErrors[field] || '';
  };

  const hasError = (field: string): boolean => {
    return !!validationErrors[field];
  };

  // Get initials from name for placeholder
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Get jersey number for display
  const getJerseyNumber = (): string | null => {
    return formData.jerseyNumber ? formData.jerseyNumber.toString() : null;
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
                <View style={styles.profileImageWrapper}>
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage}
                    onError={(error) => {
                      setProfileImage(null); // Reset to placeholder if image fails
                    }}
                  />
                  {editing && (
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={handleRemoveImage}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  {getJerseyNumber() ? (
                    <View style={styles.jerseyNumberContainer}>
                      <Text style={styles.jerseyNumberText}>{getJerseyNumber()}</Text>
                    </View>
                  ) : (
                    <Text style={styles.profileImageText}>
                      {formData.name && formData.name !== 'Loading...' ? getInitials(formData.name) : '👤'}
                    </Text>
                  )}
                </View>
              )}
              {editing && (
                <TouchableOpacity onPress={handleImagePicker} style={styles.changeImageButton}>
                  <Text style={styles.changeImageText}>
                    {profileImage ? '📷 Change' : '📷 Add Photo'}
                  </Text>
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
                style={[
                  styles.input, 
                  !editing && styles.inputDisabled,
                  hasError('phoneNumber') && styles.inputError
                ]}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                editable={editing}
                placeholder="+91xxxxxxxxxx"
                placeholderTextColor="#999999"
                keyboardType="phone-pad"
                maxLength={13}
              />
              {hasError('phoneNumber') && (
                <Text style={styles.errorText}>{getErrorMessage('phoneNumber')}</Text>
              )}
              <Text style={styles.helpText}>Enter your phone number with +91 prefix</Text>
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

          {/* My Teams */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Teams</Text>
            {userTeams.length > 0 ? (
              <View style={styles.teamsList}>
                {userTeams.map((team, index) => (
                  <View key={team.teamId} style={styles.teamItem}>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.teamName}</Text>
                      <Text style={styles.teamId}>ID: {team.teamId}</Text>
                      <Text style={styles.teamJoined}>Joined: {new Date(team.joinedAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.teamStatus}>
                      <Text style={styles.teamStatusText}>Active</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noTeamsContainer}>
                <Text style={styles.noTeamsText}>You are not in any teams yet</Text>
                <Text style={styles.noTeamsSubtext}>Join a team to start playing!</Text>
              </View>
            )}
          </View>

          {/* Cricket Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cricket Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Playing Role (Optional)</Text>
              {formData.playingRole && (
                <Text style={styles.selectedValueText}>Selected: {formData.playingRole}</Text>
              )}
              <View style={styles.roleContainer}>
                {['batsman', 'bowler', 'all-rounder', 'wicket-keeper'].map((role) => {
                  const isSelected = formData.playingRole === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        isSelected && styles.roleButtonActive,
                        !editing && !isSelected && styles.roleButtonDisabled
                      ]}
                      onPress={() => editing && setFormData({ ...formData, playingRole: role as any })}
                      disabled={!editing}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        isSelected && styles.roleButtonTextActive,
                        !editing && !isSelected && styles.roleButtonTextDisabled
                      ]}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Batting Hand (Optional)</Text>
              {formData.battingHand && (
                <Text style={styles.selectedValueText}>Selected: {formData.battingHand}-handed</Text>
              )}
              <View style={styles.roleContainer}>
                {['left', 'right'].map((hand) => {
                  const isSelected = formData.battingHand === hand;
                  return (
                    <TouchableOpacity
                      key={hand}
                      style={[
                        styles.roleButton,
                        isSelected && styles.roleButtonActive,
                        !editing && !isSelected && styles.roleButtonDisabled
                      ]}
                      onPress={() => editing && setFormData({ ...formData, battingHand: hand as any })}
                      disabled={!editing}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        isSelected && styles.roleButtonTextActive,
                        !editing && !isSelected && styles.roleButtonTextDisabled
                      ]}>
                        {hand.charAt(0).toUpperCase() + hand.slice(1)}-handed
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bowling Style (Optional)</Text>
              {formData.bowlingStyle && (
                <Text style={styles.selectedValueText}>Selected: {formData.bowlingStyle}</Text>
              )}
              <View style={styles.roleContainer}>
                {['fast', 'medium', 'spin'].map((style) => {
                  const isSelected = formData.bowlingStyle === style;
                  return (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.roleButton,
                        isSelected && styles.roleButtonActive,
                        !editing && !isSelected && styles.roleButtonDisabled
                      ]}
                      onPress={() => editing && setFormData({ ...formData, bowlingStyle: style as any })}
                      disabled={!editing}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        isSelected && styles.roleButtonTextActive,
                        !editing && !isSelected && styles.roleButtonTextDisabled
                      ]}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
  // Teams section styles
  teamsList: {
    marginTop: 8,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teamId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  teamJoined: {
    fontSize: 12,
    color: '#666',
  },
  teamStatus: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noTeamsContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
  },
  noTeamsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  noTeamsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  selectedValueText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    marginBottom: SIZES.xs,
    fontStyle: 'italic',
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
  profileImageWrapper: {
    position: 'relative',
    marginBottom: SIZES.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 10,
    // Web-specific styles
    cursor: 'pointer',
    userSelect: 'none',
    // Ensure it's clickable on web
    minWidth: 28,
    minHeight: 28,
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  jerseyNumberContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  jerseyNumberText: {
    fontSize: 32,
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