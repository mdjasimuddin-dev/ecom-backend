import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { WishlistServices } from './wishlist.service';
import { sendResponse } from '../../utils/sendResponse';

// 1. Toggle Wishlist ======== done
const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const productId = req.body.productId as string;

  const result = await WishlistServices.toggleWishlistIntoDB(userId, productId);

  sendResponse(res, {
    statusCode: result.action === 'added' ? 201 : 200,
    success: true,
    message: result.message,
    data: result.data || null,
  });
});

// 2. Get My Wishlist
const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;

  const result = await WishlistServices.getMyWishlistFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wishlist retrieved successfully!',
    data: result,
  });
});

export const WishlistControllers = {
  toggleWishlist,
  getMyWishlist,
};
