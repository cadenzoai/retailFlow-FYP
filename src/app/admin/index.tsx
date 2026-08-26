import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { ShieldCheck, LogOut } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Admin Panel</Text>
          <Text style={styles.userNameText}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
          <LogOut size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ShieldCheck size={64} color="#00d2ff" />
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Product management and order management screens will appear here in the next steps.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2027',
    paddingTop: StatusBar.currentHeight || 0
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8
  },
  welcomeText: {
    color: '#8A95A5',
    fontSize: 14
  },
  userNameText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.15)'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6
  },
  subtitle: {
    color: '#8A95A5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  }
});
