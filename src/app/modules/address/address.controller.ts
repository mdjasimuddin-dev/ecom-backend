import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AddressServices } from './address.service';
import { sendResponse } from '../../utils/sendResponse';

// done
const createAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const payload = req.body;
  const result = await AddressServices.createAddressIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Address created successfully!',
    data: result,
  });
});

// done 
const getMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await AddressServices.getMyAddressesFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Addresses retrieved successfully!',
    data: result,
  });
});

// done
const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  const payload = req.body;

  const result = await AddressServices.updateAddressIntoDB(userId, id, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address updated successfully!',
    data: result,
  });
});

const setDefaultAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  const result = await AddressServices.setDefaultAddressIntoDB(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Default address updated successfully!',
    data: result,
  });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  await AddressServices.deleteAddressFromDB(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address deleted successfully!',
    data: null,
  });
});

export const AddressControllers = {
  createAddress,
  getMyAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
