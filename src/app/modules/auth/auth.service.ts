import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import type { ILoginPayload } from './auth.interface';

import { jwtUtils } from '../../utils/jwt';
import config from '../../config';
import type { SignOptions } from 'jsonwebtoken';
import { AppError } from '../../utils/appError';
import { Role, UserStatus } from '../../../../prisma/generated/prisma/enums';

import crypto from 'crypto';
import { redisClient } from '../../lib/redis';
import { transporter } from '../../lib/nodemailer';
import path from 'path';
import ejs from 'ejs';
import {
  IForgetPasswordPayload,
  IRegisterUserPayload,
  IResetPasswordPayload,
  IVerifyUserEmailPayload,
} from './auth.validation';
import { getClientInfo } from '../../utils/get-client-info';
import { Request } from 'express';

const registerUser = async (payload: IRegisterUserPayload) => {
  // 1. Check if user already exists
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: payload.email.trim().toLowerCase(),
    },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.FORBIDDEN, 'User already exists. Please login now.');
  }

  // 2. Hash the password before saving
  const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

  // 03. Otp and otpkey create
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpKey = `user-register-otp:${payload.email}`;
  const expirationSeconds = 5 * 60;

  // 04. redis otp configure and store redis database
  redisClient.set(otpKey, otpCode, {
    expiration: {
      type: 'EX',
      value: expirationSeconds,
    },
  });

  // 05. redis user registration and data store in redist db for 5 minitues
  const userRegistrationKey = `user-register-data:${payload.email}`;

  const redisUserDataPayload = {
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  };

  redisClient.set(userRegistrationKey, JSON.stringify(redisUserDataPayload), {
    expiration: {
      type: 'EX',
      value: expirationSeconds,
    },
  });

  // 06. Send email form nodemailer

  // step-01 : file link up
  const emailVerifiedTempPath = path.join(
    process.cwd(),
    'src/app/templates/user-email-verified.ejs'
  );

  // step-02 : email data payload

  //i.ibb.co.com/G3trjDyv/JASIVO-lifestyle-shopping-cart-logo.png

  const websiteUrl = 'https://jasivolifestyle.com';
  const whiteLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192915/jasivo-white-logo.png';
  const userName = payload.name;
  const verificationUrl = 'verification link';
  const expiryTime = expirationSeconds / 60;
  const darkLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192901/jasivo-black-logo.png';
  const supportEmail = 'support@jasivolifestyle.com';
  const privacyUrl = 'https://jasivolifestyle.com/privacy';

  const emailVerifiedTempData = {
    otpCode,
    websiteUrl,
    userName,
    whiteLogoUrl,
    verificationUrl,
    expiryTime,
    darkLogoUrl,
    supportEmail,
    privacyUrl,
  };

  const htmlContent = await ejs.renderFile(emailVerifiedTempPath, emailVerifiedTempData);

  // step -  03 : mail configure
  await transporter.sendMail({
    from: config.email_sender,
    to: payload.email,
    subject: 'Verify Your Email Address - Jasivo Lifestyle',
    html: htmlContent,
  });
};

