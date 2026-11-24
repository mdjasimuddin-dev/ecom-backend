import { JwtPayload } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { UserService } from './user.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserService.getMyProfile(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User Profile data view',
    data: {
      result,
      // verifiedToken,
    },
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const user = req.user!;
  const result = await UserService.updateProfile(payload, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User profile update successfully',
    data: {
      result,
      // verifiedToken,
    },
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
};
