import type { OptionSelect } from "@/constants/options";

/** Reusable rendering of a Select's <option> from a list of constants. */
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
