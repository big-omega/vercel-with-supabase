"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type NoteRow = {
  id: number;
  title: string | null;
  created_at: string | null;
};

type Props = {
  notes: NoteRow[] | null;
  addNote: (formData: FormData) => void;
  deleteNote: (formData: FormData) => void;
};

type Mode = "absolute" | "relative";

export function NotesTable({ notes, addNote, deleteNote }: Props) {
  const [mode, setMode] = useState<Mode>("absolute");

  const rows = useMemo(() => notes ?? [], [notes]);

  return (
    <>
      <form action={addNote} className="flex gap-2 items-center">
        <Input type="text" name="title" placeholder="New note title" className="w-80" />
        <Button type="submit">Add</Button>
      </form>

      <div className="flex items-center gap-2 text-xs text-foreground/80">
        <span>Time:</span>
        <button
          className={`px-2 py-1 rounded border ${mode === "absolute" ? "bg-accent" : ""}`}
          onClick={() => setMode("absolute")}
          type="button"
        >
          YYYY/MM/DD HH:mm (UTC+8)
        </button>
        <button
          className={`px-2 py-1 rounded border ${mode === "relative" ? "bg-accent" : ""}`}
          onClick={() => setMode("relative")}
          type="button"
        >
          Relative (e.g. 5分钟前)
        </button>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">ID</th>
              <th className="text-left px-4 py-2 font-medium">Created</th>
              <th className="text-left px-4 py-2 font-medium">Title</th>
              <th className="text-left px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.id} className="border-t">
                <td className="px-4 py-2 align-top tabular-nums">{n.id}</td>
                <td className="px-4 py-2 align-top whitespace-nowrap tabular-nums">
                  {mode === "relative" ? formatRelativeZh(n.created_at) : formatUtc8(n.created_at)}
                </td>
                <td className="px-4 py-2 align-top">{n.title}</td>
                <td className="px-4 py-2 align-top">
                  <form action={deleteNote}>
                    <input type="hidden" name="id" value={n.id} />
                    <Button variant="destructive" size="sm">Delete</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function formatUtc8(iso?: string | null) {
  if (!iso) return "-";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "-";
  const tzOffsetMs = 8 * 60 * 60 * 1000; // UTC+8
  const d = new Date(t + tzOffsetMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}

function formatRelativeZh(iso?: string | null) {
  if (!iso) return "-";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "-";
  const now = Date.now();
  const diffMs = Math.max(0, now - t);
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  return `${d}天前`;
}

