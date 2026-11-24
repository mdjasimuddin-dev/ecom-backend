import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../../prisma/generated/prisma/enums';
import { CouponControllers } from './coupon.controller';

const router = Router();

// 01. Create Coupon (Admin Only) ======= done
router.post(
  '/create',
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  // validateRequest(CouponValidations.createCouponValidationSchema),
  CouponControllers.createCoupon
);

// 02. Get All Coupons (Admin Only) ===== done
router.get('/all', auth(Role.ADMIN, Role.SUPER_ADMIN), CouponControllers.getAllCoupons);

// 03. Apply Coupon at Checkout (Customer)
router.post(
  '/apply',
  auth(Role.CUSTOMER, Role.ADMIN, Role.STAFF, Role.SUPER_ADMIN),
  // validateRequest(CouponValidations.applyCouponValidationSchema),
  CouponControllers.applyCoupon
);

// 04. Update Coupon (Admin Only)
router.patch(
  '/update/:id',
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  // validateRequest(CouponValidations.updateCouponValidationSchema),
  CouponControllers.updateCoupon
);

// 05. Delete Coupon (Admin Only)
router.delete('/delete/:id', auth(Role.ADMIN, Role.SUPER_ADMIN), CouponControllers.deleteCoupon);

export const CouponRoutes = router;
