import { z } from 'zod';

const createOrderValidationSchema = z.object({
  body: z.object({
    addressId: z
      .string({ required_error: 'Delivery address ID is required' })
      .uuid('Invalid Address ID format'),
    paymentMethod: z.enum(['COD', 'ONLINE']).optional().default('COD'),
    couponCode: z
      .string()
      .transform((val) => val.toUpperCase().trim())
      .optional(),
    orderNote: z.string().max(500).optional(),
  }),
});

const updateOrderStatusValidationSchema = z.object({
  body: z.object({
    orderStatus: z.enum([
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ]),
    paymentStatus: z.enum(['UNPAID', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  }),
});

export const OrderValidations = {
  createOrderValidationSchema,
  updateOrderStatusValidationSchema,
};
