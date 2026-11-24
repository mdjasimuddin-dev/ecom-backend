import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { IToggleWishlistPayload } from './wishlist.interface';

// 1. Toggle Wishlist (Add if not exists, Remove if already exists) ========= done
const toggleWishlistIntoDB = async (userId: string, productId: IToggleWishlistPayload) => {
  // check if the product exists
  const productExists = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!productExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  // check if the product is already in the user's wishlist
  const existingWishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  // আগে থেকেই থাকলে রিমুভ করবে
  if (existingWishlistItem) {
    await prisma.wishlist.delete({
      where: {
        id: existingWishlistItem.id,
      },
    });

    return {
      action: 'removed',
      message: 'Product removed from wishlist',
    };
  }

  // না থাকলে উইশলিস্টে যোগ করবে
  const result = await prisma.wishlist.create({
    data: {
      userId,
      productId,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          discountPrice: true,
          images: true,
        },
      },
    },
  });

  return {
    action: 'added',
    message: 'Product added to wishlist',
    data: result,
  };
};

// 2. Get Logged-in User's Wishlist ======== done
const getMyWishlistFromDB = async (userId: string) => {
  const result = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          variants: {
            select: { id: true, size: true, color: true, stock: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return result;
};

export const WishlistServices = {
  toggleWishlistIntoDB,
  getMyWishlistFromDB,
};
