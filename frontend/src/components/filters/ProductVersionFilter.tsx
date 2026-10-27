
import { SelectField } from "../ui/SelectField";

interface ProductVersionFilterProps {
  versions: string[];
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
      label: version,
      value: version,
    })),
  ];

  return (
    <SelectField
      label="Produktversion"
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}
