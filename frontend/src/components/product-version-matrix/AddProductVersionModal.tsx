
import { useRef, useState, type ChangeEvent, type ComponentProps } from "react";
import {
  CalendarDays,
  FileJson,
  FileUp,
  GitBranch,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { DEFAULT_APPLICATION } from "../../config/applicationConfig";
export interface ExistingProductVersion {
  id: string;
  name: string;
}

export type ProductVersionCreationMethod = "sbom" | "copy" | "empty";

export interface CreateProductVersionPayload {
  name: string;
  releaseDate: string | null;
  method: ProductVersionCreationMethod;
  sbomFile: File | null;
  sourceProductVersionId: string | null;
}

interface AddProductVersionModalProps {
  isOpen: boolean;
  productVersions: ExistingProductVersion[];
  onClose: () => void;
  onSubmit: (payload: CreateProductVersionPayload) => void | Promise<void>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const creationMethods: {
  value: ProductVersionCreationMethod;
  title: string;
  description: string;
}[] = [
  {
    value: "sbom",
    title: "SBOM-Datei hochladen",
    description:
      "Komponenten und Versionen automatisch aus einer SBOM extrahieren.",
  },
  {
    value: "copy",
    title: "Bestehende Version übernehmen",
    description:
      "Die Komponentenzuordnungen einer vorhandenen Produktversion übernehmen.",
  },
  {
    value: "empty",
    title: "Leere Produktversion erstellen",
    description:
      "Eine Version ohne Komponenten anlegen und später befüllen.",
  },
];

export function AddProductVersionModal({
  isOpen,
  productVersions,
  onClose,
  onSubmit,
}: AddProductVersionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [method, setMethod] =
    useState<ProductVersionCreationMethod>("sbom");
  const [sbomFile, setSbomFile] = useState<File | null>(null);
  const [sourceProductVersionId, setSourceProductVersionId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  function resetForm() {
    setName("");
    setReleaseDate("");
    setMethod("sbom");
    setSbomFile(null);
    setSourceProductVersionId("");
    setError("");
    setIsSubmitting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }

  function handleMethodChange(value: ProductVersionCreationMethod) {
    setMethod(value);
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSbomFile(null);
      return;
    }

    const isJsonFile = file.name.toLowerCase().endsWith(".json");

    if (!isJsonFile) {
      setSbomFile(null);
      setError("Bitte wähle eine JSON-SBOM-Datei aus.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSbomFile(null);
      setError("Die Datei darf maximal 10 MB groß sein.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setSbomFile(null);
      setError("Die ausgewählte Datei ist leer.");
      event.target.value = "";
      return;
    }

    setSbomFile(file);
    setError("");
  }

  async function handleSubmit(event:Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0]) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Bitte gib einen Versionsnamen ein.");
      return;
    }

    if (
      productVersions.some(
        (version) =>
          version.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setError("Eine Produktversion mit diesem Namen existiert bereits.");
      return;
    }

    if (method === "sbom" && !sbomFile) {
      setError("Bitte wähle eine SBOM-Datei aus.");
      return;
    }

    if (method === "copy" && !sourceProductVersionId) {
      setError("Bitte wähle eine bestehende Produktversion aus.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        releaseDate: releaseDate || null,
        method,
        sbomFile: method === "sbom" ? sbomFile : null,
        sourceProductVersionId:
          method === "copy" ? sourceProductVersionId : null,
      });

      resetForm();
      onClose();
    } catch {
      setError(
        "Die Produktversion konnte nicht erstellt werden. Bitte versuche es erneut.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-version-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Plus size={21} aria-hidden="true" />
            </div>

            <h2
              id="add-product-version-title"
              className="text-xl font-semibold text-slate-900"
            >
              Neue Produktversion
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Lege eine Version an und füge ihre Komponenten hinzu.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Modal schließen"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Allgemeine Informationen
              </h3>
                <div>
                 <label
                    htmlFor="product-version-application"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                    Anwendung
                 </label>

                 <input
                    id="product-version-application"
                    type="text"
                    value={DEFAULT_APPLICATION.name}
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                        Die Anwendung ist für dieses Projekt fest vorgegeben.
                    </p>
                </div>
              <div>
                <label
                  htmlFor="product-version-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Versionsname <span className="text-red-600">*</span>
                </label>

                <input
                  id="product-version-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="z. B. 2.4.0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="product-version-release-date"
                  className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <CalendarDays size={15} aria-hidden="true" />
                  Veröffentlichungsdatum
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <input
                  id="product-version-release-date"
                  type="date"
                  value={releaseDate}
                  onChange={(event) => setReleaseDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Komponenten hinzufügen
                  <span className="ml-1 text-red-600">*</span>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Wähle aus, woher die Komponenten stammen sollen.
                </p>
              </div>

              {creationMethods.map((option) => {
                const selected = method === option.value;

                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      selected
                        ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="creation-method"
                      value={option.value}
                      checked={selected}
                      onChange={() => handleMethodChange(option.value)}
                      className="mt-1 h-4 w-4 accent-blue-600"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {option.value === "sbom" && (
                          <FileUp
                            size={17}
                            className="text-blue-700"
                            aria-hidden="true"
                          />
                        )}
                        {option.value === "copy" && (
                          <GitBranch
                            size={17}
                            className="text-blue-700"
                            aria-hidden="true"
                          />
                        )}
                        {option.value === "empty" && (
                          <Plus
                            size={17}
                            className="text-blue-700"
                            aria-hidden="true"
                          />
                        )}

                        <span className="text-sm font-medium text-slate-900">
                          {option.title}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </section>

            {method === "sbom" && (
              <section className="space-y-2">
                <label
                  htmlFor="product-version-sbom"
                  className="block text-sm font-medium text-slate-700"
                >
                  SBOM-Datei <span className="text-red-600">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  id="product-version-sbom"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-left transition hover:border-blue-400 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    {sbomFile ? (
                      <FileJson size={22} aria-hidden="true" />
                    ) : (
                      <Upload size={22} aria-hidden="true" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {sbomFile
                        ? sbomFile.name
                        : "SBOM-Datei auswählen"}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {sbomFile
                        ? `${(sbomFile.size / 1024 / 1024).toFixed(2)} MB`
                        : "CycloneDX JSON oder SPDX JSON · maximal 10 MB"}
                    </span>
                  </span>
                </button>

                {sbomFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSbomFile(null);
                      setError("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-sm text-slate-500 underline hover:text-slate-800"
                  >
                    Datei entfernen
                  </button>
                )}

                <p className="text-xs leading-5 text-slate-500">
                  Die Dateiendung und Größe werden im Formular geprüft.
                  Ob die Datei eine gültige CycloneDX- oder SPDX-SBOM enthält,
                  muss zusätzlich beim Import geprüft werden.
                </p>
              </section>
            )}

            {method === "copy" && (
              <section>
                <label
                  htmlFor="source-product-version"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Bestehende Produktversion{" "}
                  <span className="text-red-600">*</span>
                </label>

                <select
                  id="source-product-version"
                  required
                  value={sourceProductVersionId}
                  onChange={(event) =>
                    setSourceProductVersionId(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Version auswählen</option>
                  {productVersions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.name}
                    </option>
                  ))}
                </select>

                {productVersions.length === 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    Es gibt noch keine bestehende Produktversion zum Kopieren.
                  </p>
                )}
              </section>
            )}

            {method === "empty" && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Die Produktversion wird ohne Komponenten angelegt. Du kannst
                Komponenten später hinzufügen oder eine SBOM importieren.
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} aria-hidden="true" />
              {isSubmitting ? "Wird erstellt …" : "Produktversion erstellen"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
