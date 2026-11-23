import { request } from "../config/api";
import type {
  ProductVersionOverviewPage,
  ProductVersionOverviewQuery,
} from "../types/productVersionOverview";
import type { CreateProductVersionPayload } from "../types/productVersion";
import type { ProductVersion } from "../types/dashboard";

const  PATH_PRODUCT_VERSIONS = "/product-versions";
export async function getProductVersionOverview(
  query: ProductVersionOverviewQuery,
  signal?: AbortSignal,
): Promise<ProductVersionOverviewPage> {
  const params = new URLSearchParams({
    archive_state: query.archiveState,
    attention_filter: query.attentionFilter,
    search: query.search,
    page: String(query.page),
    page_size: String(query.pageSize),
  });


  const response = await request(
    `${PATH_PRODUCT_VERSIONS}/overview?${params.toString()}`,
    { signal },
  );
  return response.json() as Promise<ProductVersionOverviewPage>;
}

export async function archiveProductVersion(id: number): Promise<void> {
      await  request(`${PATH_PRODUCT_VERSIONS}/${id}/archive`, {
    method: "PATCH",
  });
}

export async function restoreProductVersion(id: number): Promise<void> {
  await request(`${PATH_PRODUCT_VERSIONS}/${id}/restore`, {
    method: "PATCH",
  });
}

export async function deleteProductVersion(id: number): Promise<void> {
   await request(`${PATH_PRODUCT_VERSIONS}/${id}`, {
    method: "DELETE",
  });
}

export async function createProductVersion(
  payload: CreateProductVersionPayload,
): Promise<void> {
  const body = new FormData();

  body.set("name", payload.name);
  body.set("method", payload.method);

  if (payload.method === "sbom") {
    body.set("sbom_file", payload.sbomFile);
  } else {
    body.set(
      "source_product_version_id",
      String(payload.sourceProductVersionId),
    );
  }

    await request(`${PATH_PRODUCT_VERSIONS}`, {
    method: "POST",
    body,
  });
}


export async function getProductVersions(signal?: AbortSignal): Promise<ProductVersion[]> {
   const productVersions = await request(`${PATH_PRODUCT_VERSIONS}`, { signal });
   return productVersions.json() as Promise<ProductVersion[]>;
}

