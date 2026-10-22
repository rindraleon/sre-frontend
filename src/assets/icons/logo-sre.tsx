import { cn } from "@/lib/utils";

/** Official brand of the SRE portal (validated professional logo). */
const BRAND = "/logo-sre-pro.png";

export function LogoSre({
  size = 34,
  withText = true,
  subtitle,
  className,
}: Readonly<{
  size?: number;
  withText?: boolean;
  subtitle?: string | null;
  className?: string;
}>) {
  return (
    <>
      <span
        className={cn("logo-sre-brand", className)}
        style={{ width: size, height: size }}
      >
        <img src={BRAND} alt="Logo SRE" width={size} height={size} />
      </span>
      {withText && (
        <div>
          <strong>
            SRE<span>·</span>Fianarantsoa
          </strong>
          {subtitle !== null && <small>{subtitle ?? "Haute Matsiatra"}</small>}
        </div>
      )}
    </>
  );
}
