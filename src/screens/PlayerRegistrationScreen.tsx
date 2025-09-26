import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import { PlayerRegistration } from '../types';

interface PlayerRegistrationScreenProps {
  onRegistrationComplete: (player: PlayerRegistration) => void;
  onBack: () => void;
}

const PlayerRegistrationScreen: React.FC<PlayerRegistrationScreenProps> = ({
  onRegistrationComplete,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    preferredRole: 'batsman' as 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper',
    battingStyle: 'right-handed' as 'right-handed' | 'left-handed',
    bowlingStyle: 'right-arm fast' as 'right-arm fast' | 'left-arm fast' | 'right-arm spin' | 'left-arm spin',
    experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'professional',
    location: '',
  });

  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'phone'>('email');

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (registrationMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistration = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPlayer: PlayerRegistration = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password, // In real app, hash this
        dateOfBirth: formData.dateOfBirth,
        preferredRole: formData.preferredRole,
        battingStyle: formData.battingStyle,
        bowlingStyle: formData.preferredRole !== 'batsman' ? formData.bowlingStyle : undefined,
        experience: formData.experience,
        location: formData.location.trim(),
        availability: [],
        stats: {
          matches: 0,
          runs: 0,
          wickets: 0,
          average: 0,
          strikeRate: 0,
        },
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      onRegistrationComplete(newPlayer);
      Alert.alert('Success', 'Registration completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'batsman': return '🏏';
      case 'bowler': return '⚾';
      case 'all-rounder': return '🔄';
      case 'wicket-keeper': return '🧤';
      default: return '👤';
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#2196F3';
      case 'professional': return '#9C27B0';
      default: return COLORS.textSecondary;
    }
  };

  const renderInput = (label: string, value: string, onChange: (value: string) => void, error?: string, placeholder?: string, secureText?: boolean) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, error && styles.errorInput]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        secureTextEntry={secureText}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderRoleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Preferred Role</Text>
      <View style={styles.roleOptions}>
        {(['batsman', 'bowler', 'all-rounder', 'wicket-keeper'] as const).map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleOption,
              formData.preferredRole === role && styles.selectedRoleOption,
            ]}
            onPress={() => setFormData(prev => ({ ...prev, preferredRole: role }))}
          >
            <Text style={styles.roleIcon}>{getRoleIcon(role)}</Text>
            <Text style={[
              styles.roleText,
              formData.preferredRole === role && styles.selectedRoleText,
            ]}>
              {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExperienceSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Experience Level</Text>
      <View style={styles.experienceOptions}>
        {(['beginner', 'intermediate', 'advanced', 'professional'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.experienceOption,
              formData.experience === level && styles.selectedExperienceOption,
            ]}
            onPress={() => setFormData(prev => ({ ...prev, experience: level }))}
          >
            <Text style={[
              styles.experienceText,
              formData.experience === level && styles.selectedExperienceText,
            ]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏏 Player Registration</Text>
          <Text style={styles.subtitle}>Join the cricket community and start playing!</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {renderInput(
            'Full Name',
            formData.name,
            (value) => setFormData(prev => ({ ...prev, name: value })),
            errors.name,
            'Enter your full name'
          )}

          {/* Registration Method Selection */}
          <View style={styles.registrationMethodContainer}>
            <Text style={styles.registrationMethodLabel}>Register with:</Text>
            <View style={styles.registrationMethodOptions}>
              <TouchableOpacity
                style={[
                  styles.registrationMethodOption,
                  registrationMethod === 'email' && styles.selectedRegistrationMethod,
                ]}
                onPress={() => setRegistrationMethod('email')}
              >
                <Text style={[
                  styles.registrationMethodText,
                  registrationMethod === 'email' && styles.selectedRegistrationMethodText,
                ]}>
                  📧 Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.registrationMethodOption,
                  registrationMethod === 'phone' && styles.selectedRegistrationMethod,
                ]}
                onPress={() => setRegistrationMethod('phone')}
              >
                <Text style={[
                  styles.registrationMethodText,
                  registrationMethod === 'phone' && styles.selectedRegistrationMethodText,
                ]}>
                  📱 Phone
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {registrationMethod === 'email' ? (
            renderInput(
              'Email',
              formData.email,
              (value) => setFormData(prev => ({ ...prev, email: value })),
              errors.email,
              'Enter your email address'
            )
          ) : (
            renderInput(
              'Phone Number',
              formData.phone,
              (value) => setFormData(prev => ({ ...prev, phone: value })),
              errors.phone,
              'Enter your phone number'
            )
          )}

          {renderInput(
            'Date of Birth',
            formData.dateOfBirth,
            (value) => setFormData(prev => ({ ...prev, dateOfBirth: value })),
            errors.dateOfBirth,
            'YYYY-MM-DD'
          )}

          {renderInput(
            'Location',
            formData.location,
            (value) => setFormData(prev => ({ ...prev, location: value })),
            errors.location,
            'Enter your city/location'
          )}
        </View>

        {/* Cricket Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cricket Information</Text>
          
          {renderRoleSelector()}

          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Batting Style</Text>
            <View style={styles.styleOptions}>
              {(['right-handed', 'left-handed'] as const).map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.styleOption,
                    formData.battingStyle === style && styles.selectedStyleOption,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, battingStyle: style }))}
                >
                  <Text style={[
                    styles.styleText,
                    formData.battingStyle === style && styles.selectedStyleText,
                  ]}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.preferredRole !== 'batsman' && (
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Bowling Style</Text>
              <View style={styles.styleOptions}>
                {(['right-arm fast', 'left-arm fast', 'right-arm spin', 'left-arm spin'] as const).map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.styleOption,
                      formData.bowlingStyle === style && styles.selectedStyleOption,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, bowlingStyle: style }))}
                  >
                    <Text style={[
                      styles.styleText,
                      formData.bowlingStyle === style && styles.selectedStyleText,
                    ]}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {renderExperienceSelector()}
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          {renderInput(
            'Password',
            formData.password,
            (value) => setFormData(prev => ({ ...prev, password: value })),
            errors.password,
            'Create a strong password',
            true
          )}

          {renderInput(
            'Confirm Password',
            formData.confirmPassword,
            (value) => setFormData(prev => ({ ...prev, confirmPassword: value })),
            errors.confirmPassword,
            'Confirm your password',
            true
          )}
        </View>

        {/* Player Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewName}>
                {getRoleIcon(formData.preferredRole)} {formData.name || 'New Player'}
              </Text>
              <View style={[
                styles.experienceBadge,
                { backgroundColor: getExperienceColor(formData.experience) }
              ]}>
                <Text style={styles.experienceBadgeText}>
                  {formData.experience.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.previewDetails}>
              {formData.preferredRole.toUpperCase()} • {formData.battingStyle}
              {formData.preferredRole !== 'batsman' && ` • ${formData.bowlingStyle}`}
            </Text>
            <Text style={styles.previewLocation}>📍 {formData.location}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onBack}
            variant="outline"
            size="large"
            style={styles.cancelButton}
          />
          <Button
            title={isLoading ? "Registering..." : "Register Player"}
            onPress={handleRegistration}
            size="large"
            style={styles.registerButton}
            disabled={isLoading}
          />
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
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    marginTop: SIZES.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: SIZES.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  inputContainer: {
    marginBottom: SIZES.md,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.sm,
    padding: SIZES.md,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: SIZES.xs,
  },
  selectorContainer: {
    marginBottom: SIZES.lg,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  roleOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedRoleOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: SIZES.xs,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedRoleText: {
    color: COLORS.primary,
  },
  styleOptions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  styleOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedStyleOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  styleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedStyleText: {
    color: COLORS.primary,
  },
  experienceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  experienceOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedExperienceOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  experienceText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedExperienceText: {
    color: COLORS.primary,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  previewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  experienceBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  experienceBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  previewLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actions: {
    gap: SIZES.md,
    marginTop: SIZES.xl,
  },
  cancelButton: {
    marginBottom: SIZES.sm,
  },
  registerButton: {
    marginBottom: SIZES.sm,
  },
  registrationMethodContainer: {
    marginBottom: SIZES.lg,
  },
  registrationMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  registrationMethodOptions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  registrationMethodOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedRegistrationMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  registrationMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedRegistrationMethodText: {
    color: COLORS.primary,
  },
});

export default PlayerRegistrationScreen;
