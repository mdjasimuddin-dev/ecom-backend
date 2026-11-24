import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../../prisma/generated/prisma/enums';
import { CategoryControllers } from './category.controller';

const router = Router();

// 1. New Category or Sub Category Create (Admin Only) =========== done
router.post('/create', auth(Role.ADMIN, Role.SUPER_ADMIN), CategoryControllers.createCategory);

// 2. All Categories (Public) ====== done
router.get('/all', CategoryControllers.getAllCategories);

// 3. Get Single Category by Slug (Public) ==== done
router.get('/:slug', CategoryControllers.getCategoryBySlug);

// 4. Update Category (Admin Only) ======= done
router.patch(
  '/update/:id',
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  // validateRequest(CategoryValidations.updateCategoryValidationSchema),
  CategoryControllers.updateCategory
);

// 5. Delete Category (Admin Only) ========= done
router.delete(
  '/delete/:id',
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;
