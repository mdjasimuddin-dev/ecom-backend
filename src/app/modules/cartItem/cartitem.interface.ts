export interface IAddToCartPayload {
  productId: string;
  variantId: string;
  quantity?: number;
}

export interface IUpdateCartQuantityPayload {
  cartItemId: string;
  quantity: number;
}
