
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from "react";
import {
  FileJson,
  FileUp,
  GitBranch,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { DEFAULT_APPLICATION } from "../../config/applicationConfig";
import { useApiData } from "../../hooks/useApiData";
import { getProductVersions } from "../../services/productVersionOverviewService";
import type {
  CreateProductVersionPayload,
  ProductVersionCreationMethod,
} from "../../types/productVersion";
export type { CreateProductVersionPayload, ProductVersionCreationMethod } from "../../types/productVersion";


interface AddProductVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductVersionPayload) => void | Promise<void>;
}

const MAX_FILE_SIZE = 80 * 1024 * 1024;
type FormErrorField = "name" | "sbom" | "sourceVersion" | null;

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
];

export function AddProductVersionModal({
  isOpen,
  onClose,
  onSubmit,
}: AddProductVersionModalProps) {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const isSubmittingRef = useRef(false);

  const [name, setName] = useState("");
  const [method, setMethod] =
    useState<ProductVersionCreationMethod>("sbom");
  const [sbomFile, setSbomFile] = useState<File | null>(null);
  const [sourceProductVersionId, setSourceProductVersionId] = useState("");
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<FormErrorField>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequestedVersions, setHasRequestedVersions] = useState(false);
  const [isVersionErrorDismissed, setIsVersionErrorDismissed] = useState(false);

  const fetchProductVersions = useCallback(async (signal: AbortSignal) => {
    const versions = await getProductVersions(signal);
    return versions.map((version) => ({
      id: String(version.id),
      name: version.label,
    }));
  }, []);

  // Das Modal besitzt den Cache selbst und lädt die Liste erst, wenn
  // tatsächlich eine bestehende Produktversion übernommen werden soll.
  const versionsState = useApiData(fetchProductVersions);
  const productVersions = versionsState.data ?? [];
  const isLoadingProductVersions =
    versionsState.isLoading ||
    (hasRequestedVersions && versionsState.data === null && !versionsState.error);
  const productVersionsError = isVersionErrorDismissed
    ? null
    : versionsState.error;

  useEffect(() => {
    if (versionsState.isLoading && isVersionErrorDismissed) {
      setIsVersionErrorDismissed(false);
    }
  }, [isVersionErrorDismissed, versionsState.isLoading]);

  const fieldIds = {
    application: `${id}-application`,
    name: `${id}-name`,
    method: `${id}-method`,
    sbom: `${id}-sbom`,
    sbomHelp: `${id}-sbom-help`,
    sourceVersion: `${id}-source-version`,
    error: `${id}-error`,
  };
  const isNameError = errorField === "name";
  const isFileError = errorField === "sbom";
  const isSourceVersionError = errorField === "sourceVersion";

  function clearFormError() {
    setError("");
    setErrorField(null);
  }

  function setFormError(message: string, field: FormErrorField = null) {
    setError(message);
    setErrorField(field);
  }

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const dialog = dialogRef.current;
    const initialFocusTarget = dialog?.querySelector<HTMLElement>("[data-dialog-initial-focus]");
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden']):not([tabindex='-1'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    (initialFocusTarget ?? dialog)?.focus();

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isSubmittingRef.current) handleClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) =>
          element.tabIndex >= 0 &&
          !element.hasAttribute("hidden") &&
          !element.closest("[hidden], [inert], [aria-hidden='true']")
        );
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (!activeElement || !dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    };
    // Dialog lifecycle is intentionally tied only to open/close. Submission state is read via a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isCopySourceUnavailable =
    method === "copy" &&
    (isLoadingProductVersions ||
      Boolean(productVersionsError) ||
      !productVersions.some((version) => version.id === sourceProductVersionId));

  function resetForm() {
    setName("");
    setMethod("sbom");
    setSbomFile(null);
    setSourceProductVersionId("");
    clearFormError();
    setIsSubmitting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (isSubmittingRef.current || isSubmitting) return;
    resetForm();
    onClose();
  }

  function handleMethodChange(value: ProductVersionCreationMethod) {
    setMethod(value);
    clearFormError();
    if (value === "copy") {
      if (!hasRequestedVersions) {
        setHasRequestedVersions(true);
      } else if (versionsState.error) {
        // Nach einem fehlgeschlagenen Abruf genügt die erneute Auswahl von
        // "Kopieren" als Retry-Aktion. Die alte Meldung verschwindet sofort.
        setIsVersionErrorDismissed(true);
        versionsState.reload();
      }
    }
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
      setFormError("Bitte wähle eine JSON-SBOM-Datei aus.", "sbom");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSbomFile(null);
      setFormError("Die Datei darf maximal 80 MB groß sein.", "sbom");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setSbomFile(null);
      setFormError("Die ausgewählte Datei ist leer.", "sbom");
      event.target.value = "";
      return;
    }

    setSbomFile(file);
    clearFormError();
  }

  async function handleSubmit(event:Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0]) {
    event.preventDefault();
    clearFormError();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Bitte gib einen Versionsnamen ein.", "name");
      return;
    }

    // Die vollständige Versionsliste wird bewusst nur für "copy" geladen.
    // Eine zuverlässige Namens-Eindeutigkeitsprüfung muss daher serverseitig
    // erfolgen und darf nicht auf einer ungefilterten UI-Liste beruhen.

    if (method === "sbom" && !sbomFile) {
      setFormError("Bitte wähle eine SBOM-Datei aus.", "sbom");
      return;
    }

    if (method === "copy" && !sourceProductVersionId) {
      setFormError("Bitte wähle eine bestehende Produktversion aus.", "sourceVersion");
      return;
    }

    const numericSourceVersionId = Number(sourceProductVersionId);
    if (
      method === "copy" &&
      (!Number.isSafeInteger(numericSourceVersionId) || numericSourceVersionId <= 0)
    ) {
      setFormError("Die ausgewählte Produktversion hat eine ungültige ID.", "sourceVersion");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (method === "sbom") {
        // Die Prüfung oben stellt sicher, dass hier eine Datei vorhanden ist.
        if (!sbomFile) throw new Error("Bitte wähle eine SBOM-Datei aus.");
        await onSubmit({
          name: trimmedName,
          method: "sbom",
          sbomFile,
          sourceProductVersionId: null,
        });
      } else {
        await onSubmit({
          name: trimmedName,
          method: "copy",
          sbomFile: null,
          sourceProductVersionId: numericSourceVersionId,
        });
      }

      if (hasRequestedVersions) {
        // Nach dem Anlegen kann eine neue Version als Kopierquelle verfügbar sein.
        versionsState.reload();
      }
      resetForm();
      onClose();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error && submitError.message.trim()
          ? submitError.message
          : "Die Produktversion konnte nicht erstellt werden. Bitte versuche es erneut.",
      );
    } finally {
      isSubmittingRef.current = false;
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
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        tabIndex={-1}
        ref={dialogRef}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Plus size={21} aria-hidden="true" />
            </div>

            <h2
              id={`${id}-title`}
              className="text-xl font-semibold text-slate-900"
            >
              Neue Produktversion
            </h2>

            <p id={`${id}-description`} className="mt-1 text-sm text-slate-600">
              Lege eine Produktversion aus einer SBOM oder durch Übernahme einer bestehenden Version an.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Modal schließen"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <fieldset disabled={isSubmitting} className="min-w-0 space-y-6 border-0 p-0">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Allgemeine Informationen
              </h3>
                <div>
                 <label
                    htmlFor={fieldIds.application}
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                    Anwendung
                 </label>

                 <input
                    id={fieldIds.application}
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
                  htmlFor={fieldIds.name}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Versionsname <span aria-hidden="true" className="text-red-600">*</span><span className="sr-only"> (Pflichtfeld)</span>
                </label>

                <input
                  id={fieldIds.name}
                  data-dialog-initial-focus
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  aria-invalid={isNameError}
                  aria-describedby={isNameError ? fieldIds.error : undefined}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (isNameError) clearFormError();
                  }}
                  placeholder="z. B. 2.4.0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </section>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-slate-900">
                Komponenten hinzufügen
                <span aria-hidden="true" className="ml-1 text-red-600">*</span>
                <span className="sr-only"> (Pflichtfeld)</span>
              </legend>
              <p id={`${fieldIds.method}-description`} className="text-sm text-slate-500">
                Wähle aus, woher die Komponenten stammen sollen.
              </p>

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
                      name={`${id}-creation-method`}
                      aria-describedby={`${fieldIds.method}-description`}
                      value={option.value}
                      checked={selected}
                      onChange={() => handleMethodChange(option.value)}
                      className="mt-1 h-4 w-4 accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
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
            </fieldset>

            {method === "sbom" && (
              <section className="space-y-2">
                <input
                  ref={fileInputRef}
                  id={fieldIds.sbom}
                  type="file"
                  accept=".json,application/json"
                  aria-required="true"
                  aria-invalid={isFileError}
                  aria-describedby={`${fieldIds.sbomHelp}${isFileError ? ` ${fieldIds.error}` : ""}`}
                  onChange={handleFileChange}
                  className="peer sr-only"
                />

                <label
                  htmlFor={fieldIds.sbom}
                  className="block cursor-pointer rounded-sm text-sm font-medium text-slate-700 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-700 peer-focus-visible:ring-offset-2"
                >
                  SBOM-Datei <span aria-hidden="true" className="text-red-600">*</span>
                  <span className="sr-only"> (Pflichtfeld)</span>
                  <span className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-left font-normal transition hover:border-blue-400 hover:bg-blue-50/50">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      {sbomFile ? (
                        <FileJson size={22} aria-hidden="true" />
                      ) : (
                        <Upload size={22} aria-hidden="true" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {sbomFile ? sbomFile.name : "SBOM-Datei auswählen"}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {sbomFile
                          ? `${(sbomFile.size / 1024 / 1024).toFixed(2)} MB`
                          : "CycloneDX JSON oder SPDX JSON · maximal 80 MB"}
                      </span>
                    </span>
                  </span>
                </label>

                {sbomFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSbomFile(null);
                      clearFormError();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    aria-label={`Datei ${sbomFile.name} entfernen`}
                    className="min-h-9 rounded-sm text-sm text-slate-700 underline underline-offset-2 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                  >
                    Datei entfernen
                  </button>
                )}

                <p id={fieldIds.sbomHelp} className="text-xs leading-5 text-slate-500">
                  Die Dateiendung und Größe werden im Formular geprüft.
                  Ob die Datei eine gültige CycloneDX- oder SPDX-SBOM enthält,
                  muss zusätzlich beim Import geprüft werden.
                </p>
              </section>
            )}

            {method === "copy" && (
              <section>
                <label
                  htmlFor={fieldIds.sourceVersion}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Bestehende Produktversion{" "}
                  <span className="text-red-600">*</span>
                </label>

                <select
                  id={fieldIds.sourceVersion}
                  required
                  value={sourceProductVersionId}
                  disabled={isLoadingProductVersions || Boolean(productVersionsError) || productVersions.length === 0}
                  aria-invalid={isSourceVersionError}
                  aria-describedby={isSourceVersionError ? fieldIds.error : undefined}
                  onChange={(event) => {
                    setSourceProductVersionId(event.target.value);
                    if (isSourceVersionError) clearFormError();
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">Version auswählen</option>
                  {productVersions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.name}
                    </option>
                  ))}
                </select>

                {isLoadingProductVersions && (
                  <p role="status" className="mt-2 text-sm text-slate-600">
                    Bestehende Produktversionen werden geladen …
                  </p>
                )}

                {productVersionsError && (
                  <p role="alert" className="mt-2 text-sm text-red-700">
                    Produktversionen konnten nicht geladen werden. Bitte überprüfe deine Verbindung (z. B. Netzwerk oder VPN) und wähle „Kopieren“ erneut aus.
                  </p>
                )}

                {!isLoadingProductVersions && !productVersionsError && productVersions.length === 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    Es gibt noch keine bestehende Produktversion zum Kopieren.
                  </p>
                )}
              </section>
            )}

            {error && (
              <div
                id={fieldIds.error}
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}
            </fieldset>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isCopySourceUnavailable}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
