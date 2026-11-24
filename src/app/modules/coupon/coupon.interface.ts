export type TDiscountType = 'PERCENTAGE' | 'FIXED';

export interface ICreateCouponPayload {
  code: string;
  discountType?: TDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt: string | Date;
  isActive?: boolean;
}

export interface IUpdateCouponPayload {
  code?: string;
  discountType?: TDiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  expiresAt?: string | Date;
  isActive?: boolean;
}

export interface IApplyCouponPayload {
  code: string;
  orderAmount: number;
}
