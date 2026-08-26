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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, Mail, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, register, adminLogin } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchRole = (admin: boolean) => {
    setIsAdmin(admin);
    setError('');
    if (admin) {
      setIsRegister(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    if (isRegister && !name) {
      setError('Please enter your name');
      return;
    }
    if (isRegister && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else if (isAdmin) {
        await adminLogin(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.gradientContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <ShoppingBag size={28} color="#00d2ff" style={{ marginRight: 8 }} />
            <Text style={styles.brandTitle}>RetailFlow</Text>
          </View>

          <View style={styles.roleSwitch}>
            <TouchableOpacity
              style={[styles.roleButton, !isAdmin && styles.roleButtonActive]}
              onPress={() => switchRole(false)}
              activeOpacity={0.8}
            >
              <ShoppingBag size={16} color={!isAdmin ? '#0F2027' : '#8A95A5'} style={{ marginRight: 6 }} />
              <Text style={[styles.roleButtonText, !isAdmin && styles.roleButtonTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, isAdmin && styles.roleButtonActive]}
              onPress={() => switchRole(true)}
              activeOpacity={0.8}
            >
              <ShieldCheck size={16} color={isAdmin ? '#0F2027' : '#8A95A5'} style={{ marginRight: 6 }} />
              <Text style={[styles.roleButtonText, isAdmin && styles.roleButtonTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isAdmin ? 'Admin Login' : isRegister ? 'Create Account' : 'Welcome Back'}
            </Text>

            {!!error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#FF6B6B" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!isAdmin && (
              <TouchableOpacity
                style={styles.modeToggle}
                onPress={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modeToggleText}>
                  {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
                </Text>
              </TouchableOpacity>
            )}

            {isRegister && !isAdmin && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#8A95A5" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#5F6B7C"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#8A95A5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={isAdmin ? 'Admin Email' : 'Email Address'}
                  placeholderTextColor="#5F6B7C"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#8A95A5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#5F6B7C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0F2027" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {isRegister ? 'Create Account' : isAdmin ? 'Admin Sign In' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.hint}>
              Default admin: admin@retailflow.com / Admin@123
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 9
  },
  roleButtonActive: {
    backgroundColor: '#00d2ff'
  },
  roleButtonText: {
    color: '#8A95A5',
    fontSize: 13,
    fontWeight: '600'
  },
  roleButtonTextActive: {
    color: '#0F2027',
    fontWeight: 'bold'
  },
  card: {
    width: Math.min(width - 32, 350),
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 14
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)'
  },
  errorText: {
    color: '#FF8E8E',
    fontSize: 12,
    flex: 1,
    fontWeight: '500'
  },
  modeToggle: {
    marginBottom: 14,
    alignSelf: 'center'
  },
  modeToggleText: {
    color: '#00d2ff',
    fontSize: 13,
    fontWeight: '600'
  },
  inputContainer: {
    marginBottom: 14
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    height: 46,
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    color: '#ffffff',
    flex: 1,
    fontSize: 14,
    height: '100%'
  },
  button: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#00d2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#0F2027',
    fontSize: 15,
    fontWeight: 'bold'
  },
  hint: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16
  }
});
