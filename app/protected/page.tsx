import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    redirect("/auth/login");
  }
  const user = userData.user;

  return (
    <div className="flex-1 w-full flex flex-col items-center gap-6 p-8 text-center">
      <h1 className="text-2xl font-bold">Protected Area</h1>
      <div className="text-sm">
        Signed in as <span className="font-mono">{user.email}</span>
      </div>
      <div className="text-sm flex flex-wrap justify-center gap-3">
        <span className="text-foreground/80">Quick links:</span>
        <Link className="underline underline-offset-4" href="/notes" target="_blank" rel="noopener noreferrer">Notes</Link>
        <Link className="underline underline-offset-4" href="/api/ping" target="_blank" rel="noopener noreferrer">Ping</Link>
        <Link className="underline underline-offset-4" href="/api/go-ping" target="_blank" rel="noopener noreferrer">Go Ping</Link>
        <Link className="underline underline-offset-4" href="/api/edge-time" target="_blank" rel="noopener noreferrer">Edge</Link>
      </div>
    </div>
  );
}
