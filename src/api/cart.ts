import { api } from './client';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  available: boolean;
}

interface ProductRef {
  _id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  category?: string;
}

interface CartItemDto {
  productId: ProductRef | string | null;
  quantity: number;
}

interface CartDto {
  items: CartItemDto[];
}

function mapItem(item: CartItemDto): CartItem | null {
  const product = item.productId;

  if (!product || typeof product === 'string') {
    if (!product) return null;
    return {
      productId: product,
      name: 'Unavailable',
      price: 0,
      image: '',
      stock: 0,
      quantity: item.quantity,
      available: false
    };
  }

  return {
    productId: product._id,
    name: product.name,
    price: product.price,
    image: product.image || '',
    stock: product.stock,
    quantity: item.quantity,
    available: true
  };
}

function mapCart(cart: CartDto): CartItem[] {
  return cart.items.map(mapItem).filter((item): item is CartItem => item !== null);
}

export async function getCart(): Promise<CartItem[]> {
  const res = await api<{ cart: CartDto }>('/api/cart');
  return mapCart(res.cart);
}

export async function addCartItem(productId: string, quantity: number): Promise<CartItem[]> {
  const res = await api<{ cart: CartDto }>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
  return mapCart(res.cart);
}

export async function updateCartItem(productId: string, quantity: number): Promise<CartItem[]> {
  const res = await api<{ cart: CartDto }>(`/api/cart/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity })
  });
  return mapCart(res.cart);
}

export async function removeCartItem(productId: string): Promise<CartItem[]> {
  const res = await api<{ cart: CartDto }>(`/api/cart/items/${productId}`, {
    method: 'DELETE'
  });
  return mapCart(res.cart);
}
