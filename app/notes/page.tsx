import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NotesLive } from "@/components/notes-live";
import { NotesTable } from "@/components/notes-table";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id,title,created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  async function addNote(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "").trim();
    if (!title) return;
    const supabase = await createClient();
    await supabase.from("notes").insert({ title });
    revalidatePath("/notes");
  }

  async function deleteNote(formData: FormData) {
    "use server";
    const idRaw = formData.get("id");
    const id = Number(idRaw);
    if (!Number.isFinite(id)) return;
    const supabase = await createClient();
    await supabase.from("notes").delete().eq("id", id);
    revalidatePath("/notes");
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <NotesLive />
      <h1 className="text-2xl font-bold">Notes</h1>
      {error ? (
        <pre className="text-red-500">{error.message}</pre>
      ) : (
        <NotesTable notes={notes ?? []} addNote={addNote} deleteNote={deleteNote} />
      )}
      <div className="text-xs text-muted-foreground">
        Tips: If insert/delete fails due to RLS, add policies for
        <code> insert </code> and <code> delete </code> to
        <code> authenticated </code>.
      </div>
    </div>
  );
}
