import { api } from './client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

interface ProductDto {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

export async function getProducts(): Promise<Product[]> {
  const res = await api<{ products: ProductDto[] }>('/api/products');
  return res.products.map((p) => ({
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    stock: p.stock,
    category: p.category
  }));
}

export async function getProduct(id: string): Promise<Product> {
  const res = await api<{ product: ProductDto }>(`/api/products/${id}`);
  const p = res.product;
  return {
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    stock: p.stock,
    category: p.category
  };
}
