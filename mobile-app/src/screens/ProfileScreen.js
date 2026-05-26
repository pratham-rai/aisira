import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';

export default function ProfileScreen({ navigation }) {
  const { 
    user, 
    login, 
    register, 
    verifyEmail, 
    resendVerification, 
    forgotPassword, 
    resetPassword, 
    logout 
  } = useContext(AuthContext);

  // mode: 'login' | 'register' | 'forgot' | 'reset' | 'verify'
  const [mode, setMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Verification states
  const [authEmail, setAuthEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  // Password reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuthSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);

    if (mode === 'register') {
      if (!displayName) {
        Alert.alert('Error', 'Please enter your Full Name');
        setLoading(false);
        return;
      }
      const result = await register(email, password, displayName);
      if (result.success) {
        setAuthEmail(email);
        setMode('verify');
        Alert.alert('Success', 'Verification code sent to your email!');
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    } else {
      // login
      const result = await login(email, password);
      if (result.success) {
        Alert.alert('Welcome Back', 'Signed in successfully!');
      } else {
        if (result.needsVerification) {
          setAuthEmail(email);
          setMode('verify');
          Alert.alert('Verification Needed', result.error);
        } else {
          Alert.alert('Login Failed', result.error);
        }
      }
    }
    setLoading(false);
  };

  const handleVerifySubmit = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    const result = await verifyEmail(authEmail, verifyCode);
    if (result.success) {
      Alert.alert('Success', 'Email verified! Welcome to Aisira.');
      setMode('login');
    } else {
      Alert.alert('Verification Failed', result.error);
    }
    setLoading(false);
  };

  const handleResendVerify = async () => {
    setLoading(true);
    const result = await resendVerification(authEmail);
    if (result.success) {
      Alert.alert('Success', 'A new verification code has been sent!');
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleForgotSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your registered email');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) {
      setResetEmail(email);
      setMode('reset');
      Alert.alert('Success', 'Reset code sent! Check your inbox.');
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleResetSubmit = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await resetPassword(resetEmail, resetCode, newPassword);
    if (result.success) {
      Alert.alert('Success', 'Password reset successfully! Please sign in.');
      setMode('login');
      setPassword('');
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleContinueAsGuest = () => {
    Alert.alert('Guest Mode', 'Browsing as Guest');
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('HomeMain');
    }
  };

  if (user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.logo} 
              defaultSource={require('../../assets/images/icon.png')}
            />
            <Text style={styles.logoText}>Aisira</Text>
            <Text style={styles.tagline}>The Digital Nidhi of Tulunadu Culture</Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Full Name</Text>
              <Text style={styles.profileValue}>{user.displayName}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Email Address</Text>
              <Text style={styles.profileValue}>{user.email}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Account Role</Text>
              <Text style={[styles.profileValue, styles.roleBadge]}>{user.role}</Text>
            </View>

            <Button 
              title="Sign Out" 
              variant="secondary" 
              onPress={logout} 
              style={{ marginTop: 24 }} 
            />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎭</Text>
          <Text style={styles.logoText}>Aisira</Text>
          <Text style={styles.tagline}>The Digital Nidhi of Tulunadu Culture</Text>
        </View>

        <GlassCard style={styles.card}>
          {mode === 'login' && (
            <View>
              <Text style={styles.formTitle}>Sign In</Text>
              
              <Input 
                label="Email *" 
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <View style={styles.passwordWrapper}>
                <Input 
                  label="Password *" 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{fontSize: 18}}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotBtn} 
                onPress={() => setMode('forgot')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button 
                title="Sign In" 
                onPress={handleAuthSubmit} 
                loading={loading}
                style={styles.submitBtn}
              />
              
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button 
                title="👁️ Continue as Guest" 
                variant="secondary"
                onPress={handleContinueAsGuest}
                style={styles.guestBtn}
              />

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => setMode('register')}>
                  <Text style={styles.toggleLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'register' && (
            <View>
              <Text style={styles.formTitle}>Create Account</Text>

              <Input 
                label="Full Name *" 
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
              />
              
              <Input 
                label="Email *" 
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <View style={styles.passwordWrapper}>
                <Input 
                  label="Password *" 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password (min 6 chars)"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{fontSize: 18}}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              <Button 
                title="Create Account" 
                onPress={handleAuthSubmit} 
                loading={loading}
                style={styles.submitBtn}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button 
                title="👁️ Continue as Guest" 
                variant="secondary"
                onPress={handleContinueAsGuest}
                style={styles.guestBtn}
              />

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => setMode('login')}>
                  <Text style={styles.toggleLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'forgot' && (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.iconBig}>🔒</Text>
              <Text style={styles.formTitle}>Forgot Password?</Text>
              <Text style={styles.subtext}>Enter your email and we'll send you a reset code</Text>

              <View style={{ width: '100%', marginTop: 16 }}>
                <Input 
                  label="Email *" 
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your registered email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Button 
                title="📧 Send Reset Code" 
                onPress={handleForgotSubmit} 
                loading={loading}
                style={[styles.submitBtn, { width: '100%' }]}
              />

              <TouchableOpacity 
                style={{ marginTop: 20 }}
                onPress={() => setMode('login')}
              >
                <Text style={styles.toggleLink}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'verify' && (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.iconBig}>📧</Text>
              <Text style={styles.formTitle}>Verify your Email</Text>
              <Text style={styles.subtext}>
                Enter the 6-digit code sent to {'\n'}
                <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{authEmail}</Text>
              </Text>

              <View style={{ width: '100%', marginTop: 20 }}>
                <Input 
                  label="Verification Code *" 
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                  placeholder="------"
                  maxLength={6}
                  keyboardType="number-pad"
                  style={styles.codeInput}
                />
              </View>

              <Button 
                title="✅ Verify & Log In" 
                onPress={handleVerifySubmit} 
                loading={loading}
                style={[styles.submitBtn, { width: '100%' }]}
              />

              <View style={styles.verifyActions}>
                <TouchableOpacity onPress={handleResendVerify}>
                  <Text style={styles.toggleLink}>Resend code</Text>
                </TouchableOpacity>
                <Text style={{color: theme.colors.textMuted}}>  ·  </Text>
                <TouchableOpacity onPress={() => setMode('login')}>
                  <Text style={styles.toggleLink}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'reset' && (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.iconBig}>🔑</Text>
              <Text style={styles.formTitle}>Enter Reset Code</Text>
              <Text style={styles.subtext}>
                Code sent to <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{resetEmail}</Text>
              </Text>

              <View style={{ width: '100%', marginTop: 16 }}>
                <Input 
                  label="6-Digit Code *" 
                  value={resetCode}
                  onChangeText={setResetCode}
                  placeholder="------"
                  maxLength={6}
                  keyboardType="number-pad"
                  style={styles.codeInput}
                />

                <View style={styles.passwordWrapper}>
                  <Input 
                    label="New Password *" 
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={{fontSize: 18}}>{showPassword ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordWrapper}>
                  <Input 
                    label="Confirm Password *" 
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={{fontSize: 18}}>{showPassword ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button 
                title="🔑 Reset Password" 
                onPress={handleResetSubmit} 
                loading={loading}
                style={[styles.submitBtn, { width: '100%' }]}
              />

              <View style={styles.verifyActions}>
                <TouchableOpacity onPress={handleForgotSubmit}>
                  <Text style={styles.toggleLink}>Resend code</Text>
                </TouchableOpacity>
                <Text style={{color: theme.colors.textMuted}}>  ·  </Text>
                <TouchableOpacity onPress={() => setMode('login')}>
                  <Text style={styles.toggleLink}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoEmoji: {
    fontSize: 54,
    marginBottom: 8,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    padding: 24,
    backgroundColor: 'rgba(20, 25, 45, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    top: 36,
    padding: 8,
    zIndex: 10,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotText: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    marginTop: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerText: {
    color: theme.colors.textMuted,
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  guestBtn: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  toggleLink: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  iconBig: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  verifyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  profileValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  roleBadge: {
    backgroundColor: 'rgba(212, 163, 89, 0.15)',
    color: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
    textTransform: 'uppercase',
  }
});
