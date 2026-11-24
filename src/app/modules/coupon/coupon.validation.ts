import { z } from 'zod';

const createCouponValidationSchema = z.object({
  body: z.object({
    code: z
      .string({ required_error: 'Coupon code is required' })
      .min(3, 'Coupon code must be at least 3 characters')
      .transform((val) => val.toUpperCase().trim()),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional().default('PERCENTAGE'),
    discountValue: z
      .number({ required_error: 'Discount value is required' })
      .positive('Discount value must be greater than 0'),
    minOrderAmount: z.number().min(0).optional().default(0),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    expiresAt: z.string({ required_error: 'Expiry date is required' }).datetime({
      message: 'Invalid ISO date string (e.g., 2026-12-31T23:59:59Z)',
    }),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateCouponValidationSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3)
      .transform((val) => val.toUpperCase().trim())
      .optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().positive().optional(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

const applyCouponValidationSchema = z.object({
  body: z.object({
    code: z
      .string({ required_error: 'Coupon code is required' })
      .transform((val) => val.toUpperCase().trim()),
    orderAmount: z
      .number({ required_error: 'Order amount is required' })
      .positive('Order amount must be greater than 0'),
  }),
});

export const CouponValidations = {
  createCouponValidationSchema,
  updateCouponValidationSchema,
  applyCouponValidationSchema,
};
