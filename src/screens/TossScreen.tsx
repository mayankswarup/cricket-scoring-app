import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { COLORS, SIZES, FONTS } from '../constants';
// import { UI_CONFIG } from '../config/appConfig';

const { width } = Dimensions.get('window');

interface TossScreenProps {
  onBack: () => void;
  teamA?: string;
  teamB?: string;
  onTossComplete?: (winner: string, decision: string) => void;
  isQuickToss?: boolean; // New prop to indicate if this is just a quick toss
}

const TossScreen: React.FC<TossScreenProps> = ({ onBack, teamA = 'Team A', teamB = 'Team B', onTossComplete, isQuickToss = false }) => {
  const progress = useRef(new Animated.Value(0)).current; // 0..1 (0/1=H, 0.5=T)
  const [busy, setBusy] = useState(false);
  const [tossResult, setTossResult] = useState<string | null>(null);
  const [showDecision, setShowDecision] = useState(false);
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [showBattingDecision, setShowBattingDecision] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Faces rotate in lockstep but 180° apart
  const frontRotY = progress.interpolate({
    inputRange: [0, 0.5, 1], outputRange: ["0deg", "180deg", "360deg"],
  });
  const backRotY = progress.interpolate({
    inputRange: [0, 0.5, 1], outputRange: ["180deg", "360deg", "540deg"],
  });

  // A thin edge that appears around 90°/270° to sell the 3D illusion
  const edgeOpacity = progress.interpolate({
    inputRange: [0, 0.12, 0.25, 0.5, 0.75, 0.88, 1],
    outputRange: [0, 1, 0.25, 0, 0.25, 1, 0],
  });
  const edgeScaleX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0.05, 1, 0.05, 1, 0.05],  // widest when "on edge"
  });

  // Load sound effect on component mount
  useEffect(() => {
    loadSound();
    return () => {
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      console.log('🔊 Loading coin toss sound...');
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/img/coin_toss_soft.wav')
      );
      setSound(newSound);
      console.log('✅ Coin toss sound loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load coin toss sound:', error);
    }
  };

  const playCoinSound = async () => {
    try {
      if (sound) {
        console.log('🔊 Playing coin toss sound...');
        await sound.replayAsync();
      }
    } catch (error) {
      console.error('❌ Failed to play coin toss sound:', error);
    }
  };

  const flipCoin = () => {
    if (busy) return;
    setBusy(true);

    // Play coin toss sound immediately when flip starts
    playCoinSound();

    const headsWins = Math.random() < 0.5;
    const target = headsWins ? 2 : 2.5; // 2 spins or 2.5 spins (tails)
    Animated.timing(progress, {
      toValue: target,
      duration: 1100,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      progress.setValue(headsWins ? 0 : 0.5); // normalize final pose
      setBusy(false);
      const result = headsWins ? 'Heads' : 'Tails';
      setTossResult(result);
      setShowDecision(true);
    });
  };

  const handleTossWinner = (winner: string) => {
    setTossWinner(winner);
    setShowDecision(false);
    
    if (isQuickToss) {
      // For quick toss, just show the result and allow going back
      console.log('🪙 Quick toss completed:', winner);
      // Don't proceed to batting decision for quick toss
    } else {
      setShowBattingDecision(true);
    }
  };

  const handleBattingDecision = (decision: string) => {
    if (onTossComplete) {
      onTossComplete(tossWinner!, decision);
    }
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🪙 Toss</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          {isQuickToss ? 'Flip the coin for a quick decision!' : 'Flip the coin to decide!'}
        </Text>
        
        {/* Coin Container */}
        <View style={styles.coinContainer}>
          <Pressable onPress={flipCoin} style={styles.wrapper}>
            <View style={[styles.coin, { width: 180, height: 180, borderRadius: 90 }]}>
              {/* FRONT (Heads) */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.face,
                  { borderRadius: 90, transform: [{ perspective: 1000 }, { rotateY: frontRotY }] },
                ]}>
                <View style={styles.coinFace}>
                  <Text style={styles.coinText}>H</Text>
                </View>
              </Animated.View>

              {/* BACK (Tails) */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.face,
                  { borderRadius: 90, transform: [{ perspective: 1000 }, { rotateY: backRotY }] },
                ]}>
                <View style={styles.coinFace}>
                  <Text style={styles.coinText}>T</Text>
                </View>
              </Animated.View>

              {/* EDGE shimmer */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.edge,
                  {
                    width: 180 * 0.12,
                    height: 180 * 0.94,
                    opacity: edgeOpacity,
                    transform: [{ scaleX: edgeScaleX }],
                  },
                ]}
              />
            </View>
          </Pressable>
        </View>


        {/* Flip Button */}
        <TouchableOpacity
          style={[styles.flipButton, busy && styles.flipButtonDisabled]}
          onPress={flipCoin}
          disabled={busy}
        >
          <Text style={styles.flipButtonText}>
            {busy ? '🔄 Flipping...' : '🪙 Flip Coin'}
          </Text>
        </TouchableOpacity>
        
        {tossResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              Result: {tossResult}
            </Text>
          </View>
        )}
        
        {showDecision && !isQuickToss && (
          <View style={styles.decisionContainer}>
            <Text style={styles.decisionTitle}>
              {tossResult === 'Heads' ? 'Heads wins!' : 'Tails wins!'}
            </Text>
            <Text style={styles.decisionSubtitle}>
              Which team won the toss?
            </Text>
            <View style={styles.teamButtons}>
              <TouchableOpacity
                style={styles.teamButton}
                onPress={() => handleTossWinner(teamA)}
              >
                <Text style={styles.teamButtonText}>{teamA}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.teamButton}
                onPress={() => handleTossWinner(teamB)}
              >
                <Text style={styles.teamButtonText}>{teamB}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {showBattingDecision && (
          <View style={styles.battingDecisionContainer}>
            <Text style={styles.battingDecisionTitle}>
              {tossWinner} won the toss!
            </Text>
            <Text style={styles.battingDecisionSubtitle}>
              What do they choose?
            </Text>
            <View style={styles.battingButtons}>
              <TouchableOpacity
                style={styles.battingButton}
                onPress={() => handleBattingDecision('Batting')}
              >
                <Text style={styles.battingButtonIcon}>🏏</Text>
                <Text style={styles.battingButtonText}>Batting</Text>
                <Text style={styles.battingButtonSubtext}>We want to bat first</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.battingButton}
                onPress={() => handleBattingDecision('Fielding')}
              >
                <Text style={styles.battingButtonIcon}>⚾</Text>
                <Text style={styles.battingButtonText}>Fielding</Text>
                <Text style={styles.battingButtonSubtext}>We want to bowl first</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    paddingTop: 50, // Account for status bar
  },
  backButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  headerSpacer: {
    width: 60,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xxl, // Add bottom padding for better scrolling
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xxl,
    textAlign: 'center',
  },
  coinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xxl,
    height: 150,
    width: '100%',
  },
  wrapper: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  coin: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    // IMPORTANT: do NOT put backfaceVisibility here
  },
  face: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden", // only on faces
  },
  edge: {
    position: "absolute",
    backgroundColor: "#b88a1a",
    borderRadius: 999,
  },
  flipButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xxl,
    borderRadius: 25,
    marginBottom: SIZES.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 150,
  },
  flipButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  flipButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginTop: SIZES.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  decisionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginTop: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  decisionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  decisionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  teamButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  teamButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: 8,
    marginHorizontal: SIZES.sm,
    alignItems: 'center',
  },
  teamButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  decisionNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  battingDecisionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginTop: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  battingDecisionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  battingDecisionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  battingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  battingButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: SIZES.lg,
    borderRadius: 8,
    marginHorizontal: SIZES.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  battingButtonIcon: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  battingButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333333',
    marginBottom: SIZES.xs,
  },
  battingButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  coinFace: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#B8860B',
  },
  coinText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});

export default TossScreen;

