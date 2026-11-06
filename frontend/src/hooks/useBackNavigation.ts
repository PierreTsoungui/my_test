import { useLocation } from "react-router-dom";
import type { BackNavigationState } from "../types/navigation";

const FALLBACK: BackNavigationState = {
  backTo: "/",
  backLabel: "Übersicht",
};

export function useBackNavigation(): BackNavigationState {
  const location = useLocation();
  const state = location.state as Partial<BackNavigationState> | null;

  // Beide Felder müssen gesetzt sein – sonst Fallback.
  // (Verhindert halbe Zustände wie backTo ohne Label.)
  if (state?.backTo && state?.backLabel) {
    return { backTo: state.backTo, backLabel: state.backLabel };
  }

  return FALLBACK;
}