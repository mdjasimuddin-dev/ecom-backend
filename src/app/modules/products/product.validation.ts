import { z } from 'zod';

const variantSchema = z.object({
  sku: z.string({ required_error: 'SKU is required' }).min(2),
  size: z.string({ required_error: 'Size is required' }),
  color: z.string({ required_error: 'Color is required' }),
  stock: z.number({ required_error: 'Stock is required' }).int().min(0),
  price: z.number().positive().optional(),
});

const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }).min(2),
    slug: z.string().optional(),
    description: z.string({ required_error: 'Description is required' }),
    basePrice: z.number({ required_error: 'Base price is required' }).positive(),
    discountPrice: z.number().positive().optional(),
    images: z.array(z.string().url()).min(1, 'At least one image is required'),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string({ required_error: 'Category ID is required' }).uuid(),
    variants: z.array(variantSchema).min(1, 'At least one variant is required'),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().positive().optional(),
    discountPrice: z.number().positive().nullable().optional(),
    images: z.array(z.string().url()).min(1).optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

const updateVariantValidationSchema = z.object({
  body: z.object({
    sku: z.string().min(2).optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    price: z.number().positive().nullable().optional(),
  }),
});

export const ProductValidations = {
  createProductValidationSchema,
  updateProductValidationSchema,
  updateVariantValidationSchema,
};
