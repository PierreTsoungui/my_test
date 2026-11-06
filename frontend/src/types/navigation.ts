export interface BackNavigationState {
  backTo: string;
  backLabel: string;
}

/**
 * Erzeugt den State für einen Link zur Detailseite.
 *
 * Verwendung:
 *   <Link to={`/products/${id}`} state={backState("/matrix", "Matrix")}>
 */
export function backState(
  backTo: string,
  backLabel: string,
): BackNavigationState {
  return { backTo, backLabel };
}