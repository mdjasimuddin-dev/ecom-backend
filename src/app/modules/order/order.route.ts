import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../../prisma/generated/prisma/enums';
import { OrderControllers } from './order.controller';

const router = Router();

// 01. Create Order (Customer) ========== done
router.post(
  '/create',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  // validateRequest(OrderValidations.createOrderValidationSchema),
  OrderControllers.createOrder
);

// 02. Get My All Orders (Customer) ========= done
router.get('/my-orders', auth(Role.CUSTOMER, Role.ADMIN, Role.STAFF), OrderControllers.getMyOrders);

// 03. Get All Orders (Admin Only) =========== done
router.get(
  '/admin/all',
  auth(Role.ADMIN, Role.STAFF, Role.SUPER_ADMIN),
  OrderControllers.getAllOrdersForAdmin
);

// 04. Update Order Status (Admin Only) ========= done
router.patch(
  '/admin/status/:orderId',
  auth(Role.ADMIN, Role.STAFF, Role.SUPER_ADMIN),
  // validateRequest(OrderValidations.updateOrderStatusValidationSchema),
  OrderControllers.updateOrderStatusByAdmin
);

// 05. Cancel My Order (Customer) ========== done
router.patch(
  '/cancel/:orderId',
  auth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN),
  OrderControllers.cancelMyOrder
);

// 06. Get Single Order Details (Customer / Admin) ======== done
router.get(
  '/:orderId',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN),
  OrderControllers.getSingleOrder
);

export const OrderRoutes = router;
