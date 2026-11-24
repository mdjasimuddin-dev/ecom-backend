import { z } from 'zod';

const toggleWishlistValidationSchema = z.object({
  body: z.object({
    productId: z
      .string({ required_error: 'Product ID is required' })
      .uuid('Invalid Product ID format'),
  }),
});

export const WishlistValidations = {
  toggleWishlistValidationSchema,
};
