export type ProductVersionCreationMethod = "sbom" | "copy" | "empty";

export interface CreateProductVersionPayload {
  name: string;
  releaseDate: string | null;
  method: ProductVersionCreationMethod;
  sbomFile: File | null;
  sourceProductVersionId: string | null;
}
