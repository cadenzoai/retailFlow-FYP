import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { LogOut, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';
import { Product } from '@/api/products';
import { Order } from '@/api/orders';
import * as adminApi from '@/api/admin';
import { ProductInput } from '@/api/admin';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  image: ''
};

const MAX_IMAGE_LENGTH = 700000;

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    const next = await adminApi.getAdminProducts();
    setProducts(next);
  }, []);

  const loadOrders = useCallback(async () => {
    const next = await adminApi.getAllOrders();
    setOrders(next);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadProducts(), loadOrders()]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadOrders]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      image: product.image || ''
    });
    setFormError('');
    setFormOpen(true);
  };

  const saveProduct = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name || !description || !category) {
      setFormError('Name, description, and category are required');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError('Price must be a non-negative number');
      return;
    }
    if (form.stock.trim() === '' || !Number.isInteger(stock) || stock < 0) {
      setFormError('Stock must be a non-negative integer');
      return;
    }

    if (form.image.length > MAX_IMAGE_LENGTH) {
      setFormError('Image is too large. Choose a smaller photo.');
      return;
    }

    const input: ProductInput = { name, description, price, stock, category, image: form.image };

    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await adminApi.updateProduct(editing.id, input);
      } else {
        await adminApi.createProduct(input);
      }
      await loadProducts();
      setFormOpen(false);
      setNotice('Product saved');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFormError('Photo access is needed to upload a product image.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    });

    if (picked.canceled || !picked.assets[0]) return;

    const resized = await ImageManipulator.manipulateAsync(
      picked.assets[0].uri,
      [{ resize: { width: 640 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!resized.base64) {
      setFormError('Could not read that photo. Try another one.');
      return;
    }

    const image = `data:image/jpeg;base64,${resized.base64}`;
    if (image.length > MAX_IMAGE_LENGTH) {
      setFormError('Image is too large. Choose a smaller photo.');
      return;
    }

    setFormError('');
    setForm((current) => ({ ...current, image }));
  };

  const confirmDelete = (product: Product) => {
    Alert.alert('Delete product', `Delete ${product.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi.deleteProduct(product.id);
            await loadProducts();
            setNotice('Product deleted');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete product');
          }
        }
      }
    ]);
  };

  const changeStatus = async (order: Order, status: string) => {
    if (order.status === status) return;
    try {
      const updated = await adminApi.updateOrderStatus(order.id, status);
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: updated.status } : item)));
      setNotice(`Order marked ${updated.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status');
    }
  };

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

      <View style={styles.switch}>
        <TouchableOpacity
          style={[styles.switchButton, section === 'products' && styles.switchButtonActive]}
          onPress={() => setSection('products')}
        >
          <Text style={[styles.switchText, section === 'products' && styles.switchTextActive]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, section === 'orders' && styles.switchButtonActive]}
          onPress={() => setSection('orders')}
        >
          <Text style={[styles.switchText, section === 'orders' && styles.switchTextActive]}>Orders</Text>
        </TouchableOpacity>
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00d2ff" />
        </View>
      ) : section === 'products' ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={products.length === 0 ? styles.emptyList : styles.list}
          ListHeaderComponent={
            <TouchableOpacity style={styles.addButton} onPress={openCreate} activeOpacity={0.85}>
              <Text style={styles.addButtonText}>Add product</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <ShieldCheck size={48} color="#2C5364" />
              <Text style={styles.emptyTitle}>No products yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.category} · PKR {item.price.toLocaleString()} · Stock {item.stock}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Text style={styles.danger}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No orders yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.customerName || 'Customer'}</Text>
              {item.customerEmail ? <Text style={styles.cardMeta}>{item.customerEmail}</Text> : null}
              {item.items.map((line, index) => (
                <Text key={`${item.id}-${index}`} style={styles.cardMeta}>
                  {line.productName} x {line.quantity}
                </Text>
              ))}
              <Text style={styles.cardMeta}>PKR {item.totalAmount.toLocaleString()}</Text>
              <View style={styles.statuses}>
                {STATUSES.map((status) => {
                  const selected = item.status === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[styles.statusChip, selected && styles.statusChipSelected]}
                      onPress={() => changeStatus(item, status)}
                    >
                      <Text style={[styles.statusText, selected && styles.statusTextSelected]}>{status}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={formOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit product' : 'Add product'}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {([
                ['name', 'Name'],
                ['price', 'Price'],
                ['stock', 'Stock'],
                ['category', 'Category']
              ] as const).map(([key, label]) => (
                <TextInput
                  key={key}
                  style={styles.input}
                  placeholder={label}
                  placeholderTextColor="#8A95A5"
                  value={form[key]}
                  onChangeText={(text) => setForm((current) => ({ ...current, [key]: text }))}
                  keyboardType={key === 'price' || key === 'stock' ? 'numeric' : 'default'}
                  autoCapitalize="none"
                />
              ))}
              <Text style={styles.imageLabel}>Product image</Text>
              {form.image ? (
                <Image source={{ uri: form.image }} style={styles.preview} />
              ) : (
                <View style={[styles.preview, styles.previewEmpty]}>
                  <Text style={styles.cardMeta}>No image selected</Text>
                </View>
              )}
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.85}>
                  <Text style={styles.uploadText}>{form.image ? 'Change image' : 'Upload image'}</Text>
                </TouchableOpacity>
                {form.image ? (
                  <TouchableOpacity onPress={() => setForm((current) => ({ ...current, image: '' }))}>
                    <Text style={styles.danger}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                placeholderTextColor="#8A95A5"
                value={form.description}
                onChangeText={(text) => setForm((current) => ({ ...current, description: text }))}
                multiline
              />
              {formError ? <Text style={styles.error}>{formError}</Text> : null}
              <TouchableOpacity style={styles.addButton} onPress={saveProduct} disabled={saving}>
                {saving ? <ActivityIndicator color="#0F2027" /> : <Text style={styles.addButtonText}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFormOpen(false)} style={styles.cancel}>
                <Text style={styles.link}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  switch: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 4
  },
  switchButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  switchButtonActive: {
    backgroundColor: '#00d2ff'
  },
  switchText: {
    color: '#8A95A5',
    fontWeight: '700'
  },
  switchTextActive: {
    color: '#0F2027'
  },
  notice: {
    color: '#00d2ff',
    paddingHorizontal: 20,
    marginBottom: 6
  },
  error: {
    color: '#FF6B6B',
    paddingHorizontal: 20,
    marginBottom: 6
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 20
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12
  },
  addButton: {
    backgroundColor: '#00d2ff',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  addButtonText: {
    color: '#0F2027',
    fontWeight: 'bold',
    fontSize: 15
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    marginBottom: 12
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  cardMeta: {
    color: '#8A95A5',
    fontSize: 13,
    marginTop: 4
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10
  },
  link: {
    color: '#00d2ff',
    fontWeight: '700'
  },
  danger: {
    color: '#FF6B6B',
    fontWeight: '700'
  },
  statuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10
  },
  statusChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  statusChipSelected: {
    backgroundColor: '#00d2ff',
    borderColor: '#00d2ff'
  },
  statusText: {
    color: '#8A95A5',
    fontSize: 11,
    fontWeight: '700'
  },
  statusTextSelected: {
    color: '#0F2027'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#152833',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%'
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    height: 46,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top'
  },
  imageLabel: {
    color: '#8A95A5',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)'
  },
  previewEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12
  },
  uploadButton: {
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  uploadText: {
    color: '#00d2ff',
    fontWeight: '700'
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 12
  }
});
