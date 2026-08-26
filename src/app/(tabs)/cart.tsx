import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';

export default function CartScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <ShoppingCart size={64} color="#2C5364" />
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.subtitle}>Coming in the next step — add products from the catalog.</Text>
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
