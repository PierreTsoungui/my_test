// services/productDetailService.ts

import { apiRequest } from "../config/api";
import type { ProductDetail } from "../types/productDetail";
import type { ComponentDetail } from "../types/componentDetail";

export function fetchProductDetail(
  productId: string,
  signal: AbortSignal,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/products/${productId}`, { signal });
}

export function fetchComponentDetail(
  componentId: string,
  signal: AbortSignal,
): Promise<ComponentDetail> {
  return apiRequest<ComponentDetail>(`/components/${componentId}`, {
    signal,
  });
}