import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const LoginScreen = () => {
    const router = useRouter();

    const goToCredentials = (userType: 'student' | 'teacher') => {
        router.push({
            pathname: '/credentials',
            params: { userType }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                    <Image
                        source={require('@/assets/images/sapient-logo.jpg')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>Sapient Heights</Text>
                <Text style={styles.subtitle}>International School</Text>
            </View>

            <View style={styles.buttonGroup}>
                <Pressable
                    style={styles.studentButton}
                    onPress={() => goToCredentials('student')}
                >
                    <Text style={styles.buttonText}>Sign in as Student</Text>
                </Pressable>

                <Pressable
                    style={styles.teacherButton}
                    onPress={() => goToCredentials('teacher')}
                >
                    <Text style={styles.buttonText}>Sign in as Teacher</Text>
                </Pressable>
            </View>

            <Text style={styles.footer}>© 2025 Sapient Heights. All rights reserved.</Text>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4ff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },

    // Updated circle for image
    logoCircle: {
        width: 90,
        height: 90,
        backgroundColor: '#ffffff',
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,

        // subtle shadow
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },

    // Image inside circle
    logoImage: {
        width: 60,
        height: 60,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        color: '#6b7280',
        fontSize: 14,
    },

    buttonGroup: {
        width: '100%',
        gap: 15,
    },
    studentButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    teacherButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 30,
        fontSize: 12,
        color: '#9ca3af',
    },
});
