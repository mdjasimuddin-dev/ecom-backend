import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { ICreateCategoryPayload, IUpdateCategoryPayload } from './category.interface';

// 1. Create Category / Sub-category
const createCategoryIntoDB = async (payload: ICreateCategoryPayload) => {
  const slug = payload.slug;

  // check existing category
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new AppError(409, 'Category with this name or slug already exists!');
  }

  // যদি parentId পাঠানো হয় (অর্থাৎ Sub-category হয়), তবে প্যারেন্ট ক্যাটাগরিটি ডাটাবেসে আছে কি না চেক করা
  if (payload.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: payload.parentId },
    });

    if (!parentCategory) {
      throw new AppError(404, 'Parent category not found!');
    }
  }

  const result = await prisma.category.create({
    data: {
      ...payload,
      slug,
    },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return result;
};

// 2. Get All Categories
const getAllCategoriesFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, includeInactive } = query;

  // শুধু মেইন ক্যাটাগরিগুলো আনবে, যার ভেতরে children হিসেবে সাব-ক্যাটাগরি থাকবে
  const whereCondition: any = {
    parentId: null,
  };

  // অ্যাডমিন না হলে শুধু active ক্যাটাগরি দেখাবে
  if (includeInactive !== 'true') {
    whereCondition.isActive = true;
  }

  if (searchTerm) {
    whereCondition.name = {
      contains: String(searchTerm),
      mode: 'insensitive',
    };
  }

  const result = await prisma.category.findMany({
    where: whereCondition,
    include: {
      children: {
        where: includeInactive !== 'true' ? { isActive: true } : undefined,
        include: {
          children: true, // ৩য় স্তরের সাব-ক্যাটাগরি থাকলে সেটিও আসবে
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

// 3. Get Single Category by Slug (Category Page ও Breadcrumb-এর জন্য)
const getCategoryBySlugFromDB = async (slug: string) => {
  const result = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, image: true },
      },
    },
  });

  if (!result) {
    throw new AppError(404, 'Category not found!');
  }

  return result;
};

// ৪. Update Category
const updateCategoryIntoDB = async (id: string, payload: IUpdateCategoryPayload) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError(404, 'Category not found!');
  }

  const updateData: any = { ...payload };

  // নাম বা স্লাগ পরিবর্তন করলে নতুন স্লাগ ইউনিক কি না চেক করা
  if (payload.name || payload.slug) {
    const newSlug = payload.slug;

    if (newSlug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: newSlug },
      });

      if (slugExists) {
        throw new AppError(409, 'Another category with this slug already exists!');
      }
      updateData.slug = newSlug;
    }
  }

  // প্যারেন্ট ক্যাটাগরি আপডেট ভ্যালিডেশন
  if (payload.parentId) {
    // কোনো ক্যাটাগরি যেন নিজেকেই নিজের প্যারেন্ট বানাতে না পারে
    if (payload.parentId === id) {
      throw new AppError(400, 'A category cannot be its own parent!');
    }

    const parentExists = await prisma.category.findUnique({
      where: { id: payload.parentId },
    });

    if (!parentExists) {
      throw new AppError(404, 'Parent category not found!');
    }
  }

  const result = await prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: true,
    },
  });

  return result;
};

// ৫. Delete Category
const deleteCategoryFromDB = async (id: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError(404, 'Category not found!');
  }

  const result = await prisma.category.delete({
    where: { id },
  });

  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getCategoryBySlugFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};
