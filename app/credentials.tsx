import handleLogin from '@/api/login';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const CredentialScreen = () => {
  const router = useRouter();
  const { userType } = useLocalSearchParams<{ userType: 'student' | 'teacher' }>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onBack = () => router.back();

  const onSignIn = async () => {
    if (identifier === '' || password === '') {
      Toast.show({ type: 'error', text1: 'Required fields missing', text2: 'Please fill all the required fields' });
      return;
    }

    setIsLoading(true);
    const success = await handleLogin(identifier, password, rememberMe, userType);
    if (success) {
      if (userType === 'student') {
        router.replace('/student/dashboard');
      } else {
        router.replace('/teacher/dashboard');
      }
    } else {
      Toast.show({ type: 'error', text1: 'Some error occurred', text2: 'Try to login again' });
    }
    setIsLoading(false);
  };

  const goToForgetPassword = (userType: 'student' | 'teacher') => {
    router.push({
      pathname: '/forgetPassword',
      params: { userType }
    });
  }

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          {userType === 'student' ? (
            <Feather name="user" size={40} color="#6B46C1" />
          ) : (
            <Feather name="book" size={40} color="#6B46C1" />
          )}
        </View>

        <Text style={styles.title}>
          {userType === 'student' ? 'Student Login' : 'Teacher Login'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {userType === 'student' ? 'Roll Number / Email' : 'Employee ID / Email'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={userType === 'student' ? 'Enter roll number' : 'Enter employee ID'}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        {/* Password field with show/hide */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#6B46C1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rememberContainer}>
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkbox}>
            <Feather name={rememberMe ? 'check-square' : 'square'} size={20} color="#6B46C1" />
          </TouchableOpacity>
          <Text style={styles.rememberText}>Remember me</Text>

          <TouchableOpacity onPress={() => goToForgetPassword(userType)}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onSignIn} style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign In</Text>
          <Feather name="chevron-right" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CredentialScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2FF', justifyContent: 'center', padding: 16 },
  innerContainer: { backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  backButton: { marginBottom: 20 },
  backButtonText: { color: '#6B46C1', fontWeight: '600', fontSize: 16 },
  iconContainer: { alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', textAlign: 'center', marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: '#2D3748' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  eyeButton: {
    padding: 8,
  },
  rememberContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  checkbox: { marginRight: 8 },
  rememberText: { flex: 1, fontSize: 14, color: '#4A5568' },
  forgotText: { color: '#6B46C1', fontWeight: '600', fontSize: 14 },
  signInButton: { flexDirection: 'row', backgroundColor: '#6B46C1', paddingVertical: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  signInButtonText: { color: 'white', fontWeight: '700', fontSize: 16, marginRight: 8 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" }
});
