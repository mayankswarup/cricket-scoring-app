import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { liveScoringService } from '../services/liveScoringService';

interface TeamCreationFormProps {
  onTeamCreated: (team: { name: string; shortName: string; city: string }) => void;
  onCancel: () => void;
  existingTeams?: Array<{ name: string; shortName: string; city: string }>;
}

const TeamCreationForm: React.FC<TeamCreationFormProps> = ({ onTeamCreated, onCancel, existingTeams = [] }) => {
  // Ensure existingTeams is always an array
  const safeExistingTeams = existingTeams || [];
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    city: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Validation functions
  const validateTeamName = (name: string) => {
    if (!name.trim()) {
      return 'Team name is required';
    }
    const existingTeam = safeExistingTeams.find(team => 
      team?.name?.toLowerCase() === name.toLowerCase().trim()
    );
    if (existingTeam) {
      return 'Team name already exists';
    }
    return '';
  };

  const validateShortName = (shortName: string) => {
    if (!shortName.trim()) {
      return 'Short name is required';
    }
    if (shortName.length > 4) {
      return 'Short name should be maximum 4 characters';
    }
    const existingTeam = safeExistingTeams.find(team => 
      team?.shortName?.toLowerCase() === shortName.toLowerCase().trim()
    );
    if (existingTeam) {
      return 'Short name already exists';
    }
    return '';
  };

  const validateCity = (city: string) => {
    if (!city.trim()) {
      return 'City is required';
    }
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [field]: ''
    }));

    // Auto-generate short name from team name
    if (field === 'name' && value.length > 0) {
      const autoShortName = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 4); // Max 4 characters
      
      setFormData(prev => ({
        ...prev,
        shortName: autoShortName
      }));
    }
  };

  const handleCreateTeam = async () => {
    // Validate all fields
    const nameError = validateTeamName(formData.name);
    const shortNameError = validateShortName(formData.shortName);
    const cityError = validateCity(formData.city);

    const errors = {
      name: nameError,
      shortName: shortNameError,
      city: cityError
    };

    setValidationErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Create team in Firebase
      const teamId = await liveScoringService.createTeam({
        name: formData.name.trim(),
        shortName: formData.shortName.trim().toUpperCase(),
        city: formData.city.trim(),
        createdBy: 'current-user-phone' // This should come from user context
      });
      
      console.log('✅ Team created successfully with ID:', teamId);
      
      onTeamCreated({
        name: formData.name.trim(),
        shortName: formData.shortName.trim().toUpperCase(),
        city: formData.city.trim()
      });
      
    } catch (error) {
      console.error('❌ Error creating team:', error);
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Team</Text>
          <Text style={styles.subtitle}>Fill in the details to create your team</Text>
        </View>

        <View style={styles.form}>
          {/* Team Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Team Name *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.name && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="e.g., Mumbai Indians"
              placeholderTextColor={COLORS.textSecondary}
              maxLength={50}
            />
            {validationErrors.name ? (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            ) : null}
          </View>

          {/* Short Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Short Name *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.shortName && styles.inputError
              ]}
              value={formData.shortName}
              onChangeText={(value) => handleInputChange('shortName', value.toUpperCase())}
              placeholder="e.g., MI"
              placeholderTextColor={COLORS.textSecondary}
              maxLength={4}
              autoCapitalize="characters"
            />
            {validationErrors.shortName ? (
              <Text style={styles.errorText}>{validationErrors.shortName}</Text>
            ) : (
              <Text style={styles.helpText}>Auto-generated from team name. Max 4 characters.</Text>
            )}
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.city && styles.inputError
              ]}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="e.g., Mumbai"
              placeholderTextColor={COLORS.textSecondary}
              maxLength={30}
            />
            {validationErrors.city ? (
              <Text style={styles.errorText}>{validationErrors.city}</Text>
            ) : null}
          </View>

          {/* Preview */}
          {formData.name && formData.shortName && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Team Preview:</Text>
              <View style={styles.previewCard}>
                <Text style={styles.previewTeamName}>{formData.name}</Text>
                <Text style={styles.previewShortName}>({formData.shortName})</Text>
                <Text style={styles.previewCity}>📍 {formData.city}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.disabledButton]}
          onPress={handleCreateTeam}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Team'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  header: {
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  form: {
    gap: SIZES.lg,
  },
  inputGroup: {
    gap: SIZES.sm,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  helpText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  preview: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  previewCard: {
    alignItems: 'center',
    gap: SIZES.xs,
  },
  previewTeamName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  previewShortName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  previewCity: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    padding: SIZES.lg,
    gap: SIZES.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  createButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Error Styles
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
});

export default TeamCreationForm;
