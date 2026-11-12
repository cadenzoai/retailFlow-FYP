import { api } from './client';
import { mapOrder, Order } from './orders';
import { Product } from './products';

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

interface ProductDto {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  category: string;
}

function mapProduct(product: ProductDto): Product {
  return {
    id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image || '',
    stock: product.stock,
    category: product.category
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  const res = await api<{ products: ProductDto[] }>('/api/admin/products?limit=100');
  return res.products.map(mapProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const res = await api<{ product: ProductDto }>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return mapProduct(res.product);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const res = await api<{ product: ProductDto }>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input)
  });
  return mapProduct(res.product);
}

export async function deleteProduct(id: string): Promise<void> {
  await api(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export async function getAllOrders(): Promise<Order[]> {
  const res = await api<{ orders: Parameters<typeof mapOrder>[0][] }>('/api/admin/orders');
  return res.orders.map(mapOrder);
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const res = await api<{ order: Parameters<typeof mapOrder>[0] }>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return mapOrder(res.order);
}
