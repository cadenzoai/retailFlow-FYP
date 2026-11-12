import { api } from './client';

export type PaymentMethod = 'JazzCash' | 'Easypaisa';

export interface OrderLine {
  productName: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  items: OrderLine[];
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
}

interface OrderItemDto {
  productName?: string;
  quantity: number;
  priceAtPurchase: number;
}

interface UserRef {
  name?: string;
  email?: string;
}

interface OrderDto {
  _id: string;
  items: OrderItemDto[];
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  status: string;
  totalAmount: number;
  createdAt: string;
  userId?: string | UserRef;
}

export function mapOrder(order: OrderDto): Order {
  const user = order.userId && typeof order.userId === 'object' ? order.userId : undefined;

  return {
    id: order._id,
    items: (order.items || []).map((item) => ({
      productName: item.productName || 'Product',
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase
    })),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    customerName: user?.name || '',
    customerEmail: user?.email || ''
  };
}

export async function placeOrder(shippingAddress: string, paymentMethod: PaymentMethod): Promise<Order> {
  const res = await api<{ order: OrderDto }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ shippingAddress, paymentMethod })
  });
  return mapOrder(res.order);
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await api<{ orders: OrderDto[] }>('/api/orders');
  return res.orders.map(mapOrder);
}
