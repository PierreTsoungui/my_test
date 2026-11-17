export type ProductVersionCreationMethod = "sbom" | "copy";

/**
 * Payload for creating a product version.
 * The discriminant guarantees that exactly one source is provided.
 */
export type CreateProductVersionPayload =
  | {
      name: string;
      method: "sbom";
      sbomFile: File;
      sourceProductVersionId: null;
    }
  | {
      name: string;
      method: "copy";
      sbomFile: null;
      sourceProductVersionId: number;
    };
