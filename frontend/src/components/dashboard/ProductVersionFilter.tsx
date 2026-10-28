
import type { ProductVersion } from "../../types/dashboard";
import { SelectField } from "../ui/SelectField";

interface ProductVersionFilterProps {
  versions: ProductVersion[];
  value: string;
  onChange: (version: string) => void;
}

export function ProductVersionFilter({
  versions,
  value,
  onChange,
}: ProductVersionFilterProps) {
  const options = [
    { label: "Alle Versionen", value: "all" },
    ...versions.map((version) => ({
      label: version.label,
      value: version.id.toString(),
    })),
  ];

  return (
    <SelectField
      label="Produktversion"
      value={value}
      onChange={onChange}
      options={options}
      disabled={versions.length === 0}
    />
  );
}
