import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import { PlayerRegistration } from '../types';

interface PlayerLoginScreenProps {
  onLoginSuccess: (player: PlayerRegistration) => void;
  onRegister: () => void;
  onBack: () => void;
}

const PlayerLoginScreen: React.FC<PlayerLoginScreenProps> = ({
  onLoginSuccess,
  onRegister,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication - in real app, this would be an API call
      const mockPlayer: PlayerRegistration = {
        id: '1',
        name: 'Virat Kohli',
        email: formData.email || 'virat@example.com',
        phone: formData.phone || '+91-9876543210',
        password: 'hashed_password',
        dateOfBirth: '1988-11-05',
        preferredRole: 'batsman',
        battingStyle: 'right-handed',
        experience: 'professional',
        location: 'Delhi',
        availability: [],
        stats: { matches: 100, runs: 5000, wickets: 0, average: 50.0, strikeRate: 120.0 },
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true,
      };

      onLoginSuccess(mockPlayer);
      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality would be implemented here. For now, use any email and password to login.',
      [{ text: 'OK' }]
    );
  };

  const renderInput = (label: string, value: string, onChange: (value: string) => void, error?: string, placeholder?: string, secureText?: boolean) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, error && styles.errorInput]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        secureTextEntry={secureText}
        autoCapitalize="none"
        keyboardType={label === 'Email' ? 'email-address' : 'default'}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏏 Player Login</Text>
          <Text style={styles.subtitle}>Welcome back! Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Login Method Selection */}
          <View style={styles.loginMethodContainer}>
            <Text style={styles.loginMethodLabel}>Login with:</Text>
            <View style={styles.loginMethodOptions}>
              <TouchableOpacity
                style={[
                  styles.loginMethodOption,
                  loginMethod === 'email' && styles.selectedLoginMethod,
                ]}
                onPress={() => setLoginMethod('email')}
              >
                <Text style={[
                  styles.loginMethodText,
                  loginMethod === 'email' && styles.selectedLoginMethodText,
                ]}>
                  📧 Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.loginMethodOption,
                  loginMethod === 'phone' && styles.selectedLoginMethod,
                ]}
                onPress={() => setLoginMethod('phone')}
              >
                <Text style={[
                  styles.loginMethodText,
                  loginMethod === 'phone' && styles.selectedLoginMethodText,
                ]}>
                  📱 Phone
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {loginMethod === 'email' ? (
            renderInput(
              'Email',
              formData.email,
              (value) => setFormData(prev => ({ ...prev, email: value })),
              errors.email,
              'Enter your email address'
            )
          ) : (
            renderInput(
              'Phone Number',
              formData.phone,
              (value) => setFormData(prev => ({ ...prev, phone: value })),
              errors.phone,
              'Enter your phone number'
            )
          )}

          {renderInput(
            'Password',
            formData.password,
            (value) => setFormData(prev => ({ ...prev, password: value })),
            errors.password,
            'Enter your password',
            true
          )}

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <Button
            title={isLoading ? "Signing In..." : "Sign In"}
            onPress={handleLogin}
            size="large"
            style={styles.loginButton}
            disabled={isLoading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Create New Account"
            onPress={onRegister}
            variant="outline"
            size="large"
            style={styles.registerButton}
          />

          <Button
            title="Back to Home"
            onPress={onBack}
            variant="outline"
            size="medium"
            style={styles.backButton}
          />
        </View>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Mode</Text>
          <Text style={styles.demoText}>
            For demonstration purposes, you can use any email and password to login.
            In a real app, this would connect to a proper authentication system.
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
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    marginTop: SIZES.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: SIZES.xxl,
  },
  inputContainer: {
    marginBottom: SIZES.lg,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: SIZES.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actions: {
    gap: SIZES.lg,
  },
  loginButton: {
    marginBottom: SIZES.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SIZES.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  registerButton: {
    marginBottom: SIZES.sm,
  },
  backButton: {
    marginBottom: SIZES.sm,
  },
  demoInfo: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginTop: SIZES.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  demoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  loginMethodContainer: {
    marginBottom: SIZES.lg,
  },
  loginMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  loginMethodOptions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  loginMethodOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedLoginMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  loginMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedLoginMethodText: {
    color: COLORS.primary,
  },
});

export default PlayerLoginScreen;
