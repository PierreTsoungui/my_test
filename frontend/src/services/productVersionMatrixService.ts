
import type { ProductVersionMatrixData } from "../types/productVersionMatrix";
import { productVersionMatrixMock } from "../data/productVersionMatrix";

export async function getProductVersionMatrix(): Promise<ProductVersionMatrixData> {
  return productVersionMatrixMock;
}
