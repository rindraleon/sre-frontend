import { cn } from "@/utils";

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
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden rounded-[22%] border",
          "border-[rgba(29,106,80,0.16)] bg-[#f7faf8] shadow-[0_6px_16px_rgba(18,62,47,0.12)]",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <img
          className="block h-full w-full object-contain p-[5%]"
          src={BRAND}
          alt="Logo SRE"
          width={size}
          height={size}
        />
      </span>
      {withText && (
        <div className="flex min-w-0 flex-col gap-[3px]">
          <strong className="text-[15px] font-[780] tracking-[-0.45px] text-sre-ink">
            SRE<span className="text-sre-gold">·</span>Haute Matsiatra  
          </strong>
          {subtitle !== null && (
            <small className="whitespace-nowrap text-[12px] font-[800] tracking-[1.05px] text-pub-muted-2">
              {subtitle ?? "Haute Matsiatra"}
            </small>
          )}
        </div>
      )}
    </>
  );
}
