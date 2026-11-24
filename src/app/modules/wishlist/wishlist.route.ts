import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../../prisma/generated/prisma/enums';
import { WishlistValidations } from './wishlist.validation';
import { WishlistControllers } from './wishlist.controller';

const router = Router();

// 1. Wishlist add or remove (Logged-in User) ========= done
router.post(
  '/toggle',
  auth(Role.STAFF, Role.CUSTOMER, Role.ADMIN),
  // validateRequest(WishlistValidations.toggleWishlistValidationSchema),
  WishlistControllers.toggleWishlist
);

// 2. Get My Wishlist (Logged-in User) ========= done
router.get(
  '/my-wishlist',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  WishlistControllers.getMyWishlist
);

export const WishlistRoutes = router;
