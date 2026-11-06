import { ExternalLink, Package } from "lucide-react";
import { BackLink } from "../ui/BackLink";
import { LifecycleStatusBadge } from "../ui/LifecycleStatusBadge";
import type { ReleaseLine } from "../../types/productDetail";

interface ProductDetailHeaderProps {
  name: string;
  category: string | null;
  releaseLine: ReleaseLine;
  productVersionCount: number;
}

export function ProductDetailHeader({
  name,
  category,
  releaseLine,
  productVersionCount,
}: ProductDetailHeaderProps) {
  const rl = releaseLine;

  return (
    <header className="mb-4">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
            aria-hidden="true"
          >
            <Package className="size-5" />
          </span>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {name}{" "}
              <span className="font-mono text-lg text-slate-500">
                {rl.release}
              </span>
            </h1>

            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-slate-500">
              <span>{category ?? "Unbekannte Kategorie"}</span>

              {productVersionCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    in{" "}
                    <span className="font-medium text-slate-700">
                      {productVersionCount}
                    </span>{" "}
                    Produktversion{productVersionCount === 1 ? "" : "en"}
                  </span>
                </>
              )}

              {rl.latestPatchVersion && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Patch{" "}
                    {rl.latestPatchLink ? (
                      <a
                        href={rl.latestPatchLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-0.5 rounded font-mono text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        {rl.latestPatchVersion}
                        <ExternalLink
                          className="size-3"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <span className="font-mono text-slate-700">
                        {rl.latestPatchVersion}
                      </span>
                    )}
                  </span>
                </>
              )}

              {rl.isLts !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    LTS:{" "}
                    <span className="text-slate-700">
                      {rl.isLts ? "Ja" : "Nein"}
                    </span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LifecycleStatusBadge status={rl.status} />
          {rl.isMaintained === false && rl.status !== "EOL" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
              nicht gepflegt
            </span>
          )}
        </div>
      </div>
    </header>
  );
}