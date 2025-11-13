import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { SHOT_TYPES, SHOT_REGIONS, SHOT_QUALITY } from '../data/cricketShots';

const { width } = Dimensions.get('window');

interface ShotDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (shotDetails: ShotDetails) => void;
  runs: number;
  isWicket: boolean;
  batsmanName?: string;
  bowlerName?: string;
}

export interface ShotDetails {
  shotType?: string | string[];
  shotRegion?: string | string[];
  shotQuality?: string | string[];
  commentary?: string; // Optional commentary field
}

const ShotDetailsModal: React.FC<ShotDetailsModalProps> = ({
  visible,
  onClose,
  onConfirm,
  runs,
  isWicket,
  batsmanName,
  bowlerName,
}) => {
  const [selectedShotTypes, setSelectedShotTypes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [commentary, setCommentary] = useState('');

  // Smart commentary generation that handles single or multiple selections
  const generateCommentary = useCallback((
    shotTypes: string[],
    regions: string[],
    qualities: string[]
  ) => {
    const playerName = batsmanName || 'the batter';
    const bowlerText = bowlerName ? ` off ${bowlerName}` : '';
    const runsText = runs === 6 ? "6" : runs === 4 ? "4" : `${runs} run${runs > 1 ? 's' : ''}`;
    
    // Helper function to format multiple selections
    const formatList = (items: string[]): string => {
      if (items.length === 0) return '';
      if (items.length === 1) return items[0].toLowerCase();
      if (items.length === 2) return `${items[0].toLowerCase()} and ${items[1].toLowerCase()}`;
      return `${items.slice(0, -1).map(i => i.toLowerCase()).join(', ')}, and ${items[items.length - 1].toLowerCase()}`;
    };

    const hasShotType = shotTypes.length > 0;
    const hasRegion = regions.length > 0;
    const hasQuality = qualities.length > 0;

    let commentary = '';

    // Build commentary based on what's selected
    if (hasShotType) {
      const shotTypeText = formatList(shotTypes);
      commentary = `What a ${shotTypeText} by ${playerName}${bowlerText}!`;
      
      if (hasRegion && hasQuality) {
        const regionText = formatList(regions);
        const qualityText = formatList(qualities);
        commentary += ` He has hit it to ${regionText} with ${qualityText} for ${runsText}!`;
      } else if (hasRegion) {
        const regionText = formatList(regions);
        commentary += ` He has hit it to ${regionText} for ${runsText}!`;
      } else if (hasQuality) {
        const qualityText = formatList(qualities);
        commentary += ` He has hit it with ${qualityText} for ${runsText}!`;
      } else {
        commentary += ` He has hit it for ${runsText}!`;
      }
    } else if (hasRegion && hasQuality) {
      const regionText = formatList(regions);
      const qualityText = formatList(qualities);
      commentary = `${playerName}${bowlerText} has hit it to ${regionText} with ${qualityText} for ${runsText}!`;
    } else if (hasRegion) {
      const regionText = formatList(regions);
      commentary = `${playerName}${bowlerText} has hit it to ${regionText} for ${runsText}!`;
    } else if (hasQuality) {
      const qualityText = formatList(qualities);
      commentary = `${playerName}${bowlerText} has hit it with ${qualityText} for ${runsText}!`;
    } else {
      // Fallback if nothing is selected (shouldn't happen, but just in case)
      commentary = `${playerName}${bowlerText} has scored ${runsText}!`;
    }

    return commentary;
  }, [batsmanName, bowlerName, runs]);

  // Auto-generate commentary whenever selections change
  useEffect(() => {
    // Only generate if at least one option is selected
    if (selectedShotTypes.length > 0 || selectedRegions.length > 0 || selectedQualities.length > 0) {
      const autoCommentary = generateCommentary(selectedShotTypes, selectedRegions, selectedQualities);
      setCommentary(autoCommentary);
    }
  }, [selectedShotTypes, selectedRegions, selectedQualities, generateCommentary]);

  const handleConfirm = () => {
    // Allow confirmation with just runs - shot details are optional
    const trimmedCommentary = commentary.trim();
    const shotDetails: ShotDetails = {};

    if (selectedShotTypes.length > 0) {
      shotDetails.shotType = selectedShotTypes.length === 1 ? selectedShotTypes[0] : selectedShotTypes;
    }
    if (selectedRegions.length > 0) {
      shotDetails.shotRegion = selectedRegions.length === 1 ? selectedRegions[0] : selectedRegions;
    }
    if (selectedQualities.length > 0) {
      shotDetails.shotQuality = selectedQualities.length === 1 ? selectedQualities[0] : selectedQualities;
    }
    if (trimmedCommentary) {
      shotDetails.commentary = trimmedCommentary;
    }

    onConfirm(shotDetails);
    // Reset selections
    setSelectedShotTypes([]);
    setSelectedRegions([]);
    setSelectedQualities([]);
    setCommentary('');
  };

  // Toggle selection helper functions
  const toggleShotType = (shot: string) => {
    setSelectedShotTypes(prev => 
      prev.includes(shot)
        ? prev.filter(s => s !== shot)
        : [...prev, shot]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const toggleQuality = (quality: string) => {
    setSelectedQualities(prev => 
      prev.includes(quality)
        ? prev.filter(q => q !== quality)
        : [...prev, quality]
    );
  };

  const renderShotTypeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shot Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {Object.entries(SHOT_TYPES).map(([category, shots]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.replace('_', ' ')}</Text>
            <View style={styles.shotsRow}>
              {shots.map((shot) => (
                <TouchableOpacity
                  key={shot}
                  style={[
                    styles.optionButton,
                    selectedShotTypes.includes(shot) && styles.selectedOption,
                  ]}
                  onPress={() => toggleShotType(shot)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedShotTypes.includes(shot) && styles.selectedOptionText,
                  ]}>
                    {shot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderRegionSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shot Region</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {SHOT_REGIONS.map((region) => (
          <TouchableOpacity
            key={region}
            style={[
              styles.optionButton,
              selectedRegions.includes(region) && styles.selectedOption,
            ]}
            onPress={() => toggleRegion(region)}
          >
            <Text style={[
              styles.optionText,
              selectedRegions.includes(region) && styles.selectedOptionText,
            ]}>
              {region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQualitySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shot Quality</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {SHOT_QUALITY.map((quality) => (
          <TouchableOpacity
            key={quality}
            style={[
              styles.optionButton,
              selectedQualities.includes(quality) && styles.selectedOption,
            ]}
            onPress={() => toggleQuality(quality)}
          >
            <Text style={[
              styles.optionText,
              selectedQualities.includes(quality) && styles.selectedOptionText,
            ]}>
              {quality}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCommentarySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 Commentary (Optional)</Text>
      <View style={styles.commentaryHeader}>
        <Text style={styles.commentaryHint}>
          Write your own commentary for this shot (optional)...
        </Text>
        {(selectedShotTypes.length > 0 || selectedRegions.length > 0 || selectedQualities.length > 0) && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => {
              const autoCommentary = generateCommentary(selectedShotTypes, selectedRegions, selectedQualities);
              setCommentary(autoCommentary);
            }}
          >
            <Text style={styles.generateButtonText}>✨ Regenerate</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={styles.commentaryTextArea}
        placeholder={`e.g., What a pull shot by ${batsmanName || 'the batter'}! He has hit it for ${runs === 6 ? 'a massive 6' : runs === 4 ? 'a cracking boundary' : `${runs} runs`}!`}
        placeholderTextColor={COLORS.gray}
        value={commentary}
        onChangeText={setCommentary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        scrollEnabled={true}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isWicket ? 'Wicket Details' : `${runs} Run${runs > 1 ? 's' : ''} Details`}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {renderShotTypeSection()}
            {renderRegionSection()}
            {renderQualitySection()}
            {renderCommentarySection()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                Confirm Shot Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width * 0.95,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.gray,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  categoryContainer: {
    marginRight: 15,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  shotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: COLORS.white,
  },
  commentaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentaryHint: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
    flex: 1,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentaryTextArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    minHeight: 100,
    maxHeight: 120,
    textAlignVertical: 'top',
    fontFamily: FONTS.regular,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: COLORS.gray,
  },
});

export default ShotDetailsModal;
