import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const ForgetPassword = () => {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const { userType } = useLocalSearchParams<{ userType: 'student' | 'teacher' }>();

    const onBack = () => router.back();

    const onSubmit = () => {
        
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
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
                    {'Forget Password'}
                </Text>

                <View style={styles.formGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder={userType === 'student' ? 'Enter ID' : 'Enter Teacher or Email ID'}
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                    />
                </View>

                <TouchableOpacity onPress={onSubmit} style={styles.signInButton}>
                    <Text style={styles.signInButtonText}>Submit</Text>
                    <Feather name="chevron-right" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default ForgetPassword;

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