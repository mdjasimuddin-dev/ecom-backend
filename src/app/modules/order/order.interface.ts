export type TPaymentMethod = 'COD' | 'ONLINE';
export type TOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';
export type TPaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface ICreateOrderPayload {
  addressId: string;
  paymentMethod?: TPaymentMethod;
  couponCode?: string;
  orderNote?: string;
}

export interface IUpdateOrderStatusPayload {
  orderStatus: TOrderStatus;
  paymentStatus?: TPaymentStatus;
}
