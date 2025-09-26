import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import { TeamCreation, PlayerRegistration, TeamMembership } from '../types';

interface TeamCreationScreenProps {
  currentPlayer: PlayerRegistration;
  onTeamCreated: (team: TeamCreation) => void;
  onBack: () => void;
}

const TeamCreationScreen: React.FC<TeamCreationScreenProps> = ({
  currentPlayer,
  onTeamCreated,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    location: '',
    maxMembers: 25,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Short name is required';
    } else if (formData.shortName.length > 5) {
      newErrors.shortName = 'Short name must be 5 characters or less';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.maxMembers < 11) {
      newErrors.maxMembers = 'Team must have at least 11 members';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTeam = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newTeam: TeamCreation = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        shortName: formData.shortName.trim().toUpperCase(),
        logo: '🏏', // Default logo, can be customized later
        description: formData.description.trim(),
        location: formData.location.trim(),
        createdBy: currentPlayer.id,
        members: [
          {
            id: Date.now().toString() + '_1',
            playerId: currentPlayer.id,
            teamId: Date.now().toString(),
            role: 'captain',
            joinedAt: new Date().toISOString(),
            isActive: true,
          }
        ],
        maxMembers: formData.maxMembers,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      onTeamCreated(newTeam);
      Alert.alert('Success', 'Team created successfully! You are now the captain.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (label: string, value: string, onChange: (value: string) => void, error?: string, placeholder?: string, multiline?: boolean) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.multilineInput,
          error && styles.errorInput,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderNumberInput = (label: string, value: number, onChange: (value: number) => void, error?: string, min?: number, max?: number) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.numberInputContainer}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onChange(Math.max(min || 0, value - 1))}
          disabled={value <= (min || 0)}
        >
          <Text style={styles.numberButtonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.textInput, styles.numberInput, error && styles.errorInput]}
          value={value.toString()}
          onChangeText={(text) => onChange(parseInt(text) || 0)}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onChange(Math.min(max || 100, value + 1))}
          disabled={value >= (max || 100)}
        >
          <Text style={styles.numberButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏏 Create New Team</Text>
          <Text style={styles.subtitle}>Start your own cricket team and invite players</Text>
        </View>

        {/* Team Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          
          {renderInput(
            'Team Name',
            formData.name,
            (value) => setFormData(prev => ({ ...prev, name: value })),
            errors.name,
            'Enter your team name'
          )}

          {renderInput(
            'Short Name',
            formData.shortName,
            (value) => setFormData(prev => ({ ...prev, shortName: value })),
            errors.shortName,
            'e.g., IND, AUS, ENG'
          )}

          {renderInput(
            'Description',
            formData.description,
            (value) => setFormData(prev => ({ ...prev, description: value })),
            undefined,
            'Tell others about your team...',
            true
          )}

          {renderInput(
            'Location',
            formData.location,
            (value) => setFormData(prev => ({ ...prev, location: value })),
            errors.location,
            'Enter your team location'
          )}

          {renderNumberInput(
            'Maximum Members',
            formData.maxMembers,
            (value) => setFormData(prev => ({ ...prev, maxMembers: value })),
            errors.maxMembers,
            11,
            50
          )}
        </View>

        {/* Team Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewLogo}>🏏</Text>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>
                  {formData.name || 'Team Name'}
                </Text>
                <Text style={styles.previewShortName}>
                  ({formData.shortName || 'TAG'})
                </Text>
              </View>
            </View>
            
            {formData.description && (
              <Text style={styles.previewDescription}>
                {formData.description}
              </Text>
            )}
            
            <View style={styles.previewDetails}>
              <Text style={styles.previewDetail}>
                📍 {formData.location || 'Location'}
              </Text>
              <Text style={styles.previewDetail}>
                👥 Max {formData.maxMembers} members
              </Text>
              <Text style={styles.previewDetail}>
                👑 Captain: {currentPlayer.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Team Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Rules</Text>
          <View style={styles.rulesContainer}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>👑</Text>
              <Text style={styles.ruleText}>
                You will be the team captain and can manage team settings
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>👥</Text>
              <Text style={styles.ruleText}>
                You can invite up to {formData.maxMembers - 1} other players
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>🏏</Text>
              <Text style={styles.ruleText}>
                For each match, you'll select 11 players from your team
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>📅</Text>
              <Text style={styles.ruleText}>
                Players can only play one match at a time
              </Text>
            </View>
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
            title={isLoading ? "Creating..." : "Create Team"}
            onPress={handleCreateTeam}
            size="large"
            style={styles.createButton}
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: SIZES.xs,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: SIZES.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numberInput: {
    flex: 1,
    textAlign: 'center',
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
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  previewLogo: {
    fontSize: 48,
    marginRight: SIZES.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  previewShortName: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  previewDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.md,
  },
  previewDetails: {
    gap: SIZES.xs,
  },
  previewDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  rulesContainer: {
    gap: SIZES.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
  },
  ruleIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actions: {
    gap: SIZES.md,
    marginTop: SIZES.xl,
  },
  cancelButton: {
    marginBottom: SIZES.sm,
  },
  createButton: {
    marginBottom: SIZES.sm,
  },
});

export default TeamCreationScreen;
