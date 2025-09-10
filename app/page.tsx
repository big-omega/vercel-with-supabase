import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Ensure this page always reflects the current auth/session state
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            {!hasEnvVars ? (
              <ConnectSupabaseSteps />
            ) : user ? (
              <div className="grid gap-3 text-sm">
                <p className="text-foreground/80">You&apos;re signed in. Quick links:</p>
                <div className="flex flex-wrap gap-3">
                  <Link className="underline underline-offset-4" href="/notes" target="_blank" rel="noopener noreferrer">
                    Notes (read/write)
                  </Link>
                  <Link className="underline underline-offset-4" href="/protected" target="_blank" rel="noopener noreferrer">
                    Protected page
                  </Link>
                  <Link className="underline underline-offset-4" href="/api/ping" target="_blank" rel="noopener noreferrer">
                    Ping (Node runtime)
                  </Link>
                  <Link className="underline underline-offset-4" href="/api/go-ping" target="_blank" rel="noopener noreferrer">
                    Ping (Go runtime)
                  </Link>
                  <Link className="underline underline-offset-4" href="/api/edge-time" target="_blank" rel="noopener noreferrer">
                    Edge time (Edge runtime)
                  </Link>
                </div>
              </div>
            ) : (
              <SignUpUserSteps />
            )}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
