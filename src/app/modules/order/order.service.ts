import path from 'path';
import { DiscountType, OrderStatus } from '../../../../prisma/generated/prisma/enums';
import { generateInvoicePdfBuffer } from '../../lib/generateInvoicePdf';
import { transporter } from '../../lib/nodemailer';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { ICreateOrderPayload } from './order.interface';
import httpStatus from 'http-status';
import ejs from 'ejs';
import config from '../../config';

// Unique order number (Example: JSV-20261123-4829)
const generateOrderNumber = (): string => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `JSV-${datePart}-${randomPart}`;
};

// Calculate delivery charge based on district (Dhaka: 70, Outside Dhaka: 120)
const calculateDeliveryCharge = (district: string): number => {
  return district.trim().toLowerCase() === 'dhaka' ? 60 : 120;
};

// 01. Create Order from Cart (Checkout)
const createOrderIntoDB = async (userId: string, payload: ICreateOrderPayload) => {
  const { addressId, couponCode } = payload;

  // 01. Validate delivery address
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new AppError(404, 'Delivery address not found!');
  }

  // 02. Fetch user's cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
      variant: true,
    },
  });

  if (cartItems.length === 0) {
    throw new AppError(400, 'Your cart is empty!');
  }

  // 03. Validate stock and calculate subtotal
  let subtotal = 0;

  const orderItemsData = cartItems.map((item) => {
    if (!item.product.isActive) {
      throw new AppError(400, `Product "${item.product.name}" is no longer available!`);
    }

    if (item.variant.stock < item.quantity) {
      throw new AppError(
        400,
        `Insufficient stock for "${item.product.name}" (${item.variant.size}, ${item.variant.color}). Available: ${item.variant.stock}`
      );
    }

    const unitPrice = item.variant.price ?? item.product.discountPrice ?? item.product.basePrice;
    const totalPrice = Number(unitPrice) * item.quantity;
    subtotal += totalPrice;

    return {
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      size: item.variant.size,
      color: item.variant.color,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    };
  });

  // 04. Calculate delivery charge
  const deliveryCharge = calculateDeliveryCharge(address.district);

  // 05. Validate coupon code and calculate discount
  let discountAmount = 0;
  let validCouponId: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError(404, 'Invalid or inactive coupon code!');
    }
    if (new Date() > new Date(coupon.expiresAt)) {
      throw new AppError(400, 'Coupon code has expired!');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError(400, 'Coupon usage limit reached!');
    }
    if (subtotal < Number(coupon.minOrderAmount)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Minimum order of ৳${Number(coupon.minOrderAmount)} required for this coupon!`
      );
    }

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount !== null && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    discountAmount = Math.round(discountAmount);
    validCouponId = coupon.id;
  }

  const totalAmount = subtotal + deliveryCharge - discountAmount;

  // 06. Create order, update stock, update coupon usage, and clear cart in a transaction
  const createdOrder = await prisma.$transaction(async (tx) => {
    // 01. Create the order
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        shippingAddress: {
          label: address.label,
          recipientName: address.recipientName,
          phone: address.phone,
          district: address.district,
          thana: address.thana,
          address: address.address,
          postalCode: address.postalCode,
        },
        subtotal,
        deliveryCharge,
        discountAmount,
        totalAmount,
        couponCode: validCouponId ? couponCode : null,
        paymentMethod: payload.paymentMethod ?? 'COD',
        orderNote: payload.orderNote ?? '',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // 02. Update stock for each product variant
    for (const item of cartItems) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    // 03. Update coupon usage count if a valid coupon was applied
    if (validCouponId) {
      await tx.coupon.update({
        where: { id: validCouponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 04. Clear the user's cart
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return order;
  });

  // এখানে আপনার sendEmail ইউটিলিটি দিয়ে Order Confirmation Email পাঠাতে পারেন

  try {
    const pdfBuffer = await generateInvoicePdfBuffer(createdOrder);

    const websiteUrl = 'https://jasivolifestyle.com';
    const whiteLogoUrl =
      'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192915/jasivo-white-logo.png';
    const userName = createdOrder.user.name || 'Customer';
    const verificationUrl = 'verification link';
    const darkLogoUrl =
      'https://res.cloudinary.com/uwyt8tyy/image/upload/v1795192901/jasivo-black-logo.png';
    const supportEmail = 'support@jasivolifestyle.com';
    const privacyUrl = 'https://jasivolifestyle.com/privacy';

    const confirmOrderEmailData = {
      websiteUrl,
      whiteLogoUrl,
      userName,
      verificationUrl,
      darkLogoUrl,
      supportEmail,
      privacyUrl,
      order: createdOrder,
    };

    const templatePath = path.join(process.cwd(), 'src/app/templates/orderConfirmation.ejs');

    const htmlContent = await ejs.renderFile(templatePath, confirmOrderEmailData);

    transporter.sendMail({
      from: config.email_sender,
      to: createdOrder.user.email,
      subject: `Your Order has been Confirmed`,
      html: htmlContent,
      attachments: [{ filename: `Invoice-${createdOrder.orderNumber}.pdf`, content: pdfBuffer }],
    });
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError);
  }

  return createdOrder;
};

// 02. Get Customer's Own Orders ====== done
const getMyOrdersFromDB = async (userId: string) => {
  const result = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { slug: true, images: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

// 03. Get Single Order Details (Customer or Admin) ======= done
const getSingleOrderFromDB = async (orderId: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { slug: true, images: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found!');
  }

  // কাস্টমার যেন অন্য কারো অর্ডার দেখতে না পারে
  if (role !== 'ADMIN' && order.userId !== userId) {
    throw new AppError(403, 'You are not authorized to view this order!');
  }

  return order;
};

// ৪. Cancel Order by Customer (Only when PENDING) & Restore Stock ========= done
const cancelMyOrderIntoDB = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError(404, 'Order not found!');
  }

  if (order.orderStatus !== OrderStatus.PENDING) {
    throw new AppError(
      400,
      `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}!`
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // অর্ডার স্ট্যাটাস CANCELLED করা
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { orderStatus: 'CANCELLED' },
    });

    // ভ্যারিয়েন্টের স্টক ফিরিয়ে দেওয়া
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return updatedOrder;
  });

  return result;
};

// ৫. Get All Orders with Filter & Pagination (Admin Only)
const getAllOrdersForAdminFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, orderStatus, paymentStatus, page = 1, limit = 15 } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const whereCondition: any = {};

  if (searchTerm) {
    whereCondition.OR = [
      { orderNumber: { contains: String(searchTerm), mode: 'insensitive' } },
      { user: { email: { contains: String(searchTerm), mode: 'insensitive' } } },
    ];
  }

  if (orderStatus) {
    whereCondition.orderStatus = String(orderStatus);
  }

  if (paymentStatus) {
    whereCondition.paymentStatus = String(paymentStatus);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNumber,
    }),
    prisma.order.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
    data: orders,
  };
};

// ৬. Update Order & Payment Status (Admin Only)
const updateOrderStatusByAdminIntoDB = async (
  orderId: string,
  payload: IUpdateOrderStatusPayload
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError(404, 'Order not found!');
  }

  if (order.orderStatus === 'CANCELLED') {
    throw new AppError(400, 'Cannot update a cancelled order!');
  }

  const result = await prisma.$transaction(async (tx) => {
    // অ্যাডমিন যদি অর্ডার CANCELLED করে, তবে স্টক রিস্টোর হবে
    if (payload.orderStatus === 'CANCELLED') {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // COD অর্ডার DELIVERED হলে অটোমেটিক paymentStatus PAID করে দেওয়া
    const finalPaymentStatus =
      payload.paymentStatus ??
      (payload.orderStatus === 'DELIVERED' && order.paymentMethod === 'COD'
        ? 'PAID'
        : order.paymentStatus);

    return await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: payload.orderStatus,
        paymentStatus: finalPaymentStatus,
      },
      include: { items: true },
    });
  });

  return result;
};

export const OrderServices = {
  createOrderIntoDB,
  getMyOrdersFromDB,
  getSingleOrderFromDB,
  cancelMyOrderIntoDB,
  getAllOrdersForAdminFromDB,
  updateOrderStatusByAdminIntoDB,
};
