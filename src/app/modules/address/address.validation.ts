import { z } from 'zod';

const createAddressValidationSchema = z.object({
  body: z.object({
    label: z.string().min(2).optional().default('Home'),
    recipientName: z
      .string({ required_error: 'Recipient name is required' })
      .min(2, 'Recipient name must be at least 2 characters'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(11, 'Phone number must be at least 11 digits'),
    district: z.string({ required_error: 'District is required' }).min(2, 'District is required'),
    thana: z
      .string({ required_error: 'Thana/Upazila is required' })
      .min(2, 'Thana/Upazila is required'),
    streetAddress: z
      .string({ required_error: 'Street address is required' })
      .min(5, 'Please provide detailed street address'),
    postalCode: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

const updateAddressValidationSchema = z.object({
  body: z.object({
    label: z.string().min(2).optional(),
    recipientName: z.string().min(2).optional(),
    phone: z.string().min(11).optional(),
    district: z.string().min(2).optional(),
    thana: z.string().min(2).optional(),
    streetAddress: z.string().min(5).optional(),
    postalCode: z.string().nullable().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const AddressValidations = {
  createAddressValidationSchema,
  updateAddressValidationSchema,
};
