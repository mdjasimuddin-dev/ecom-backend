import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { CouponServices } from './coupon.service';
import { sendResponse } from '../../utils/sendResponse';

// done
const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await CouponServices.createCouponIntoDB(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Coupon created successfully!',
    data: result,
  });
});

// done
const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.getAllCouponsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupons retrieved successfully!',
    data: result,
  });
});

// done
const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.applyCouponFromDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupon applied successfully!',
    data: result,
  });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CouponServices.updateCouponIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupon updated successfully!',
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await CouponServices.deleteCouponFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupon deleted successfully!',
    data: null,
  });
});

export const CouponControllers = {
  createCoupon,
  getAllCoupons,
  applyCoupon,
  updateCoupon,
  deleteCoupon,
};
