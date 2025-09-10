"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Ensure server components re-fetch without auth cookie, then navigate
    router.refresh();
    router.replace("/auth/login");
  };

  return <Button onClick={logout}>Logout</Button>;
}
