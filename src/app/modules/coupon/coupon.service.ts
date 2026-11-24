import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import {
  IApplyCouponPayload,
  ICreateCouponPayload,
  IUpdateCouponPayload,
} from './coupon.interface';
import httpsStatus from 'http-status';

// 1. Create Coupon (Admin Only) ===== done
const createCouponIntoDB = async (payload: ICreateCouponPayload) => {
  const formattedCode = payload.code.toUpperCase().trim();

  const existingCoupon = await prisma.coupon.findUnique({
    where: { code: formattedCode },
  });

  if (existingCoupon) {
    throw new AppError(httpsStatus.CONFLICT, 'Coupon code already exists!');
  }

  if (payload.discountType === 'PERCENTAGE' && payload.discountValue > 100) {
    throw new AppError(httpsStatus.BAD_REQUEST, 'Percentage discount cannot exceed 100%!');
  }

  const result = await prisma.coupon.create({
    data: {
      ...payload,
      code: formattedCode,
      expiresAt: new Date(payload.expiresAt),
    },
  });

  return result;
};

// ২. Get All Coupons (Admin Only) === done
const getAllCouponsFromDB = async () => {
  const result = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

// ৩. Apply & Validate Coupon at Checkout (Customer) ======= done
const applyCouponFromDB = async (payload: IApplyCouponPayload) => {
  const formattedCode = payload.code.toUpperCase().trim();
  const orderAmount = payload.orderAmount;

  const coupon = await prisma.coupon.findUnique({
    where: { code: formattedCode },
  });

  if (!coupon || !coupon.isActive) {
    throw new AppError(httpsStatus.NOT_FOUND, 'Invalid or inactive coupon code!');
  }

  // Check if the coupon has expired
  if (new Date() > new Date(coupon.expiresAt)) {
    throw new AppError(httpsStatus.BAD_REQUEST, 'This coupon code has expired!');
  }

  // Check if the coupon has a usage limit and if it has been reached
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(httpsStatus.BAD_REQUEST, 'This coupon usage limit has been reached!');
  }

  // Check minimum order amount condition
  if (orderAmount < Number(coupon.minOrderAmount)) {
    throw new AppError(
      httpsStatus.BAD_REQUEST,
      `Minimum order amount of ৳${coupon.minOrderAmount} is required to use this coupon!`
    );
  }

  // Calculate discount amount
  let discountAmount = 0;

  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;

    // Check if the discount exceeds the maximum discount limit
    if (coupon.maxDiscount !== null && discountAmount > Number(coupon.maxDiscount)) {
      discountAmount = Number(coupon.maxDiscount);
    }
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  // Ensure that the discount amount does not exceed the order amount
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }

  const finalAmount = orderAmount - discountAmount;

  return {
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    orderAmount,
    discountAmount: Math.round(discountAmount),
    finalAmount: Math.round(finalAmount),
  };
};

// ৪. Update Coupon (Admin Only)
const updateCouponIntoDB = async (id: string, payload: IUpdateCouponPayload) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existingCoupon) {
    throw new AppError(404, 'Coupon not found!');
  }

  const updateData: any = { ...payload };

  if (payload.code) {
    const formattedCode = payload.code.toUpperCase().trim();
    if (formattedCode !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: formattedCode },
      });
      if (codeExists) {
        throw new AppError(409, 'Another coupon with this code already exists!');
      }
      updateData.code = formattedCode;
    }
  }

  if (payload.expiresAt) {
    updateData.expiresAt = new Date(payload.expiresAt);
  }

  const result = await prisma.coupon.update({
    where: { id },
    data: updateData,
  });

  return result;
};

// ৫. Delete Coupon (Admin Only)
const deleteCouponFromDB = async (id: string) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existingCoupon) {
    throw new AppError(404, 'Coupon not found!');
  }

  await prisma.coupon.delete({
    where: { id },
  });

  return null;
};

export const CouponServices = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  applyCouponFromDB,
  updateCouponIntoDB,
  deleteCouponFromDB,
};
