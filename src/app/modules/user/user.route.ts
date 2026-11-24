import { Router } from 'express';
import { UserController } from './user.controller';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../../prisma/generated/prisma/enums';

const router = Router();

// get profile // done
router.get(
  '/me',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getMyProfile
);

// update profile  // done
router.patch(
  '/update-profile',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN),
  UserController.updateMyProfile
);

export const UserRoutes = router;
