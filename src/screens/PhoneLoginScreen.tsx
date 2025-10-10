/**
 * Phone OTP Login Screen
 * Handles phone number entry and OTP verification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { phoneAuthService } from '../services/phoneAuthService';
import { COLORS, SIZES, FONTS } from '../constants';

interface PhoneLoginScreenProps {
  onLoginSuccess: () => void;
}

const PhoneLoginScreen: React.FC<PhoneLoginScreenProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    // Validate phone number
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      await phoneAuthService.sendOTP(phoneNumber);
      setShowOtpInput(true);
      setResendTimer(60); // 60 seconds countdown
      Alert.alert('OTP Sent!', `A 6-digit OTP has been sent to +91${phoneNumber}`);
    } catch (error: any) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Validate OTP
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      Alert.alert('Invalid OTP', 'OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const firebaseUser = await phoneAuthService.verifyOTP(otp);
      
      // Create or update user profile in Firebase
      await createOrUpdateUserProfile(firebaseUser);
      
      Alert.alert('Success!', 'Login successful');
      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateUserProfile = async (firebaseUser: any) => {
    try {
      const { userProfileService } = await import('../services/userProfileService');
      const phoneNumber = firebaseUser.phoneNumber.replace('+91', '');
      
      // Check if user profile already exists
      const userProfileExists = await userProfileService.userProfileExists(phoneNumber);
      
      if (!userProfileExists) {
        // Create new user profile
        await userProfileService.createUserProfile(phoneNumber);
        console.log('✅ New user profile created in Firebase');
      } else {
        // Update existing user profile (last login time)
        await userProfileService.updateLastLogin(phoneNumber);
        console.log('✅ Existing user profile updated in Firebase');
      }
    } catch (error) {
      console.error('❌ Failed to create/update user profile:', error);
      // Don't throw error - user is still authenticated
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      return; // Don't allow resend during countdown
    }

    setOtp(''); // Clear OTP input
    phoneAuthService.resetRecaptcha(); // Reset reCAPTCHA
    await handleSendOTP(); // Resend OTP
  };

  const handleChangeNumber = () => {
    setShowOtpInput(false);
    setOtp('');
    setPhoneNumber('');
    setResendTimer(0);
    phoneAuthService.resetRecaptcha();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏏</Text>
          <Text style={styles.title}>Cricket Scoring App</Text>
          <Text style={styles.subtitle}>
            {showOtpInput ? 'Verify OTP' : 'Login with Phone Number'}
          </Text>
        </View>

        {/* reCAPTCHA Container will be created dynamically by the service */}

        {!showOtpInput ? (
          /* Phone Number Input */
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="9019078195"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
                autoFocus
              />
            </View>
            <Text style={styles.hint}>
              We'll send you a 6-digit OTP for verification
            </Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* OTP Input */
          <View style={styles.form}>
            <Text style={styles.label}>Enter OTP</Text>
            <Text style={styles.otpSentText}>
              OTP sent to +91{phoneNumber}
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimer}>
                  Resend OTP in {resendTimer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Change Number */}
            <TouchableOpacity onPress={handleChangeNumber} disabled={loading}>
              <Text style={styles.changeNumberText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our
          </Text>
          <Text style={styles.footerLink}>Terms & Privacy Policy</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SIZES.md,
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
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
  },
  countryCode: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginRight: SIZES.sm,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    paddingVertical: SIZES.md,
  },
  otpInput: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.md,
    textAlign: 'center',
    letterSpacing: 10,
  },
  hint: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  otpSentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.success,
    marginBottom: SIZES.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  resendTimer: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  resendText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  changeNumberText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: SIZES.xxl,
  },
  footerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: SIZES.xs,
  },
});

export default PhoneLoginScreen;

