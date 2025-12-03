import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { seedDatabase } from '../utils/seedData';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      window.alert('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create vendor document for this user
        await setDoc(doc(db, 'vendors', userCredential.user.uid), {
          email: email,
          createdAt: new Date(),
          businessName: 'My Dairy Business'
        });
        
        window.alert('Account created successfully! You can now use the app.');
      } else {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Navigation will be handled by auth state listener
    } catch (error) {
      console.error('Auth error:', error);
      window.alert((isSignup ? 'Signup' : 'Login') + ' Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedDatabase();
      if (result.success) {
        window.alert(result.message + '\n\nEmail: vendor@test.com\nPassword: test123');
        setEmail('vendor@test.com');
        setPassword('test123');
      } else {
        window.alert(result.message);
      }
    } catch (error) {
      console.error('Seeding error:', error);
      window.alert('Failed to seed database: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🥛 Dairy Management</Text>
        <Text style={styles.subtitle}>Vendor Portal</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="vendor@test.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSignup ? 'Create Account' : 'Login'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setIsSignup(!isSignup)}
        >
          <Text style={styles.toggleButtonText}>
            {isSignup ? 'Already have an account? Login' : 'New user? Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={[styles.seedButton, seeding && styles.buttonDisabled]}
          onPress={handleSeedData}
          disabled={seeding}
        >
          {seeding ? (
            <ActivityIndicator color="#6366f1" />
          ) : (
            <>
              <Text style={styles.seedButtonIcon}>🌱</Text>
              <Text style={styles.seedButtonText}>Seed Database (Demo)</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Click "Seed Database" to create demo data for testing
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '500',
  },
  form: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#475569',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#475569',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  seedButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  seedButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  seedButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
});
