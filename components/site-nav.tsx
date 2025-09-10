import Link from "next/link";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteNav() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex items-center gap-6 font-medium">
          <Link href="/">Next.js Supabase Starter</Link>
          <div className="flex items-center gap-4 text-foreground/80">
            <Link href="/notes" target="_blank" rel="noopener noreferrer">Notes</Link>
            <Link href="/protected" target="_blank" rel="noopener noreferrer">Protected</Link>
            <Link href="/api/ping" target="_blank" rel="noopener noreferrer">Ping</Link>
            <Link href="/api/edge-time" target="_blank" rel="noopener noreferrer">Edge</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
