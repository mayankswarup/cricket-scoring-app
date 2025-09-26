import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from './Button';
import { Player } from '../types';

interface AddPlayerComponentProps {
  teamName: string;
  onPlayerAdd: (player: Player) => void;
  onClose: () => void;
  visible: boolean;
}

const AddPlayerComponent: React.FC<AddPlayerComponentProps> = ({
  teamName,
  onPlayerAdd,
  onClose,
  visible,
}) => {
  const [playerData, setPlayerData] = useState({
    name: '',
    role: 'batsman' as 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper',
    battingStyle: 'right-handed' as 'right-handed' | 'left-handed',
    bowlingStyle: 'right-arm fast' as 'right-arm fast' | 'left-arm fast' | 'right-arm spin' | 'left-arm spin' | undefined,
    matches: 0,
    runs: 0,
    wickets: 0,
    average: 0,
    strikeRate: 0,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!playerData.name.trim()) {
      newErrors.name = 'Player name is required';
    }

    if (playerData.matches < 0) {
      newErrors.matches = 'Matches cannot be negative';
    }

    if (playerData.runs < 0) {
      newErrors.runs = 'Runs cannot be negative';
    }

    if (playerData.wickets < 0) {
      newErrors.wickets = 'Wickets cannot be negative';
    }

    if (playerData.average < 0) {
      newErrors.average = 'Average cannot be negative';
    }

    if (playerData.strikeRate < 0) {
      newErrors.strikeRate = 'Strike rate cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPlayer = () => {
    if (!validateForm()) {
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(), // Simple ID generation
      name: playerData.name.trim(),
      team: teamName,
      role: playerData.role,
      battingStyle: playerData.battingStyle,
      bowlingStyle: playerData.role !== 'batsman' ? playerData.bowlingStyle : undefined,
      stats: {
        matches: playerData.matches,
        runs: playerData.runs,
        wickets: playerData.wickets,
        average: playerData.average,
        strikeRate: playerData.strikeRate,
      },
    };

    onPlayerAdd(newPlayer);
    
    // Reset form
    setPlayerData({
      name: '',
      role: 'batsman',
      battingStyle: 'right-handed',
      bowlingStyle: 'right-arm fast',
      matches: 0,
      runs: 0,
      wickets: 0,
      average: 0,
      strikeRate: 0,
    });
    setErrors({});
    
    Alert.alert('Success', `${newPlayer.name} has been added to ${teamName}!`);
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

  const renderRoleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Player Role</Text>
      <View style={styles.roleOptions}>
        {(['batsman', 'bowler', 'all-rounder', 'wicket-keeper'] as const).map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleOption,
              playerData.role === role && styles.selectedRoleOption,
            ]}
            onPress={() => setPlayerData(prev => ({ ...prev, role }))}
          >
            <Text style={styles.roleIcon}>{getRoleIcon(role)}</Text>
            <Text style={[
              styles.roleText,
              playerData.role === role && styles.selectedRoleText,
            ]}>
              {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBattingStyleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Batting Style</Text>
      <View style={styles.styleOptions}>
        {(['right-handed', 'left-handed'] as const).map((style) => (
          <TouchableOpacity
            key={style}
            style={[
              styles.styleOption,
              playerData.battingStyle === style && styles.selectedStyleOption,
            ]}
            onPress={() => setPlayerData(prev => ({ ...prev, battingStyle: style }))}
          >
            <Text style={[
              styles.styleText,
              playerData.battingStyle === style && styles.selectedStyleText,
            ]}>
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBowlingStyleSelector = () => {
    if (playerData.role === 'batsman') return null;

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Bowling Style</Text>
        <View style={styles.styleOptions}>
          {(['right-arm fast', 'left-arm fast', 'right-arm spin', 'left-arm spin'] as const).map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.styleOption,
                playerData.bowlingStyle === style && styles.selectedStyleOption,
              ]}
              onPress={() => setPlayerData(prev => ({ ...prev, bowlingStyle: style }))}
            >
              <Text style={[
                styles.styleText,
                playerData.bowlingStyle === style && styles.selectedStyleText,
              ]}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStatsInput = (label: string, value: number, onChange: (value: number) => void, error?: string) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, error && styles.errorInput]}
        value={value.toString()}
        onChangeText={(text) => onChange(parseInt(text) || 0)}
        keyboardType="numeric"
        placeholder="0"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Player</Text>
          <Text style={styles.subtitle}>Add a player to {teamName}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Player Name</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.errorInput]}
                value={playerData.name}
                onChangeText={(text) => setPlayerData(prev => ({ ...prev, name: text }))}
                placeholder="Enter player name"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {renderRoleSelector()}
            {renderBattingStyleSelector()}
            {renderBowlingStyleSelector()}
          </View>

          {/* Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Player Statistics</Text>
            
            <View style={styles.statsGrid}>
              {renderStatsInput('Matches', playerData.matches, (value) => 
                setPlayerData(prev => ({ ...prev, matches: value })), errors.matches)}
              
              {renderStatsInput('Runs', playerData.runs, (value) => 
                setPlayerData(prev => ({ ...prev, runs: value })), errors.runs)}
              
              {renderStatsInput('Wickets', playerData.wickets, (value) => 
                setPlayerData(prev => ({ ...prev, wickets: value })), errors.wickets)}
              
              {renderStatsInput('Average', playerData.average, (value) => 
                setPlayerData(prev => ({ ...prev, average: value })), errors.average)}
              
              {renderStatsInput('Strike Rate', playerData.strikeRate, (value) => 
                setPlayerData(prev => ({ ...prev, strikeRate: value })), errors.strikeRate)}
            </View>
          </View>

          {/* Player Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Player Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewName}>
                  {getRoleIcon(playerData.role)} {playerData.name || 'New Player'}
                </Text>
                <Text style={styles.previewRole}>{playerData.role.toUpperCase()}</Text>
              </View>
              <Text style={styles.previewDetails}>
                Batting: {playerData.battingStyle}
                {playerData.role !== 'batsman' && ` | Bowling: ${playerData.bowlingStyle}`}
              </Text>
              <Text style={styles.previewStats}>
                Matches: {playerData.matches} | Runs: {playerData.runs} | 
                Wickets: {playerData.wickets} | Avg: {playerData.average}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            size="medium"
            style={styles.cancelButton}
          />
          <Button
            title="Add Player"
            onPress={handleAddPlayer}
            size="medium"
            style={styles.addButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.xl,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
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
  previewRole: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  previewDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  previewStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.md,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});

export default AddPlayerComponent;
