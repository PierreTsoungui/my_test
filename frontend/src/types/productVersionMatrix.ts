
import type {
  ComponentLifecycleStatus,
  Severity,
} from "../config/statusConfig";

export interface MatrixProductVersion {
  id: string;
  name: string;
  releaseDate: string | null;
}

/**
 * Daten einer Komponente innerhalb einer Produktversion.
 */
export interface MatrixComponentVersion {
  version: string | null;
  lifecycleStatus: ComponentLifecycleStatus;
supportEndDate: string | null;
  vulnerabilities: {
    total: number;
    bySeverity: Partial<Record<Severity, number>>;
  } | null;
}

/**
 * Eine Komponente, die als Zeile in der Matrix angezeigt wird.
 */
export interface MatrixComponent {
  id: string;
  name: string;
  category: string;
  productVersions: Record<string, MatrixComponentVersion>;
}

/**
 * Gesamtdaten der Produktversionsmatrix.
 */
export interface ProductVersionMatrixData {
  productVersions: MatrixProductVersion[];
  components: MatrixComponent[];
  totalComponents: number;
}
