import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Package, User } from 'lucide-react-native';
import { useCart } from '@/context/cart-context';

export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00d2ff',
        tabBarInactiveTintColor: '#8A95A5',
        tabBarStyle: {
          backgroundColor: '#0F2027',
          borderTopColor: 'rgba(255, 255, 255, 0.08)'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: count > 0 ? count : undefined,
          tabBarIcon: ({ color }) => <ShoppingCart size={22} color={color} />
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Package size={22} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />
        }}
      />
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
    </Tabs>
  );
}
