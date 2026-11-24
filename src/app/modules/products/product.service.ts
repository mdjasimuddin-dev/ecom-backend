import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import {
  ICreateProductPayload,
  IUpdateProductPayload,
  IUpdateVariantPayload,
} from './product.interface';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../../lib/cloudinary';
import { generateSlug } from '../../utils/generateSlug';

// 1. Create Product with Variants ====== done
const createProductIntoDB = async (
  payload: ICreateProductPayload,
  productImages: Express.Multer.File[]
) => {
  const { variants, ...productData } = payload;

  // check if the category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: productData.categoryId },
  });

  if (!categoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }

  // unique slug generation and check existing product same slug

  if (!productData.slug) {
    productData.slug = generateSlug(productData.name);
  }

  const existingProduct = await prisma.product.findUnique({ where: { slug: productData.slug } });
  if (existingProduct) {
    throw new AppError(httpStatus.CONFLICT, 'Product with this name or slug already exists!');
  }

  // Variant SKU uniqueness check
  const skus = variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Duplicate SKUs found in variants!');
  }

  const existingSkus = await prisma.productVariant.findMany({
    where: { sku: { in: skus } },
  });

  if (existingSkus.length > 0) {
    throw new AppError(httpStatus.CONFLICT, `SKU already exists: ${existingSkus[0].sku}`);
  }

  const CloudinaryProductImageUploadResult = await Promise.all(
    productImages.map((file) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: 'auto' }, async (error, result) => {
            if (error) {
              return reject(error);
            }

            if (!result) {
              throw new Error('No result returned from cloudinary');
            }

            resolve(result);
          })
          .end(file.buffer);
      });
    })
  );

  const result = await prisma.product.create({
    data: {
      ...productData,
      slug: productData.slug ? productData.slug : generateSlug(productData.name),
      images: CloudinaryProductImageUploadResult.map((file) => ({
        url: file.secure_url,
        publicId: file.public_id,
      })),
      variants: {
        create: variants,
      },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
    },
  });

  return result;
};

// 3. Get All Products (Search, Filter, Sort & Pagination) ======= done
const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const {
    searchTerm,
    category,
    minPrice,
    maxPrice,
    size,
    color,
    isFeatured,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const whereCondition: any = {
    isActive: true,
  };

  if (searchTerm) {
    whereCondition.OR = [
      { name: { contains: String(searchTerm), mode: 'insensitive' } },
      { description: { contains: String(searchTerm), mode: 'insensitive' } },
    ];
  }

  if (category) {
    whereCondition.category = {
      slug: String(category),
    };
  }

  if (minPrice || maxPrice) {
    whereCondition.basePrice = {};
    if (minPrice) whereCondition.basePrice.gte = Number(minPrice);
    if (maxPrice) whereCondition.basePrice.lte = Number(maxPrice);
  }

  if (isFeatured !== undefined) {
    whereCondition.isFeatured = isFeatured === 'true';
  }

  if (size || color) {
    whereCondition.variants = {
      some: {
        ...(size ? { size: { equals: String(size), mode: 'insensitive' } } : {}),
        ...(color ? { color: { equals: String(color), mode: 'insensitive' } } : {}),
      },
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
      orderBy: {
        [String(sortBy)]: sortOrder === 'asc' ? 'asc' : 'desc',
      },
      skip,
      take: limitNumber,
    }),
    prisma.product.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
    data: products,
  };
};

// 3. Get Single Product by Slug ====== done
const getProductBySlugFromDB = async (slug: string) => {
  const result = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: { select: { id: true, name: true, slug: true } },
        },
      },
      variants: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  return result;
};

// 4. Update Product Info ==== done
const updateProductIntoDB = async (id: string, payload: IUpdateProductPayload) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  const updateData: any = { ...payload };

  if (payload.name || payload.slug) {
    const newSlug = payload.slug ? generateSlug(payload.slug) : generateSlug(payload.name!);

    if (newSlug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: newSlug },
      });
      if (slugExists) {
        throw new AppError(httpStatus.CONFLICT, 'Another product with this slug already exists!');
      }
      updateData.slug = newSlug;
    }
  }

  const result = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
    },
  });

  return result;
};

// 5. Update Specific Variant (Stock / Price / Size / Color) ======== done
const updateVariantIntoDB = async (variantId: string, payload: IUpdateVariantPayload) => {

  const existingVariant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!existingVariant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product variant not found!');
  }

  if (payload.sku && payload.sku !== existingVariant.sku) {
    const skuExists = await prisma.productVariant.findUnique({
      where: { sku: payload.sku },
    });
    if (skuExists) {
      throw new AppError(httpStatus.CONFLICT, 'SKU already in use!');
    }
  }

  const result = await prisma.productVariant.update({
    where: { id: variantId },
    data: payload,
  });

  return result;
};

// 6. Delete Product
const deleteProductFromDB = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  const result = await prisma.product.delete({
    where: { id },
  });

  return result;
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  getProductBySlugFromDB,
  updateProductIntoDB,
  updateVariantIntoDB,
  deleteProductFromDB,
};
