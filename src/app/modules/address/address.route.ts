import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../../prisma/generated/prisma/enums';
import { AddressControllers } from './address.controller';

const router = Router();

// 01. Create Address ===== done
router.post(
  '/create',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  // validateRequest(AddressValidations.createAddressValidationSchema),
  AddressControllers.createAddress
);

// 02. Get Logged-in User's All Addresses ==== done
router.get(
  '/my-addresses',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  AddressControllers.getMyAddresses
);

// 03. Update Address ===== done
router.patch(
  '/update/:id',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  // validateRequest(AddressValidations.updateAddressValidationSchema),
  AddressControllers.updateAddress
);

// 04. Set Default Address
router.patch(
  '/set-default/:id',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  AddressControllers.setDefaultAddress
);

// 05. Delete Address
router.delete(
  '/delete/:id',
  auth(Role.CUSTOMER, Role.STAFF, Role.ADMIN),
  AddressControllers.deleteAddress
);

export const AddressRoutes = router;
