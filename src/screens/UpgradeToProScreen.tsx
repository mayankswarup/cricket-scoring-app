import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface UpgradeToProScreenProps {
  onBack: () => void;
  onUpgrade?: (plan: 'monthly' | 'yearly') => void;
}

const UpgradeToProScreen: React.FC<UpgradeToProScreenProps> = ({ onBack, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade(selectedPlan);
    } else {
      Alert.alert(
        'Coming Soon',
        'Payment integration will be available soon!',
        [{ text: 'OK' }]
      );
    }
  };

  const features = [
    {
      icon: '🔍',
      title: 'Unlimited Player Stats',
      description: 'View detailed statistics for any player in the system'
    },
    {
      icon: '📊',
      title: 'Team Performance Analysis',
      description: 'Complete team statistics with sorting and filtering'
    },
    {
      icon: '🎯',
      title: 'Pre-Match Scouting',
      description: 'Analyze opponents before matches to gain an edge'
    },
    {
      icon: '⚔️',
      title: 'Head-to-Head Comparison',
      description: 'Compare players and teams side-by-side'
    },
    {
      icon: '📈',
      title: 'Performance Trends',
      description: 'Track form, streaks, and performance graphs'
    },
    {
      icon: '🏆',
      title: 'Advanced Insights',
      description: 'Get AI-powered match predictions and recommendations'
    },
    {
      icon: '📄',
      title: 'Export Reports',
      description: 'Download and share statistics reports'
    },
    {
      icon: '⚡',
      title: 'Priority Support',
      description: 'Get help faster with dedicated PRO support'
    },
  ];

  const renderFeature = (feature: any, index: number) => (
    <View key={index} style={styles.featureCard}>
      <Text style={styles.featureIcon}>{feature.icon}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to PRO</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>💎</Text>
          <Text style={styles.heroTitle}>Unlock PRO Features</Text>
          <Text style={styles.heroSubtitle}>
            Get the competitive edge with advanced analytics
          </Text>
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Monthly</Text>
              {selectedPlan === 'monthly' && <Text style={styles.selectedBadge}>✓</Text>}
            </View>
            <Text style={styles.planPrice}>₹199</Text>
            <Text style={styles.planDuration}>per month</Text>
            <Text style={styles.planBilling}>Billed monthly</Text>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Yearly</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE 17%</Text>
              </View>
              {selectedPlan === 'yearly' && <Text style={styles.selectedBadge}>✓</Text>}
            </View>
            <Text style={styles.planPrice}>₹1,999</Text>
            <Text style={styles.planDuration}>per year</Text>
            <Text style={styles.planBilling}>₹166/month • Save ₹389/year</Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          {features.map(renderFeature)}
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>What Players Say</Text>
          
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "PRO stats helped me identify weak bowlers and plan my batting strategy. Won the match!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Rahul K., Mumbai</Text>
          </View>

          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "Scouting opponents before matches gave our team a huge advantage. Worth every rupee!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Priya S., Bangalore</Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <View style={styles.ctaInfo}>
          <Text style={styles.ctaPrice}>
            {selectedPlan === 'monthly' ? '₹199/month' : '₹1,999/year'}
          </Text>
          <Text style={styles.ctaSaving}>
            {selectedPlan === 'yearly' && 'Save ₹389/year'}
          </Text>
        </View>
        <TouchableOpacity style={styles.ctaButton} onPress={handleUpgrade}>
          <Text style={styles.ctaButtonText}>Subscribe Now</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: SIZES.md,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  pricingSection: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  selectedPlan: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  planName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  saveBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  selectedBadge: {
    fontSize: 20,
    color: COLORS.primary,
  },
  planPrice: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  planDuration: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  planBilling: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  featuresSection: {
    padding: SIZES.lg,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: SIZES.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  testimonialsSection: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
  },
  testimonialCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  testimonialText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  bottomSpace: {
    height: 100,
  },
  bottomCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  ctaInfo: {
    flex: 1,
  },
  ctaPrice: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  ctaSaving: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.success,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default UpgradeToProScreen;

