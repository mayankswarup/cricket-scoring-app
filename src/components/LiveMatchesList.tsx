import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES } from '../constants';
import { Match } from '../types';
import LiveScoreCard from './LiveScoreCard';

interface LiveMatchesListProps {
  matches: Match[];
  onMatchPress?: (match: Match) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.85; // 85% of screen width
const cardSpacing = SIZES.md;

const LiveMatchesList: React.FC<LiveMatchesListProps> = ({ 
  matches, 
  onMatchPress 
}) => {
  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No live matches available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Matches</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
      >
        {matches.map((match, index) => (
          <View
            key={match.id}
            style={[
              styles.cardContainer,
              { 
                width: cardWidth,
                marginLeft: index === 0 ? 0 : cardSpacing,
                marginRight: index === matches.length - 1 ? SIZES.lg : 0
              }
            ]}
          >
            <LiveScoreCard
              match={match}
              onPress={() => onMatchPress?.(match)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    marginHorizontal: SIZES.lg,
  },
  scrollContent: {
    paddingLeft: SIZES.lg,
  },
  cardContainer: {
    // Card container styles
  },
  emptyContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LiveMatchesList;
