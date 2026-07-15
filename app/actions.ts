"use server";

import { revalidatePath } from "next/cache";
import { createClient, hasSupabaseEnv } from "./lib/supabase";
import { isNoteColor } from "./lib/notes";

export type AddNoteState = { ok: boolean; error?: string };

export async function addNote(
  _prevState: AddNoteState,
  formData: FormData,
): Promise<AddNoteState> {
  // Server Actions are reachable via direct POST, so validate everything here.
  const message = String(formData.get("message") ?? "").trim();
  const authorInput = String(formData.get("author") ?? "").trim();
  const color = formData.get("color");

  if (message.length === 0) {
    return { ok: false, error: "Please write a message before pinning." };
  }
  if (message.length > 1000) {
    return { ok: false, error: "That message is a bit too long (max 1000 characters)." };
  }

  const author = authorInput.length > 0 ? authorInput.slice(0, 80) : "Anonymous";
  const noteColor = isNoteColor(color) ? color : "yellow";

  if (!hasSupabaseEnv()) {
    return { ok: false, error: "The wall isn't connected to its database yet." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("notes")
      .insert({ message, author, color: noteColor });

    if (error) {
      return { ok: false, error: "Couldn't pin your note. Please try again." };
    }
  } catch {
    return { ok: false, error: "Couldn't pin your note. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
