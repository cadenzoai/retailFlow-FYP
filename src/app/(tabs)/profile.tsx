import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { User, LogOut, Mail } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <View style={styles.infoRow}>
          <Mail size={16} color="#8A95A5" />
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Text style={styles.role}>{user?.role === 'admin' ? 'Administrator' : 'Customer'}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <LogOut size={18} color="#FF6B6B" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#00d2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  avatarText: {
    color: '#0F2027',
    fontSize: 34,
    fontWeight: 'bold'
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  email: {
    color: '#8A95A5',
    fontSize: 14,
    marginLeft: 6
  },
  role: {
    color: '#00d2ff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 28
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600'
  }
});
