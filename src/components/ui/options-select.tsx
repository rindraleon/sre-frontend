import type { OptionSelect } from "@/data";

export function OptionsSelect({ options }: Readonly<{ options: readonly OptionSelect[] }>) {
  return (
    <>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}
