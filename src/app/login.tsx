import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// Detect if running inside Expo Go or Web browser
const isExpoGo = Constants.appOwnership === 'expo' || Platform.OS === 'web';

// Dynamically configure native Google Sign-in if NOT running in Expo Go
if (!isExpoGo) {
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      webClientId: '198566255315-lp6hbcvqetilq3bft6uno6pqgtejvuaq.apps.googleusercontent.com',
      offlineAccess: true,
    });
  } catch (e) {
    console.warn("Native Google Sign-In setup failed: ", e);
  }
}

const GOOGLE_ACCOUNTS = [
  { name: "Sarah Jenkins", email: "sarah.jenkins.google@gmail.com" },
  { name: "Alex Mercer", email: "alex.mercer.google@gmail.com" }
];

export default function LoginScreen() {
  const [step, setStep] = useState<'email' | 'password' | 'register'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleModalVisible, setGoogleModalVisible] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const validateEmail = (val: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(val);
  };

  const handleEmailCheck = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setStep('password');
      } else {
        setStep('register');
      }
    } catch (err: any) {
      console.error(err);
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError('');
    setSuccess('');
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Incorrect password.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Incorrect password. Try again.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    if (!name) {
      setError('Please enter your name');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email.toLowerCase().trim(),
        role: "user",
        createdAt: new Date()
      });
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Could not create account.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already in use.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      setSuccess('Password reset link sent to your email.');
    } catch (err: any) {
      console.error("Forgot password error:", err);
      let errMsg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        errMsg = 'No user found with this email.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Simulated Google Sign-In (Expo Go fallback)
  const handleGoogleSignInSimulated = async (gUser: typeof GOOGLE_ACCOUNTS[0]) => {
    setGoogleModalVisible(false);
    setGoogleLoading(true);
    setError('');

    const simulatedPassword = "GoogleUserMockPass123!";
    try {
      try {
        await signInWithEmailAndPassword(auth, gUser.email, simulatedPassword);
      } catch (loginErr: any) {
        if (loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/user-not-found') {
          const userCredential = await createUserWithEmailAndPassword(auth, gUser.email, simulatedPassword);
          await updateProfile(userCredential.user, {
            displayName: gUser.name
          });
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: gUser.name,
            email: gUser.email,
            role: "user",
            createdAt: new Date()
          });
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Google Sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google Sign-In Trigger
  const handleGoogleSignInPress = async () => {
    setError('');

    if (isExpoGo) {
      // In Expo Go, display the selector modal with simulated accounts
      setGoogleModalVisible(true);
    } else {
      // In compiled Development Builds, execute the actual native Google SDK flow
      setGoogleLoading(true);
      try {
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        await GoogleSignin.hasPlayServices();
        
        try {
          await GoogleSignin.signOut();
        } catch (e) {
          // ignore signout errors if not already signed in
        }

        const response = await GoogleSignin.signIn();
        const idToken = response.idToken;

        if (!idToken) {
          throw new Error('Google Sign-in failed: No ID Token retrieved.');
        }

        // Firebase Auth sign-in with Google Credential
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // Check/Write user record in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName || 'Google User',
            email: user.email?.toLowerCase().trim() || '',
            role: "user",
            createdAt: new Date()
          });
        }
      } catch (err: any) {
        console.error("Native Google Sign-In error:", err);
        
        let isCancelled = false;
        try {
          const { statusCodes } = require('@react-native-google-signin/google-signin');
          if (err.code === statusCodes.SIGN_IN_CANCELLED) {
            isCancelled = true;
          }
        } catch (e) {}

        if (err.code === 'SIGN_IN_CANCELLED' || 
            err.code === '12501' || 
            err.message?.toLowerCase().includes('cancel')) {
          isCancelled = true;
        }

        if (!isCancelled) {
          let errMsg = 'Google Sign-in failed.';
          if (err.code === '12500') {
            errMsg = 'Google Play Services configuration error. Check SHA-1 fingerprint in Firebase.';
          } else if (err.message) {
            errMsg = err.message;
          }
          setError(errMsg);
        }
      } finally {
        setGoogleLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep('email');
    setError('');
    setSuccess('');
    setPassword('');
  };

  return (
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Title Row */}
          <View style={styles.brandRow}>
            <ShoppingBag size={26} color="#00d2ff" style={{ marginRight: 8 }} />
            <Text style={styles.brandTitle}>RetailFlow</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Header of Card (Only visible on password/register steps) */}
            {step !== 'email' && (
              <View style={styles.cardHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ArrowLeft size={18} color="#00d2ff" />
                </TouchableOpacity>
                <Text style={styles.cardTitle}>
                  {step === 'password' && 'Enter Password'}
                  {step === 'register' && 'Complete Profile'}
                </Text>
              </View>
            )}

            {/* Error Area */}
            {!!error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#FF6B6B" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Success Area */}
            {!!success && (
              <View style={styles.successContainer}>
                <CheckCircle size={16} color="#4ADE80" style={{ marginRight: 6 }} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            {/* Step 1: Email Input */}
            {step === 'email' && (
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused
                ]}>
                  <Mail size={18} color={emailFocused ? "#00d2ff" : "#8A95A5"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#5F6B7C"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>
            )}

            {/* Step 2A: Password Input */}
            {step === 'password' && (
              <View>
                <Text style={styles.emailIndicator} numberOfLines={1}>{email}</Text>
                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputWrapperFocused
                  ]}>
                    <Lock size={18} color={passwordFocused ? "#00d2ff" : "#8A95A5"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#5F6B7C"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoFocus
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                  </View>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity 
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordButton}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2B: Register Input */}
            {step === 'register' && (
              <View>
                <Text style={styles.emailIndicator} numberOfLines={1}>{email}</Text>
                
                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper,
                    nameFocused && styles.inputWrapperFocused
                  ]}>
                    <User size={18} color={nameFocused ? "#00d2ff" : "#8A95A5"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#5F6B7C"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoFocus
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputWrapperFocused
                  ]}>
                    <Lock size={18} color={passwordFocused ? "#00d2ff" : "#8A95A5"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Choose Password"
                      placeholderTextColor="#5F6B7C"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.button, (loading || googleLoading) && styles.buttonDisabled]} 
              onPress={() => {
                if (step === 'email') handleEmailCheck();
                else if (step === 'password') handleSignIn();
                else if (step === 'register') handleRegister();
              }}
              disabled={loading || googleLoading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {step === 'email' && 'Continue'}
                  {step === 'password' && 'Sign In'}
                  {step === 'register' && 'Register & Enter'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            {step === 'email' && (
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            {/* Google Sign-in */}
            {step === 'email' && (
              <TouchableOpacity
                style={[styles.googleButton, (loading || googleLoading) && styles.buttonDisabled]}
                onPress={handleGoogleSignInPress}
                activeOpacity={0.8}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#1a202c" size="small" />
                ) : (
                  <>
                    <Image 
                      source={{ uri: 'https://developers.google.com/static/identity/images/g-logo.png' }}
                      style={styles.googleIcon} 
                      resizeMode="contain"
                    />
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Simulated Google Accounts Selector Modal (Expo Go fallback) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={googleModalVisible}
        onRequestClose={() => setGoogleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Google Account</Text>
            <Text style={styles.modalSubtitle}>Select an account to simulate verification</Text>
            
            {GOOGLE_ACCOUNTS.map((gUser, index) => (
              <TouchableOpacity
                key={index}
                style={styles.googleAccountItem}
                onPress={() => handleGoogleSignInSimulated(gUser)}
              >
                <View style={styles.avatarIcon}>
                  <Text style={styles.avatarText}>{gUser.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.googleAccountName}>{gUser.name}</Text>
                  <Text style={styles.googleAccountEmail}>{gUser.email}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setGoogleModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  card: {
    width: Math.min(width - 32, 350),
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  errorText: {
    color: '#FF8E8E',
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  successText: {
    color: '#4ADE80',
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 12,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: '#00d2ff',
    fontSize: 13,
    fontWeight: '600',
  },
  emailIndicator: {
    color: '#00d2ff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(0, 210, 255, 0.06)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    height: 46,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: '#00d2ff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    color: '#ffffff',
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  button: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#00d2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0F2027',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748B',
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#1a202c',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Math.min(width - 32, 340),
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  modalSubtitle: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
  },
  googleAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00d2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#0F2027',
    fontWeight: 'bold',
    fontSize: 14,
  },
  googleAccountName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  googleAccountEmail: {
    color: '#94A3B8',
    fontSize: 11,
  },
  closeModalButton: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  closeModalButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
