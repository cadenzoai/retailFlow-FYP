import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Package } from 'lucide-react-native';
import { getMyOrders, Order } from '@/api/orders';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const next = await getMyOrders();
      setOrders(next);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00d2ff" />
        </View>
      ) : error && orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Could not load orders</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#00d2ff" colors={['#00d2ff']} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Package size={64} color="#2C5364" />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Orders you place will show up here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.status}>{item.status}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
              {item.items.map((line, index) => (
                <Text key={`${item.id}-${index}`} style={styles.line}>
                  {line.productName} x {line.quantity}
                </Text>
              ))}
              <Text style={styles.meta}>{item.paymentMethod}</Text>
              <Text style={styles.total}>PKR {item.totalAmount.toLocaleString()}</Text>
            </View>
          )}
        />
      )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyList: {
    flexGrow: 1
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6
  },
  emptySubtitle: {
    color: '#8A95A5',
    fontSize: 13,
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    marginBottom: 12
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  status: {
    color: '#00d2ff',
    fontWeight: '700'
  },
  date: {
    color: '#8A95A5',
    fontSize: 12
  },
  line: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 2
  },
  meta: {
    color: '#8A95A5',
    fontSize: 12,
    marginTop: 8
  },
  total: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 4
  }
});
