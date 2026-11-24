import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';

import type { IUpdateMyProfilePayload } from './user.validation';
import { AppError } from '../../utils/appError';
import { IRquestUser } from '../auth/auth.validation';

// import crypto from 'crypto';

const getMyProfile = async (userId: string) => {
  // 1. Check if user already exists
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return {
    user,
  };
};

const updateMyProfile = async (payload: IUpdateMyProfilePayload, user: IRquestUser) => {
  // 1. Check if user already exists
  const isExitsUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  if (!isExitsUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const profile = await prisma.user.update({
    where: {
      id: user.id,
      email: user.email,
    },
    data: {
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      profile: {
        update: {
          bio: payload.bio,
          phone: payload.phone,
          address: payload.address,
          city: payload.city,
          country: payload.country,
          profilePhoto: payload.profilePhoto,
        },
      },
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return {
    profile,
  };
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
};
