import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { CartServices } from './cartitem.service';
import { sendResponse } from '../../utils/sendResponse';

// done
const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const payload = req.body;
  const result = await CartServices.addToCartIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Item added to cart successfully!',
    data: result,
  });
});

// done
const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await CartServices.getMyCartFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart retrieved successfully!',
    data: result,
  });
});

// done
const updateCartQuantity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const payload = req.body;
  const result = await CartServices.updateCartQuantityIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart quantity updated successfully!',
    data: result,
  });
});

// done
const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const itemId = req.params.itemId as string;
  const result = await CartServices.removeCartItemFromDB(userId, itemId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item removed from cart successfully!',
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?.userId;
  await CartServices.clearCartFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart cleared successfully!',
    data: null,
  });
});

export const CartControllers = {
  addToCart,
  getMyCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
};
