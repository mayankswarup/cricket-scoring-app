import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: January 1, 2025</Text>

        <Text style={styles.introText}>
          At Tuktuk Sports, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.subsectionTitle}>1.1 Personal Information</Text>
        <Text style={styles.paragraph}>
          We collect the following personal information when you use our app:
          {'\n'}• Phone number (for authentication and account creation)
          {'\n'}• Name (as provided by you)
          {'\n'}• Email address (optional)
          {'\n'}• Profile picture (optional, stored securely)
          {'\n'}• Date of birth (optional)
          {'\n'}• Cricket preferences (playing role, batting hand, bowling style)
          {'\n'}• Jersey number (optional)
        </Text>

        <Text style={styles.subsectionTitle}>1.2 Usage Information</Text>
        <Text style={styles.paragraph}>
          We automatically collect certain information about your use of our app:
          {'\n'}• Device information (device type, operating system, app version)
          {'\n'}• Usage patterns and app interactions
          {'\n'}• Match data and scoring information
          {'\n'}• Team membership and participation
          {'\n'}• Location data (if you choose to share it)
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your personal information for the following purposes:
          {'\n'}• To provide and maintain our cricket scoring services
          {'\n'}• To authenticate your identity and secure your account
          {'\n'}• To facilitate team creation and management
          {'\n'}• To enable match scoring and live updates
          {'\n'}• To improve our app features and user experience
          {'\n'}• To send you important updates and notifications
          {'\n'}• To provide customer support
          {'\n'}• To comply with legal obligations
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          {'\n'}• With your explicit consent
          {'\n'}• With other team members (for team-related features)
          {'\n'}• With service providers who assist us in app operations
          {'\n'}• When required by law or to protect our rights
          {'\n'}• In case of a business transfer or merger
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your personal information:
          {'\n'}• All data is encrypted in transit and at rest
          {'\n'}• We use secure cloud storage (Firebase)
          {'\n'}• Access to your data is restricted to authorized personnel
          {'\n'}• Regular security audits and updates
          {'\n'}• Secure authentication protocols
        </Text>

        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as necessary to:
          {'\n'}• Provide our services to you
          {'\n'}• Comply with legal obligations
          {'\n'}• Resolve disputes and enforce agreements
          {'\n'}• Improve our services
        </Text>
        <Text style={styles.paragraph}>
          You may request deletion of your account and associated data at any time by contacting us.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
        <Text style={styles.paragraph}>
          You have the following rights regarding your personal information:
          {'\n'}• Access: Request a copy of your personal data
          {'\n'}• Correction: Update or correct your information
          {'\n'}• Deletion: Request deletion of your account and data
          {'\n'}• Portability: Export your data in a readable format
          {'\n'}• Opt-out: Unsubscribe from marketing communications
        </Text>

        <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          Our app may integrate with third-party services:
          {'\n'}• Firebase (Google) - for data storage and authentication
          {'\n'}• Expo - for app development and deployment
          {'\n'}• These services have their own privacy policies
          {'\n'}• We do not control their data practices
        </Text>

        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by:
          {'\n'}• Posting the updated policy in our app
          {'\n'}• Sending you a notification
          {'\n'}• Updating the "Last Updated" date
        </Text>
        <Text style={styles.paragraph}>
          Your continued use of our app after any changes constitutes acceptance of the updated Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy or our data practices, please contact us:
          {'\n'}Tuktuk Sports Private Ltd
          {'\n'}Bengaluru, Karnataka 560035
          {'\n'}Email: privacy@tuktuksports.com
          {'\n'}Phone: +91 9876543210
        </Text>

        <Text style={styles.sectionTitle}>12. Data Protection Officer</Text>
        <Text style={styles.paragraph}>
          For privacy-related concerns and data protection inquiries, you can contact our Data Protection Officer at:
          {'\n'}Email: dpo@tuktuksports.com
          {'\n'}Phone: +91 9876543210
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Privacy Policy is effective as of January 1, 2025, and will remain in effect except with respect to any changes in its provisions in the future.
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
    width: 50, // To balance the back button
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SIZES.md,
  },
  introText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.lg,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  subsectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    lineHeight: 22,
  },
  footer: {
    marginTop: SIZES.xl,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  footerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PrivacyPolicyScreen;
