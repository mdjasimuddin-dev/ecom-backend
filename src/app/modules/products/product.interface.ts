export interface IProductVariantInput {
  sku: string;
  size: string;
  color: string;
  stock: number;
  price?: number;
}

export interface ICreateProductPayload {
  name: string;
  slug?: string;
  description: string;
  basePrice: number;
  discountPrice?: number;
  images: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  categoryId: string;
  variants: IProductVariantInput[];
}

export interface IUpdateProductPayload {
  name?: string;
  slug?: string;
  description?: string;
  basePrice?: number;
  discountPrice?: number | null;
  images?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  categoryId?: string;
}

export interface IUpdateVariantPayload {
  sku?: string;
  size?: string;
  color?: string;
  stock?: number;
  price?: number | null;
}
