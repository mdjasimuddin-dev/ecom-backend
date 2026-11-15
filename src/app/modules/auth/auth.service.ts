import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { IRegisterUser } from './auth.interface';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../../config';
import { jwtUtils } from '../../utils/jwt';

const registerUser = async (payload: IRegisterUser) => {
  // 1. Check if user already exists (fixed: email instead of id)
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: payload.email.trim().toLowerCase(),
    },
  });

  if (isUserExists) {
    throw new Error('User already exists. Please login now.');
  }

  // 2. Hash the password before saving
  const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

  // 3. Create the new user in the database
  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  // 4. Prepare JWT payload for auto-login
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role, // Remove if your User model doesn't have a role field
  };

  // 5. Generate Access & Refresh Tokens
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

  // 6. Exclude password from the returned user object
  // const { password, ...userWithoutPassword } = newUser;

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerUser,
};
