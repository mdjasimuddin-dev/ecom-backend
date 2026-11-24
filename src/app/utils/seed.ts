import httpStatus from 'http-status';
import { prisma } from '../lib/prisma';

import config from '../config';
import { AppError } from './appError';
import bcrypt from 'bcryptjs';
import { Role } from '../../../prisma/generated/prisma/enums';

// super admin

export const SeedSuperAdmin = async () => {
  try {
    const isSuperAdminExit = await prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
      },
    });

    if (isSuperAdminExit) {
      console.log('Super admin already exits.');
      return;
    }

    const name = config.super_admin_name;
    const email = config.super_admin_email;
    const password = config.super_admin_password;

    if (!name || !email || !password) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Super Admin name, email, password missing in env file.'
      );
    }

    const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const superAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        emailVerified: true,
      },
    });

    console.log('Super admin create successfully.', superAdmin);
  } catch (error) {
    console.log('Super admin created failed', error);

    prisma.user.delete({
      where: {
        email: config.super_admin_email,
      },
    });
  }
};

// create tester admin

export const seedTesterAdmin = async () => {
  try {
    const isTestAdminExist = await prisma.user.findUnique({
      where: {
        email: config.tester_admin_email,
      },
    });

    if (isTestAdminExist) {
      console.log('Tester admin already exits.');
      return;
    }

    const name = config.tester_admin_name;
    const email = config.tester_admin_email;
    const password = config.tester_admin_password;

    if (!name || !email || !password) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Tester admin name, email, password is missing in env file.'
      );
    }

    const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const testerAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role: Role.ADMIN,
        needPasswordChange: false,
        emailVerified: true,
        profile: {
          create: {
            bio: 'I am admin of jasivo',
            country: 'Bangladesh',
          },
        },
      },
    });

    console.log('Tester admin create successfully.', testerAdmin);
  } catch (error) {
    console.log('Tester admin created failed', error);

    prisma.user.delete({
      where: {
        email: config.tester_admin_email,
      },
    });
  }
};

// tester staff

export const seedTesterStaff = async () => {
  try {
    const isTesterStaffExits = await prisma.user.findUnique({
      where: {
        email: config.tester_staff_email,
      },
    });

    if (isTesterStaffExits) {
      console.log('Tester Staff already exits.');
      return;
    }

    const name = config.tester_staff_name;
    const email = config.tester_staff_email;
    const password = config.tester_staff_password;

    if (!name || !email || !password) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Tester staff name, email, password is missing in env file.'
      );
    }

    const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const testerStaff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role: Role.STAFF,
        needPasswordChange: false,
        emailVerified: true,
        profile: {
          create: {
            bio: 'I am staff of Jasivo',
            address: '',
            city: '',
            country: 'Bangladesh',
          },
        },
      },
    });

    console.log('Tester staff create successfully.', testerStaff);
  } catch (error) {
    console.log('Tester staff created failed', error);

    prisma.user.delete({
      where: {
        email: config.tester_staff_email,
      },
    });
  }
};
