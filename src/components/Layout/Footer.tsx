import { ShieldCheck } from "lucide-react";
import { SRE_REGION } from "@/data";
import { APP_FOOTER_CLASS } from "@/components/ui";

export function Footer() {
  return (
    <footer className={APP_FOOTER_CLASS}>
      <span>Service régional des entreprises · {SRE_REGION}</span>
      <span> Copyright © {new Date().getFullYear()} Harena</span>
      <span>
        <ShieldCheck size={13} /> Aucune opération financière n’est exécutée
      </span>
    </footer>
  );
}
