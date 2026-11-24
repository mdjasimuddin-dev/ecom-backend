import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { CategoryServices } from './category.service';
import { sendResponse } from '../../utils/sendResponse';

// 1. Create Category / Sub-category //done
const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const result = await CategoryServices.createCategoryIntoDB(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Category created successfully!',
    data: result,
  });
});

// ২. Get All Categories (Nested structure)
const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAllCategoriesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories retrieved successfully!',
    data: result,
  });
});

// ৩. Get Single Category by Slug
const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await CategoryServices.getCategoryBySlugFromDB(slug);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category retrieved successfully!',
    data: result,
  });
});

// ৪. Update Category
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryServices.updateCategoryIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category updated successfully!',
    data: result,
  });
});

// ৫. Delete Category
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryServices.deleteCategoryFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category deleted successfully!',
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
