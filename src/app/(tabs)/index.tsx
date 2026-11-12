import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { Href, router } from 'expo-router';
import { Search, LogOut, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';
import { getProducts, Product } from '@/api/products';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Accessories'];

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const applyFilters = (allItems: Product[], search: string, category: string) => {
    let result = [...allItems];

    if (category !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredProducts(result);
  };

  const fetchProducts = async () => {
    try {
      const items = await getProducts();
      setProducts(items);
      applyFilters(items, searchQuery, selectedCategory);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Could not load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(products, text, selectedCategory);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    applyFilters(products, searchQuery, category);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleLogout = async () => {
    await logout();
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${item.id}` as Href)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.productPrice}>PKR {item.price.toLocaleString()}</Text>
          </View>

          <View style={styles.buyButton}>
            <ShoppingBag size={16} color="#0F2027" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.userNameText}>
            {user?.name || user?.email?.split('@')[0] || 'Guest'} 👋
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color="#8A95A5" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#8A95A5"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => handleCategorySelect(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d2ff" />
          <Text style={styles.loadingText}>Fetching products...</Text>
        </View>
      ) : error && products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Could not load products</Text>
          <Text style={styles.emptyStateSubtitle}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00d2ff"
              colors={['#00d2ff']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ShoppingBag size={64} color="#2C5364" />
              <Text style={styles.emptyStateTitle}>No Products Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your filters or pull down to refresh the catalog.
              </Text>
            </View>
          }
          renderItem={renderProductItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2027',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0
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
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 16
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 50,
    paddingHorizontal: 16
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    color: '#ffffff',
    flex: 1,
    fontSize: 15
  },
  categoriesContainer: {
    marginBottom: 16
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 10
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  categoryChipSelected: {
    backgroundColor: '#00d2ff',
    borderColor: '#00d2ff'
  },
  categoryChipText: {
    color: '#8A95A5',
    fontSize: 14,
    fontWeight: '600'
  },
  categoryChipTextSelected: {
    color: '#0F2027',
    fontWeight: 'bold'
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 100,
    flexGrow: 1
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden'
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 32, 39, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  categoryBadgeText: {
    color: '#00d2ff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  productDetails: {
    padding: 12
  },
  productName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4
  },
  productDescription: {
    color: '#8A95A5',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  priceLabel: {
    color: '#5F6B7C',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  productPrice: {
    color: '#00d2ff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  buyButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#00d2ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00d2ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#8A95A5',
    fontSize: 14,
    marginTop: 10
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6
  },
  emptyStateSubtitle: {
    color: '#8A95A5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  }
});
