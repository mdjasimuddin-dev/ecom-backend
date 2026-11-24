import type { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AuthService } from './auth.service';
import { sendResponse } from '../../utils/sendResponse';

import httpStatus from 'http-status';

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;

  const user = await AuthService.registerUser(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registration successfully',
    data: {
      user,
    },
  });
});

const verifyPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AuthService.verifyUserEmail(payload);

  const { accessToken, refreshToken, user, profile } = result;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Your account register successfully',
    data: {
      accessToken,
      refreshToken,
      user,
      profile,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;

  const { accessToken, refreshToken } = await AuthService.loginUser(payload);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User login successfully',
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  await AuthService.forgetPassword(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `OTP sent to email : ${payload.email}`,
    data: {},
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  await AuthService.resetPassword(payload, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'New Password Updated successfully.',
    data: null,
  });
});

export const AuthController = {
  loginUser,
  registerUser,
  verifyPatient,
  forgetPassword,
  resetPassword,
};
