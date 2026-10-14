export function fusionnerClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const cn = fusionnerClasses;
