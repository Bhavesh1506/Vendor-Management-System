import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getAllTransactions } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const vendorId = auth.currentUser?.uid;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!vendorId) return;

    try {
      const transactions = await getAllTransactions(vendorId);
      const total = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
      setTotalSales(total);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.email}>{auth.currentUser?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Total Sales</Text>
        <Text style={styles.statsValue}>₹{totalSales.toFixed(2)}</Text>
        <Text style={styles.statsSubtext}>All time transactions</Text>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => navigation.navigate('Customers')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>👥</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuCardTitle}>Manage Customers</Text>
            <Text style={styles.menuCardSubtitle}>View and add customers</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => {
            // Refresh data when coming back
            navigation.addListener('focus', loadDashboardData);
            navigation.navigate('Customers');
          }}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📝</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuCardTitle}>Transactions</Text>
            <Text style={styles.menuCardSubtitle}>Record daily sales</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    margin: 20,
    marginTop: 10,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: '#6366f1',
  },
  statsLabel: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '600',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statsSubtext: {
    fontSize: 14,
    color: '#c7d2fe',
  },
  menuContainer: {
    padding: 20,
    paddingTop: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  menuCardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  menuArrow: {
    fontSize: 32,
    color: '#6366f1',
    fontWeight: 'bold',
  },
});
