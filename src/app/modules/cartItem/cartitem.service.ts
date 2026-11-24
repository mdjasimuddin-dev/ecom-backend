import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { IAddToCartPayload, IUpdateCartQuantityPayload } from './cartitem.interface';

// 01. Add Product Variant to Cart ==== done
const addToCartIntoDB = async (userId: string, payload: IAddToCartPayload) => {
  const { productId, variantId, quantity = 1 } = payload;

  // Check if the product and variant exist and are active
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId: productId,
      product: { isActive: true },
    },
    include: {
      product: true,
    },
  });

  if (!variant) {
    throw new AppError(404, 'Product or selected variant not found!');
  }

  // Check stock availability
  if (variant.stock < quantity) {
    throw new AppError(400, `Only ${variant.stock} items left in stock!`);
  }

  // Check if the variant is already in the user's cart
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_variantId: {
        userId,
        variantId,
      },
    },
  });

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;

    if (variant.stock < newQuantity) {
      throw new AppError(
        400,
        `Cannot add more. You already have ${existingCartItem.quantity} in cart and only ${variant.stock} available in stock!`
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: newQuantity },
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
        variant: {
          select: { id: true, size: true, color: true, stock: true, price: true },
        },
      },
    });

    return updatedItem;
  }

  // If the variant is not in the cart, create a new cart item
  const result = await prisma.cartItem.create({
    data: {
      userId,
      productId,
      variantId,
      quantity,
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
      variant: {
        select: { id: true, size: true, color: true, stock: true, price: true },
      },
    },
  });

  return result;
};

// 02. Get Logged-in User's Cart (Items + Subtotal Calculation) ====== done
const getMyCartFromDB = async (userId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          discountPrice: true,
          images: true,
          isActive: true,
        },
      },
      variant: {
        select: {
          id: true,
          sku: true,
          size: true,
          color: true,
          stock: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate subtotal and total items
  let subtotal = 0;
  let totalItems = 0;

  const formattedItems = items.map((item) => {
    // Determine the unit price based on variant price, discount price, or base price
    const unitPrice = item.variant.price ?? item.product.discountPrice ?? item.product.basePrice;
    const itemTotal = Number(unitPrice) * item.quantity;

    subtotal += itemTotal;
    totalItems += item.quantity;

    return {
      ...item,
      unitPrice,
      itemTotal,
    };
  });

  return {
    items: formattedItems,
    summary: {
      totalItems,
      subtotal,
    },
  };
};

// ৩. Update Cart Item Quantity ===== done
const updateCartQuantityIntoDB = async (userId: string, payload: IUpdateCartQuantityPayload) => {
  const { cartItemId, quantity } = payload;

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId,
    },
    include: {
      variant: true,
    },
  });

  if (!cartItem) {
    throw new AppError(404, 'Cart item not found!');
  }

  if (cartItem.variant.stock < Number(quantity)) {
    throw new AppError(400, `Only ${cartItem.variant.stock} items available in stock!`);
  }

  const result = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: Number(quantity) },
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
      variant: {
        select: { id: true, size: true, color: true, stock: true, price: true },
      },
    },
  });

  return result;
};

// ৪. Remove Single Item from Cart ========= done
const removeCartItemFromDB = async (userId: string, itemId: string) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!cartItem) {
    throw new AppError(404, 'Cart item not found!');
  }

  const result = await prisma.cartItem.delete({
    where: { id: itemId },
  });

  return result;
};

// ৫. Clear Entire Cart
const clearCartFromDB = async (userId: string) => {
  const result = await prisma.cartItem.deleteMany({
    where: { userId },
  });

  return result;
};

export const CartServices = {
  addToCartIntoDB,
  getMyCartFromDB,
  updateCartQuantityIntoDB,
  removeCartItemFromDB,
  clearCartFromDB,
};
