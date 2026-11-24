import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../../prisma/generated/prisma/enums';
import { CartControllers } from './cartitem.controller';

const router = Router();

// 01. Add Item to Cart ===== done
router.post(
  '/add',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  // validateRequest(CartValidations.addToCartValidationSchema),
  CartControllers.addToCart
);

// 02. Get Logged-in User's Cart ======== done
router.get('/my-cart', auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN), CartControllers.getMyCart);

// 3. Update Cart Item Quantity ======== done
router.patch(
  '/update-quantity',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  // validateRequest(CartValidations.updateCartQuantityValidationSchema),
  CartControllers.updateCartQuantity
);

// 4. Remove Item from Cart ======= done
router.delete(
  '/remove/:itemId',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  CartControllers.removeCartItem
);

// 5. Clear Entire Cart
router.delete('/clear', auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN), CartControllers.clearCart);

export const CartRoutes = router;
