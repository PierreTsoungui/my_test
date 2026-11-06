// utils/componentLink.ts

import type { ProductMapping } from "./componentDetail";

/**
 * Liefert das Ziel für einen Klick auf eine Komponente:
 * - gemappt → ProductDetailPage (mit Komponenten-Kontext)
 * - unmapped → ComponentDetailPage direkt
 */
export function getComponentHref(component: {
  id: string;
  productMapping: ProductMapping;
}): string {
  if (component.productMapping.status === "MAPPED") {
    return `/products/${component.productMapping.productId}?component=${component.id}`;
  }
  return `/components/${component.id}`;
}