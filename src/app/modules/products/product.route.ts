import { Router } from 'express';
import { Role } from '../../../../prisma/generated/prisma/client';
import { auth } from '../../middlewares/auth';
import { ProductControllers } from './product.controller';
import { upload } from '../../lib/multer';

const router = Router();

// 1. Product and Variant Creation (Admin Only) ==== done
router.post(
  '/create',
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  upload.fields([
    {
      name: 'productImages',
      maxCount: 5,
    },
  ]),
  // validateRequest(ProductValidations.createProductValidationSchema),
  ProductControllers.createProduct
);

// 2. filter, search and pagination (Public) ==== done
router.get('/all', ProductControllers.getAllProducts);

// 3. Single Product by Slug (Public) ====== done
router.get('/:slug', ProductControllers.getProductBySlug);

// 4. Update Product (Admin Only) ====== done
router.patch(
  '/update/:id',
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  // validateRequest(ProductValidations.updateProductValidationSchema),
  ProductControllers.updateProduct
);

// 5. Specific Variant Stock or Information Update (Admin Only)
router.patch(
  '/variant/update/:variantId',
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  // validateRequest(ProductValidations.updateVariantValidationSchema),
  ProductControllers.updateVariant
);

// 6. Delete Product (Admin Only)
router.delete('/delete/:id', auth(Role.ADMIN, Role.SUPER_ADMIN), ProductControllers.deleteProduct);

export const ProductRoutes = router;
