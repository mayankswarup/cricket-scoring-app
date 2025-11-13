import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface AboutUsScreenProps {
  onBack: () => void;
}

const AboutUsScreen: React.FC<AboutUsScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>🏏 Tuktuk Sports</Text>
          <Text style={styles.heroSubtitle}>Revolutionizing Cricket Scoring & Team Management</Text>
          <Text style={styles.heroDescription}>
            We're passionate about cricket and technology, bringing you the most comprehensive 
            cricket scoring and team management solution in India.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
          <Text style={styles.paragraph}>
            To democratize cricket scoring and team management by providing accessible, 
            user-friendly technology that brings cricket communities together. We believe 
            every cricket match deserves professional scoring, and every team deserves 
            efficient management tools.
          </Text>
        </View>

        {/* Vision Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Our Vision</Text>
          <Text style={styles.paragraph}>
            To become India's leading cricket technology platform, empowering millions 
            of cricket enthusiasts, teams, and clubs with cutting-edge tools for scoring, 
            team management, and community building.
          </Text>
        </View>

        {/* What We Do Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 What We Do</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Professional Scoring</Text>
                <Text style={styles.featureDescription}>
                  Real-time cricket scoring with detailed statistics and live updates
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👥</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Team Management</Text>
                <Text style={styles.featureDescription}>
                  Complete team creation, player management, and roster organization
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Mobile-First Design</Text>
                <Text style={styles.featureDescription}>
                  Optimized for mobile devices with offline capabilities
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌐</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Community Building</Text>
                <Text style={styles.featureDescription}>
                  Connect players, teams, and cricket enthusiasts across India
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Our Story Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Our Story</Text>
          <Text style={styles.paragraph}>
            Tuktuk Sports was born from a simple observation: cricket scoring in India 
            was still largely manual, with paper scorecards and basic calculators. We 
            saw an opportunity to bring professional-grade scoring technology to every 
            cricket match, from local club games to corporate tournaments.
          </Text>
          <Text style={styles.paragraph}>
            Founded in 2025 by passionate cricket enthusiasts and technology experts, 
            we set out to create a solution that would make cricket scoring accessible, 
            accurate, and enjoyable for everyone. Our team combines deep cricket knowledge 
            with cutting-edge mobile technology to deliver an experience that's both 
            professional and user-friendly.
          </Text>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💎 Our Values</Text>
          <View style={styles.valuesList}>
            {/* Row 1 */}
            <View style={styles.valuesRow}>
              <View style={styles.valueItem}>
                <Text style={styles.valueIcon}>🎯</Text>
                <Text style={styles.valueTitle}>Excellence</Text>
                <Text style={styles.valueDescription}>
                  We strive for the highest quality in everything we do
                </Text>
              </View>
              
              <View style={styles.valueItem}>
                <Text style={styles.valueIcon}>🤝</Text>
                <Text style={styles.valueTitle}>Community</Text>
                <Text style={styles.valueDescription}>
                  Building strong cricket communities is at our core
                </Text>
              </View>
            </View>
            
            {/* Row 2 */}
            <View style={styles.valuesRow}>
              <View style={styles.valueItem}>
                <Text style={styles.valueIcon}>🚀</Text>
                <Text style={styles.valueTitle}>Innovation</Text>
                <Text style={styles.valueDescription}>
                  Continuously improving through technology and feedback
                </Text>
              </View>
              
              <View style={styles.valueItem}>
                <Text style={styles.valueIcon}>🌍</Text>
                <Text style={styles.valueTitle}>Accessibility</Text>
                <Text style={styles.valueDescription}>
                  Making cricket technology available to everyone
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Technology Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Our Technology</Text>
          <Text style={styles.paragraph}>
            Built with modern web technologies including React Native, Expo, and Firebase, 
            our platform ensures fast, reliable, and secure cricket scoring. We use 
            real-time databases for live updates and cloud storage for data persistence.
          </Text>
          <View style={styles.techStack}>
            <View style={styles.techItem}>
              <Text style={styles.techName}>React Native</Text>
              <Text style={styles.techDescription}>Cross-platform mobile development</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Firebase</Text>
              <Text style={styles.techDescription}>Real-time database and authentication</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Expo</Text>
              <Text style={styles.techDescription}>Rapid development and deployment</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Get In Touch</Text>
          <Text style={styles.paragraph}>
            We'd love to hear from you! Whether you're a cricket team looking for 
            scoring solutions, a developer interested in our technology, or just a 
            cricket enthusiast with feedback, we're here to help.
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>🏢</Text>
              <Text style={styles.contactText}>
                Tuktuk Sports Private Ltd{'\n'}
                Bengaluru, Karnataka 560035{'\n'}
                India
              </Text>
            </View>
            
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText}>
                Email: info@tuktuksports.com{'\n'}
                Support: support@tuktuksports.com
              </Text>
            </View>
            
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📱</Text>
              <Text style={styles.contactText}>
                Phone: +91 9876543210{'\n'}
                WhatsApp: +91 9876543210
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Tuktuk Sports Private Ltd. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for cricket lovers in India
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  heroSection: {
    backgroundColor: COLORS.primary + '10',
    padding: SIZES.xl,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.xl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SIZES.md,
  },
  featureList: {
    gap: SIZES.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SIZES.md,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  valuesList: {
    gap: SIZES.md,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.md,
  },
  valueItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    minHeight: 120,
  },
  valueIcon: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  valueTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  valueDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  techItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  techName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  techDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  contactInfo: {
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: SIZES.md,
    marginTop: 2,
  },
  contactText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    marginTop: SIZES.xl,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    textAlign: 'center',
  },
});

export default AboutUsScreen;
