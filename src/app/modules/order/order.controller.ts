import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { OrderServices } from './order.service';
import { sendResponse } from '../../utils/sendResponse';

// COD order create =========== done
const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const payload = req.body;

  const result = await OrderServices.createOrderIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order placed successfully!',
    data: result,
  });
});

// done
const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await OrderServices.getMyOrdersFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders retrieved successfully!',
    data: result,
  });
});

// done
const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const role = req.user?.role;
  const orderId = req.params.orderId as string;

  const result = await OrderServices.getSingleOrderFromDB(orderId, userId, role as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order details retrieved successfully!',
    data: result,
  });
});

// done
const cancelMyOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const orderId = req.params.orderId as string;

  const result = await OrderServices.cancelMyOrderIntoDB(userId, orderId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order cancelled successfully!',
    data: result,
  });
});

const getAllOrdersForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getAllOrdersForAdminFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All orders retrieved successfully!',
    data: result,
  });
});

const updateOrderStatusByAdmin = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await OrderServices.updateOrderStatusByAdminIntoDB(orderId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully!',
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelMyOrder,
  getAllOrdersForAdmin,
  updateOrderStatusByAdmin,
};
