export type Role = "ROLE_ADMIN" | "ROLE_SELLER" | "ROLE_CUSTOMER";

export interface AuthResponse {
  message: string;
  token: string;
  role: Role;
  email: string;
  name: string;
}

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
}

export interface Store {
  id: number;
  storeName: string;
  description: string | null;
  address: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number | null;
  categoryName: string | null;
  storeId: number;
  storeName: string;
  storeDescription: string | null;
  storeAddress: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl: string | null;
  storeId: number;
  storeName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId: string;
  virtualAccountNumber: string | null;
  paidAt: string | null;
}

export interface Order {
  id: number;
  customerName: string;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
  payment: Payment | null;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  storeId: number;
  storeName: string;
  stock: number;
  quantity: number;
}
