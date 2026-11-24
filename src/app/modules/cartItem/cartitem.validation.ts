import { z } from 'zod';

const addToCartValidationSchema = z.object({
  body: z.object({
    productId: z
      .string({ required_error: 'Product ID is required' })
      .uuid('Invalid Product ID format'),
    variantId: z
      .string({ required_error: 'Variant ID is required' })
      .uuid('Invalid Variant ID format'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .optional()
      .default(1),
  }),
});

const updateCartQuantityValidationSchema = z.object({
  body: z.object({
    cartItemId: z
      .string({ required_error: 'Cart Item ID is required' })
      .uuid('Invalid Cart Item ID format'),
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
  }),
});

export const CartValidations = {
  addToCartValidationSchema,
  updateCartQuantityValidationSchema,
};
