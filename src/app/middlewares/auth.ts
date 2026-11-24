import httpStatus from 'http-status';
import type { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { jwtUtils } from '../utils/jwt';
import config from '../config';
import { prisma } from '../lib/prisma';
import type { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { Role } from '../../../prisma/generated/prisma/enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  console.log(requiredRoles, 'User Roles check');
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : authHeader?.startsWith('Bearer ')
        ? authHeader?.split(' ')[1]
        : authHeader;

    if (!token) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You are not logged in. Please login to access this resource.'
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new AppError(httpStatus.CONFLICT, verifiedToken.error);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;
    console.log(role, 'line no 48');

    if (!requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource."
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found. Please log in again. ');
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE' || user.status === 'DELETED') {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `Your account has been ${user.status.toLowerCase()}. Please contact support.`
      );
    }

    req.user = {
      name: user.name,
      email: user.email,
      id: user.id,
      role: user.role,
    };

    next();
  });
};
