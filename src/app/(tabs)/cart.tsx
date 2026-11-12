import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Href, router } from 'expo-router';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useCart } from '@/context/cart-context';

export default function CartScreen() {
  const { items, total, loading, error, refresh, setQuantity, removeItem } = useCart();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const run = async (productId: string, action: () => Promise<void>) => {
    setActionError('');
    setPendingId(productId);
    try {
      await action();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update cart');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00d2ff" />
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Could not load cart</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <ShoppingCart size={64} color="#2C5364" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add products from the catalog.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#00d2ff" colors={['#00d2ff']} />
            }
            renderItem={({ item }) => {
              const busy = pendingId === item.productId;
              return (
                <View style={styles.card}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.imageFallback]} />
                  )}
                  <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.price}>PKR {item.price.toLocaleString()}</Text>
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={styles.step}
                        disabled={busy || item.quantity <= 1}
                        onPress={() => run(item.productId, () => setQuantity(item.productId, item.quantity - 1))}
                      >
                        <Minus size={14} color="#ffffff" />
                      </TouchableOpacity>
                      <Text style={styles.qty}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.step}
                        disabled={busy || item.quantity >= item.stock}
                        onPress={() => run(item.productId, () => setQuantity(item.productId, item.quantity + 1))}
                      >
                        <Plus size={14} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.remove}
                        disabled={busy}
                        onPress={() => run(item.productId, () => removeItem(item.productId))}
                      >
                        <Trash2 size={16} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
          <View style={styles.footer}>
            {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>PKR {total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkout} onPress={() => router.push('/checkout' as Href)} activeOpacity={0.85}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    marginBottom: 12
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)'
  },
  imageFallback: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  details: {
    flex: 1,
    marginLeft: 12
  },
  name: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  price: {
    color: '#00d2ff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qty: {
    color: '#ffffff',
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center'
  },
  remove: {
    marginLeft: 'auto',
    padding: 6
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)'
  },
  actionError: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 8
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  totalLabel: {
    color: '#8A95A5',
    fontSize: 14
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  checkout: {
    backgroundColor: '#00d2ff',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkoutText: {
    color: '#0F2027',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
