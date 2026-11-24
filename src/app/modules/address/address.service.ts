import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { ICreateAddressPayload, IUpdateAddressPayload } from './address.interface';

// 01. Create New Delivery Address ====== done
const createAddressIntoDB = async (userId: string, payload: ICreateAddressPayload) => {

  // Check if the user already has addresses
  const existingAddressCount = await prisma.address.count({
    where: { userId },
  });

  // If the user has no addresses, the new address will be set as default. Otherwise, it will follow the provided isDefault value.
  const shouldBeDefault = existingAddressCount === 0 ? true : Boolean(payload.isDefault);

  const result = await prisma.$transaction(async (tx) => {
    // If the new address is set to be default and the user already has addresses, unset the default flag for all existing addresses.
    if (shouldBeDefault && existingAddressCount > 0) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await tx.address.create({
      data: {
        ...payload,
        userId,
        isDefault: shouldBeDefault,
      },
    });
  });

  return result;
};

// 02. Get Logged-in User's All Addresses ====== done
const getMyAddressesFromDB = async (userId: string) => {
  const result = await prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' }, // ডিফল্ট ঠিকানাটি সবার ওপরে দেখাবে
      { createdAt: 'desc' },
    ],
  });

  return result;
};

// 03. Update Specific Address ====== done
const updateAddressIntoDB = async (
  userId: string,
  addressId: string,
  payload: IUpdateAddressPayload
) => {
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new AppError(404, 'Address not found!');
  }

  const result = await prisma.$transaction(async (tx) => {
    if (payload.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await tx.address.update({
      where: { id: addressId },
      data: payload,
    });
  });

  return result;
};

// ৪. Set an Address as Default
const setDefaultAddressIntoDB = async (userId: string, addressId: string) => {
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new AppError(404, 'Address not found!');
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return await tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });

  return result;
};

// ৫. Delete Address
const deleteAddressFromDB = async (userId: string, addressId: string) => {
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new AppError(404, 'Address not found!');
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  // If the deleted address was the default address, set another address as default (if available)
  if (existingAddress.isDefault) {
    const anotherAddress = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (anotherAddress) {
      await prisma.address.update({
        where: { id: anotherAddress.id },
        data: { isDefault: true },
      });
    }
  }

  return null;
};

export const AddressServices = {
  createAddressIntoDB,
  getMyAddressesFromDB,
  updateAddressIntoDB,
  setDefaultAddressIntoDB,
  deleteAddressFromDB,
};
