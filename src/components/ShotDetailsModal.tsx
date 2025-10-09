import React, { useState } from 'react';
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
}

export interface ShotDetails {
  shotType?: string;
  shotRegion?: string;
  shotQuality?: string;
  commentary?: string; // Optional commentary field
}

const ShotDetailsModal: React.FC<ShotDetailsModalProps> = ({
  visible,
  onClose,
  onConfirm,
  runs,
  isWicket,
}) => {
  const [selectedShotType, setSelectedShotType] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [commentary, setCommentary] = useState('');

  // Auto-generate commentary based on selections
  const generateCommentary = (shotType: string, region: string, quality: string) => {
    const playerName = "Rohit Sharma"; // You can make this dynamic later
    const runsText = runs === 6 ? "6" : runs === 4 ? "4" : `${runs} run${runs > 1 ? 's' : ''}`;
    
    let baseCommentary = `What a ${shotType.toLowerCase()} by ${playerName}!`;
    
    if (region) {
      baseCommentary += ` He has hit it to ${region}`;
    }
    
    if (quality) {
      baseCommentary += ` with ${quality.toLowerCase()}`;
    }
    
    baseCommentary += ` for ${runsText}!`;
    
    return baseCommentary;
  };

  const handleConfirm = () => {
    // Allow confirmation with just runs - shot details are optional
    onConfirm({
      shotType: selectedShotType || undefined,
      shotRegion: selectedRegion || undefined,
      shotQuality: selectedQuality || undefined,
      commentary: commentary.trim() || undefined, // Optional field - only include if user wrote something
    });
    // Reset selections
    setSelectedShotType('');
    setSelectedRegion('');
    setSelectedQuality('');
    setCommentary('');
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
                    selectedShotType === shot && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setSelectedShotType(shot);
                    // Auto-generate commentary when shot type is selected
                    if (selectedRegion && selectedQuality) {
                      const autoCommentary = generateCommentary(shot, selectedRegion, selectedQuality);
                      setCommentary(autoCommentary);
                    }
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    selectedShotType === shot && styles.selectedOptionText,
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
              selectedRegion === region && styles.selectedOption,
            ]}
            onPress={() => {
              setSelectedRegion(region);
              // Auto-generate commentary when region is selected
              if (selectedShotType && selectedQuality) {
                const autoCommentary = generateCommentary(selectedShotType, region, selectedQuality);
                setCommentary(autoCommentary);
              }
            }}
          >
            <Text style={[
              styles.optionText,
              selectedRegion === region && styles.selectedOptionText,
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
              selectedQuality === quality && styles.selectedOption,
            ]}
            onPress={() => {
              setSelectedQuality(quality);
              // Auto-generate commentary when quality is selected
              if (selectedShotType && selectedRegion) {
                const autoCommentary = generateCommentary(selectedShotType, selectedRegion, quality);
                setCommentary(autoCommentary);
              }
            }}
          >
            <Text style={[
              styles.optionText,
              selectedQuality === quality && styles.selectedOptionText,
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
        {selectedShotType && selectedRegion && selectedQuality && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => {
              const autoCommentary = generateCommentary(selectedShotType, selectedRegion, selectedQuality);
              setCommentary(autoCommentary);
            }}
          >
            <Text style={styles.generateButtonText}>✨ Auto-Generate</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={styles.commentaryTextArea}
        placeholder="e.g., What a pull shot by Rohit Sharma! He has hit it for a mind-blowing 6!"
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
