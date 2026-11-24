import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ProductServices } from './product.service';
import { sendResponse } from '../../utils/sendResponse';

// done
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const productImages = files?.['productImages'] || [];

  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;

  const result = await ProductServices.createProductIntoDB(payload, productImages);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product created successfully!',
    data: result,
  });
});

// done
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ProductServices.getAllProductsFromDB(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products retrieved successfully!',
    data: result,
  });
});

// done
const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const result = await ProductServices.getProductBySlugFromDB(slug as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product retrieved successfully!',
    data: result,
  });
});

// done
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload = req.body;
  const result = await ProductServices.updateProductIntoDB(id, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product updated successfully!',
    data: result,
  });
});

// done
const updateVariant = catchAsync(async (req: Request, res: Response) => {
  const variantId = req.params.variantId as string;
  const payload = req.body;

  const result = await ProductServices.updateVariantIntoDB(variantId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product variant updated successfully!',
    data: result,
  });
});

// done
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ProductServices.deleteProductFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product deleted successfully!',
    data: result,
  });
});

export const ProductControllers = {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  updateVariant,
  deleteProduct,
};