const verifyUserEmail = async (payload: IVerifyUserEmailPayload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'User already exits.');
  }

  if (
    isUserExists?.status === 'SUSPENDED' ||
    isUserExists?.status === 'DELETED' ||
    isUserExists?.status === 'INACTIVE'
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your account is ${isUserExists.status.toLowerCase()}. Please contact to support`
    );
  }

  const key = `user-register-otp:${email}`;

  const redisOTP = await redisClient.get(key);

  if (!redisOTP) {
    throw new Error('Invalid Otp');
  }

  if (redisOTP !== otp) {
    throw new Error('OTP does not match!');
  }

  await redisClient.del(key);

  const userRegistrationKey = `user-register-data:${email}`;
  const redisUserData = await redisClient.get(userRegistrationKey);

  if (!redisUserData) {
    throw new Error('Patient data not exits into redis');
  }

  const redisUserDataPayload: IRegisterUserPayload = JSON.parse(redisUserData);

  const createdUser = await prisma.user.create({
    data: {
      name: redisUserDataPayload.name,
      email: redisUserDataPayload.email,
      password: redisUserDataPayload.password,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      profile: {
        create: {
          bio: 'I am a new customer',
        },
      },
    },
    omit: { password: true },
    include: { profile: true },
  });

  redisClient.del(userRegistrationKey);

  const { profile, ...user } = createdUser;

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions
  );

  const websiteUrl = 'https://jasivolifestyle.com';
  const whiteLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192915/jasivo-white-logo.png';
  const userName = user.name;
  const verificationUrl = 'verification link';
  const darkLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192901/jasivo-black-logo.png';
  const supportEmail = 'support@jasivolifestyle.com';
  const privacyUrl = 'https://jasivolifestyle.com/privacy';

  const emailVerifiedTempPath = path.join(process.cwd(), 'src/app/templates/welcome-email.ejs');

  const emailVerifiedTempData = {
    redisOTP,
    websiteUrl,
    userName,
    whiteLogoUrl,
    verificationUrl,
    darkLogoUrl,
    supportEmail,
    privacyUrl,
  };

  const htmlContent = await ejs.renderFile(emailVerifiedTempPath, emailVerifiedTempData);

  transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: `Welcome message form Jasivo Lifestyle`,
    html: htmlContent,
  });

  return {
    user,
    profile,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginPayload) => {
  // 1. Check if user already exists
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  const isPasswordMatched = await bcrypt.compare(password, user.password as string);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  // 2. Prepare JWT payload for auto-login
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role, // Remove if your User model doesn't have a role field
  };

  // 3. Generate Access & Refresh Tokens
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const forgetPassword = async (payload: IForgetPasswordPayload) => {
  const { email } = payload;

  const isUserExits = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!isUserExits) {
    throw new AppError(httpStatus.CONFLICT, 'User does not exists');
  }

  if (
    isUserExits?.status === 'SUSPENDED' ||
    isUserExits?.status === 'DELETED' ||
    isUserExits?.status === 'INACTIVE'
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your account is ${isUserExits.status.toLowerCase()}. Please contact to support`
    );
  }

  if (!isUserExits.emailVerified) {
    throw new AppError(httpStatus.FORBIDDEN, 'User not verified');
  }

  // if (isUserExits.googleId || isUserExits.AuthProvider === 'GOOGLE') {
  //   throw new Error('User has account with google');
  // }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const key = `forget-password-opt:${isUserExits.email}`;

  redisClient.set(key, otp, {
    expiration: {
      type: 'EX',
      value: 3 * 60,
    },
  });

  const websiteUrl = 'https://jasivolifestyle.com';
  const whiteLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192915/jasivo-white-logo.png';
  const userName = isUserExits.name;
  const verificationUrl = 'verification link';
  const darkLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192901/jasivo-black-logo.png';
  const supportEmail = 'support@jasivolifestyle.com';
  const privacyUrl = 'https://jasivolifestyle.com/privacy';
  const resetUrl = '..';

  const templatePath = path.join(process.cwd(), 'src/app/templates/forget-password.ejs');

  const forgetPasswordTempData = {
    otp,
    websiteUrl,
    userName,
    whiteLogoUrl,
    verificationUrl,
    darkLogoUrl,
    supportEmail,
    resetUrl,
    privacyUrl,
  };

  const htmlContent = await ejs.renderFile(templatePath, forgetPasswordTempData);

  transporter.sendMail({
    from: config.email_sender,
    to: isUserExits.email,
    // subject: `HACKED | SECURITY ALERT | Unauthorized Access Detected Sign-In ${isUserExits.email}`,
    subject: `Forget password`,
    html: htmlContent,
  });
};

const resetPassword = async (payload: IResetPasswordPayload, req: Request) => {
  const { email, newPassword, otp } = payload;

  const isUserExits = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!isUserExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  if (
    isUserExits?.status === 'SUSPENDED' ||
    isUserExits?.status === 'DELETED' ||
    isUserExits?.status === 'INACTIVE'
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your account is ${isUserExits.status.toLowerCase()}. Please contact to support`
    );
  }

  if (!isUserExits.emailVerified) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not verified');
  }

  // if (isUserExits.googleId || isUserExits.AuthProvider === 'GOOGLE') {
  //   throw new Error('User has account with google');
  // }

  const key = `forget-password-opt:${isUserExits.email}`;

  const redisOTP = await redisClient.get(key);

  if (!redisOTP) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid OTP');
  }

  if (redisOTP !== otp) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'OTP does not match!');
  }

  const hashNewPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

  const updateUser = await prisma.user.update({
    where: {
      email: isUserExits.email,
    },
    data: {
      password: hashNewPassword,
    },
  });

  // Get device information
  const clientInfo = await getClientInfo(req);

  // Save password reset history
  const updatedHistory = await prisma.passwordResetHistory.create({
    data: {
      userId: updateUser.id,
      ...clientInfo,
    },
  });

  const websiteUrl = 'https://jasivolifestyle.com';
  const whiteLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192915/jasivo-white-logo.png';
  const userName = isUserExits.name;
  const verificationUrl = 'verification link';
  const darkLogoUrl =
    'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192901/jasivo-black-logo.png';
  const supportEmail = 'support@jasivolifestyle.com';
  const privacyUrl = 'https://jasivolifestyle.com/privacy';
  const resetUrl = '..';
  const changedAt = isUserExits.updatedAt;
  const ipAddress = updatedHistory.ipAddress;
  const loginUrl = 'https://jasivo.com/login';

  console.log('Device :', updatedHistory);

  const templatePath = path.join(process.cwd(), 'src/app/templates/password-changed.ejs');

  const forgetPasswordTempData = {
    otp,
    websiteUrl,
    userName,
    whiteLogoUrl,
    verificationUrl,
    darkLogoUrl,
    supportEmail,
    resetUrl,
    privacyUrl,
    changedAt,
    ipAddress,
    loginUrl,
  };

  const htmlContent = await ejs.renderFile(templatePath, forgetPasswordTempData);

  transporter.sendMail({
    from: config.email_sender,
    to: isUserExits.email,
    subject: `Your Password is Changed`,
    html: htmlContent,
  });

  await redisClient.del([key]);
};

export const AuthService = {
  loginUser,
  registerUser,
  verifyUserEmail,
  forgetPassword,
  resetPassword,
};
