// Simplified OTP Login Screen - Fixed UI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import { PlayerRegistration } from '../types';
import { authService } from '../services/authService';

interface SimpleOTPLoginScreenProps {
  onLoginSuccess: (player: PlayerRegistration) => void;
  onBack: () => void;
  onRegister: () => void;
}

const SimpleOTPLoginScreen: React.FC<SimpleOTPLoginScreenProps> = ({
  onLoginSuccess,
  onBack,
  onRegister,
}) => {
  // State management
  const [step, setStep] = useState<'contact' | 'otp' | 'password'>('contact');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    otp: '',
    password: '',
  });
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [otpId, setOtpId] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Form Validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (step === 'contact') {
      if (loginMethod === 'email') {
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
      } else {
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
          newErrors.phone = 'Phone number is invalid';
        }
      }
    } else if (step === 'otp') {
      if (!formData.otp.trim()) {
        newErrors.otp = 'OTP is required';
      } else if (formData.otp.length !== 6) {
        newErrors.otp = 'OTP must be 6 digits';
      }
    } else if (step === 'password') {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const contact = loginMethod === 'email' ? formData.email : formData.phone;
      const response = await authService.sendOTP(contact, loginMethod);
      
      if (response.success) {
        setOtpId(response.otpId || '');
        setStep('otp');
        setCountdown(60);
        Alert.alert('OTP Sent', response.message);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      // For testing purposes, still show OTP screen even if network fails
      console.log('Network error, but showing OTP screen for testing');
      setOtpId('test-otp-id');
      setStep('otp');
      setCountdown(60);
      Alert.alert('Demo Mode', 'Network error, but you can test with OTP: 123456');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const contact = loginMethod === 'email' ? formData.email : formData.phone;
      const response = await authService.verifyOTP(otpId, formData.otp, contact);
      
      if (response.success && response.user && response.token) {
        Alert.alert('Success', 'Login successful!');
        onLoginSuccess(response.user);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      // For testing purposes, accept OTP 123456 even if network fails
      if (formData.otp === '123456') {
        console.log('Demo mode: Accepting OTP 123456');
        const mockUser = {
          id: 'demo-user-1',
          name: 'Demo User',
          email: loginMethod === 'email' ? formData.email : '',
          phone: loginMethod === 'phone' ? formData.phone : '',
          preferredRole: 'batsman' as const,
          location: 'Demo City',
          experience: 'intermediate' as const,
          battingStyle: 'right-handed' as const,
          bowlingStyle: 'right-arm fast' as const,
          matches: 0,
          runs: 0,
          wickets: 0,
          average: 0,
          strikeRate: 0,
        };
        Alert.alert('Demo Success', 'Login successful with demo OTP!');
        onLoginSuccess(mockUser);
      } else {
        Alert.alert('Error', 'OTP verification failed. Try 123456 for demo mode.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password Login
  const handlePasswordLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const contact = loginMethod === 'email' ? formData.email : formData.phone;
      const response = await authService.loginWithPassword(contact, formData.password, loginMethod);
      
      if (response.success && response.user && response.token) {
        Alert.alert('Success', 'Login successful!');
        onLoginSuccess(response.user);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {step === 'contact' ? 'Sending OTP...' : 
             step === 'otp' ? 'Verifying OTP...' : 
             'Signing in...'}
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content}>
        {step === 'contact' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Enter Your Contact</Text>
            <Text style={styles.stepSubtitle}>
              We'll send you a verification code
            </Text>

          {/* Login Method Selection - Simplified */}
          <View style={styles.methodContainer}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'email' && styles.methodButtonActive
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <Text style={[
                styles.methodButtonText,
                loginMethod === 'email' && styles.methodButtonTextActive
              ]}>
                📧 Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'phone' && styles.methodButtonActive
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Text style={[
                styles.methodButtonText,
                loginMethod === 'phone' && styles.methodButtonTextActive
              ]}>
                📱 Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </Text>
            <TextInput
              style={[styles.input, errors[loginMethod] && styles.inputError]}
              placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
              value={loginMethod === 'email' ? formData.email : formData.phone}
              onChangeText={(text) => setFormData({
                ...formData,
                [loginMethod]: text
              })}
              keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
            {errors[loginMethod] && (
              <Text style={styles.errorText}>{errors[loginMethod]}</Text>
            )}
          </View>

          {/* Auth Method Selection - Simplified */}
          <View style={styles.authMethodContainer}>
            <Text style={styles.authMethodLabel}>Choose authentication method:</Text>
            <View style={styles.authMethodButtons}>
              <TouchableOpacity
                style={[
                  styles.authMethodButton,
                  authMethod === 'otp' && styles.authMethodButtonActive
                ]}
                onPress={() => setAuthMethod('otp')}
              >
                <Text style={[
                  styles.authMethodButtonText,
                  authMethod === 'otp' && styles.authMethodButtonTextActive
                ]}>
                  🔐 OTP
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.authMethodButton,
                  authMethod === 'password' && styles.authMethodButtonActive
                ]}
                onPress={() => setAuthMethod('password')}
              >
                <Text style={[
                  styles.authMethodButtonText,
                  authMethod === 'password' && styles.authMethodButtonTextActive
                ]}>
                  🔑 Password
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <Button
            title={authMethod === 'otp' ? 'Send OTP' : 'Continue with Password'}
            onPress={authMethod === 'otp' ? handleSendOTP : () => setStep('password')}
            style={styles.continueButton}
            disabled={isLoading}
          />
        </View>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Enter OTP</Text>
            <Text style={styles.stepSubtitle}>
              We sent a 6-digit code to your {loginMethod}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={[styles.input, errors.otp && styles.inputError]}
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChangeText={(text) => setFormData({ ...formData, otp: text })}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
              {errors.otp && (
                <Text style={styles.errorText}>{errors.otp}</Text>
              )}
            </View>

            <Button
              title="Verify OTP"
              onPress={handleVerifyOTP}
              style={styles.continueButton}
              disabled={isLoading}
            />
          </View>
        )}

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onRegister}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
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
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SIZES.padding,
  },
  backText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  stepContainer: {
    paddingVertical: SIZES.padding * 2,
  },
  stepTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  stepSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.padding * 2,
  },
  methodContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.padding * 2,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    alignItems: 'center',
    borderRadius: SIZES.radius - 4,
    backgroundColor: 'transparent',
  },
  methodButtonActive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodButtonText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  methodButtonTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: SIZES.padding,
  },
  inputLabel: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.base,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    fontSize: SIZES.font,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: SIZES.base / 2,
  },
  authMethodContainer: {
    marginBottom: SIZES.padding * 2,
  },
  authMethodLabel: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  authMethodButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  authMethodButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    alignItems: 'center',
    borderRadius: SIZES.radius - 4,
    backgroundColor: 'transparent',
  },
  authMethodButtonActive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  authMethodButtonText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  authMethodButtonTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  continueButton: {
    marginTop: SIZES.padding,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.padding * 2,
  },
  registerText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  registerLink: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    marginTop: SIZES.base,
  },
});

export default SimpleOTPLoginScreen;
