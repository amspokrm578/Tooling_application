import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
// or for more security: import * as SecureStore from 'expo-secure-store';

type AuthMode = 'welcome' | 'login' | 'register' | 'main';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Check for existing token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Validate token with backend
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
          setAuthMode('main'); // Navigate to main app
        } else {
          // Token is invalid, remove it
          await AsyncStorage.removeItem('userToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('userToken', data.data.token);
        setUser(data.data.user);
        setAuthMode('main');
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('userToken', data.data.token);
        setUser(data.data.user);
        setAuthMode('main');
        Alert.alert('Success', 'Registration successful!');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const handleGuestContinue = () => {
    // TODO: Implement guest mode logic
    Alert.alert('Success', 'Continuing as guest - functionality will be implemented here');
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await fetch(`${API_URL}/api/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setAuthMode('welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderWelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Tool Shed</Text>
        <Text style={styles.tagline}>Share tools, build community</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setAuthMode('register')}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setAuthMode('login')}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.guestButton]}
          onPress={handleGuestContinue}
        >
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoginScreen = () => (
    <KeyboardAvoidingView
      style={styles.authContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.authHeader}>
          <Text style={styles.authTitle}>Welcome Back</Text>
          <Text style={styles.authSubtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setAuthMode('welcome')}
          >
            <Text style={styles.linkText}>Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderRegisterScreen = () => (
    <KeyboardAvoidingView
      style={styles.authContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.authHeader}>
          <Text style={styles.authTitle}>Create Account</Text>
          <Text style={styles.authSubtitle}>Join our community</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRegister}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setAuthMode('welcome')}
          >
            <Text style={styles.linkText}>Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (authMode === 'main' && user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, marginBottom: 16 }}>Welcome, {user.name}!</Text>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleLogout}>
            <Text style={styles.primaryButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {authMode === 'welcome' && renderWelcomeScreen()}
      {authMode === 'login' && renderLoginScreen()}
      {authMode === 'register' && renderRegisterScreen()}
    </SafeAreaView>
  );
}
