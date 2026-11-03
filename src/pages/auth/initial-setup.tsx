import { PAGE_CONTENT_CLASS } from "@/components";
import { InitialSetupForm } from "@/components/AuthComponents";

export function InitialSetupPage() {
  return (
    <div className={PAGE_CONTENT_CLASS}>
      <section className="w-[min(100%,435px)] rounded-[14px] border border-pub-border bg-pub-glass px-7 py-[26px] shadow-pub-sm">
        <InitialSetupForm />
      </section>
    </div>
  );
}
