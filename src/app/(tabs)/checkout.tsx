import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { router } from 'expo-router';
import { placeOrder, PaymentMethod, Order } from '@/api/orders';
import { useCart } from '@/context/cart-context';

const METHODS: PaymentMethod[] = ['JazzCash', 'Easypaisa'];

export default function CheckoutScreen() {
  const { items, total, refresh } = useCart();
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('JazzCash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const handlePlace = async () => {
    if (!address.trim()) {
      setError('Shipping address is required');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const created = await placeOrder(address.trim(), method);
      setOrder(created);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{order ? 'Order placed' : 'Checkout'}</Text>
      </View>

      {order ? (
        <View style={styles.centered}>
          <Text style={styles.confirmTitle}>Order confirmed</Text>
          <Text style={styles.confirmId}>Order ID</Text>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.status}>Status: {order.status}</Text>
          <Text style={styles.total}>PKR {order.totalAmount.toLocaleString()}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/orders')} activeOpacity={0.85}>
            <Text style={styles.buttonText}>View orders</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Shipping address</Text>
            <TextInput
              style={styles.input}
              placeholder="House, street, city"
              placeholderTextColor="#8A95A5"
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <Text style={styles.label}>Payment method</Text>
            <View style={styles.methods}>
              {METHODS.map((item) => {
                const selected = item === method;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.method, selected && styles.methodSelected]}
                    onPress={() => setMethod(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.methodText, selected && styles.methodTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Order summary</Text>
            {items.map((item) => (
              <View key={item.productId} style={styles.line}>
                <Text style={styles.lineName} numberOfLines={1}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={styles.linePrice}>PKR {(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
            <View style={styles.line}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>PKR {total.toLocaleString()}</Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handlePlace}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#0F2027" />
              ) : (
                <Text style={styles.buttonText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8
  },
  back: {
    color: '#00d2ff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 16
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  label: {
    color: '#8A95A5',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    minHeight: 80,
    padding: 14,
    textAlignVertical: 'top',
    marginBottom: 8
  },
  methods: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8
  },
  method: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)'
  },
  methodSelected: {
    backgroundColor: '#00d2ff',
    borderColor: '#00d2ff'
  },
  methodText: {
    color: '#8A95A5',
    fontWeight: '700'
  },
  methodTextSelected: {
    color: '#0F2027'
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  lineName: {
    color: '#ffffff',
    flex: 1,
    marginRight: 12
  },
  linePrice: {
    color: '#C5CED8'
  },
  totalLabel: {
    color: '#8A95A5',
    fontSize: 15
  },
  total: {
    color: '#00d2ff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  error: {
    color: '#FF6B6B',
    marginTop: 8,
    marginBottom: 8
  },
  button: {
    backgroundColor: '#00d2ff',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#0F2027',
    fontSize: 16,
    fontWeight: 'bold'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  confirmTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16
  },
  confirmId: {
    color: '#8A95A5',
    fontSize: 13
  },
  orderId: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center'
  },
  status: {
    color: '#00d2ff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6
  }
});
