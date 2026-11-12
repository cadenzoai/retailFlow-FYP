import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { getProduct, Product } from '@/api/products';
import { useCart } from '@/context/cart-context';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeIsError, setNoticeIsError] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!productId) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      try {
        const next = await getProduct(productId);
        if (active) setProduct(next);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Product not found');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [productId]);

  const outOfStock = !product || product.stock <= 0;

  const changeQuantity = (delta: number) => {
    if (!product) return;
    setQuantity((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAdd = async () => {
    if (!product || outOfStock) return;
    setNotice('');
    setNoticeIsError(false);
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setNotice('Added to cart');
    } catch (err) {
      setNoticeIsError(true);
      setNotice(err instanceof Error ? err.message : 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00d2ff" />
        </View>
      ) : error || !product ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Product not found</Text>
          <Text style={styles.errorText}>{error || 'This product is no longer available.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imageFallback]} />
          )}
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>PKR {product.price.toLocaleString()}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.stock}>{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</Text>

          {!outOfStock && (
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepButton} onPress={() => changeQuantity(-1)} activeOpacity={0.8}>
                <Minus size={18} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity style={styles.stepButton} onPress={() => changeQuantity(1)} activeOpacity={0.8}>
                <Plus size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {notice ? <Text style={noticeIsError ? styles.noticeError : styles.notice}>{notice}</Text> : null}

          <TouchableOpacity
            style={[styles.addButton, (outOfStock || adding) && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={outOfStock || adding}
            activeOpacity={0.85}
          >
            {adding ? (
              <ActivityIndicator color="#0F2027" />
            ) : (
              <Text style={styles.addButtonText}>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6
  },
  errorText: {
    color: '#8A95A5',
    fontSize: 13,
    textAlign: 'center'
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)'
  },
  imageFallback: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  category: {
    color: '#00d2ff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  name: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  price: {
    color: '#00d2ff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  description: {
    color: '#C5CED8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12
  },
  stock: {
    color: '#8A95A5',
    fontSize: 13,
    marginBottom: 18
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantity: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center'
  },
  notice: {
    color: '#00d2ff',
    fontSize: 13,
    marginBottom: 12
  },
  noticeError: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 12
  },
  addButton: {
    backgroundColor: '#00d2ff',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButtonDisabled: {
    backgroundColor: '#2C5364'
  },
  addButtonText: {
    color: '#0F2027',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
