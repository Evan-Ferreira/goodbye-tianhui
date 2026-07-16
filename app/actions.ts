"use server";

import { revalidatePath } from "next/cache";
import { createClient, hasSupabaseEnv } from "./lib/supabase";
import { isNoteColor } from "./lib/notes";
import { PHOTO_BUCKET } from "./lib/photos";

export type ActionState = { ok: boolean; error?: string };
export type AddNoteState = ActionState;

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

export async function addPhoto(
  _prevState: AddNoteState,
  formData: FormData,
): Promise<AddNoteState> {
  // The file itself is uploaded to Storage directly from the browser; this
  // action only records the metadata row. Validate everything here.
  const authorInput = String(formData.get("author") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const storagePath = String(formData.get("storage_path") ?? "").trim();

  if (storagePath.length === 0) {
    return { ok: false, error: "Something went wrong with the upload. Please try again." };
  }
  if (description.length > 500) {
    return { ok: false, error: "That description is a bit too long (max 500 characters)." };
  }

  const author = authorInput.length > 0 ? authorInput.slice(0, 80) : "Anonymous";

  if (!hasSupabaseEnv()) {
    return { ok: false, error: "The gallery isn't connected to its database yet." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("photos")
      .insert({ author, description, storage_path: storagePath });

    if (error) {
      return { ok: false, error: "Couldn't add your photo. Please try again." };
    }
  } catch {
    return { ok: false, error: "Couldn't add your photo. Please try again." };
  }

  revalidatePath("/gallery");
  return { ok: true };
}

export async function updateNote(input: {
  id: string;
  message: string;
  author: string;
  color: string;
}): Promise<ActionState> {
  const id = String(input.id ?? "").trim();
  const message = String(input.message ?? "").trim();
  const authorInput = String(input.author ?? "").trim();

  if (!id) {
    return { ok: false, error: "Couldn't find that note." };
  }
  if (message.length === 0) {
    return { ok: false, error: "Please write a message before saving." };
  }
  if (message.length > 1000) {
    return { ok: false, error: "That message is a bit too long (max 1000 characters)." };
  }

  const author = authorInput.length > 0 ? authorInput.slice(0, 80) : "Anonymous";
  const color = isNoteColor(input.color) ? input.color : "yellow";

  if (!hasSupabaseEnv()) {
    return { ok: false, error: "The wall isn't connected to its database yet." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("notes")
      .update({ message, author, color })
      .eq("id", id);

    if (error) {
      return { ok: false, error: "Couldn't save your changes. Please try again." };
    }
  } catch {
    return { ok: false, error: "Couldn't save your changes. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteNote(id: string): Promise<ActionState> {
  const noteId = String(id ?? "").trim();
  if (!noteId) {
    return { ok: false, error: "Couldn't find that note." };
  }
  if (!hasSupabaseEnv()) {
    return { ok: false, error: "The wall isn't connected to its database yet." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (error) {
      return { ok: false, error: "Couldn't delete this note. Please try again." };
    }
  } catch {
    return { ok: false, error: "Couldn't delete this note. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function updatePhoto(input: {
  id: string;
  author: string;
  description: string;
}): Promise<ActionState> {
  const id = String(input.id ?? "").trim();
  const authorInput = String(input.author ?? "").trim();
  const description = String(input.description ?? "").trim();

  if (!id) {
    return { ok: false, error: "Couldn't find that photo." };
  }
  if (description.length > 500) {
    return { ok: false, error: "That description is a bit too long (max 500 characters)." };
  }

  const author = authorInput.length > 0 ? authorInput.slice(0, 80) : "Anonymous";

  if (!hasSupabaseEnv()) {
    return { ok: false, error: "The gallery isn't connected to its database yet." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("photos")
      .update({ author, description })
      .eq("id", id);

    if (error) {
      return { ok: false, error: "Couldn't save your changes. Please try again." };
    }
  } catch {
    return { ok: false, error: "Couldn't save your changes. Please try again." };
  }

  revalidatePath("/gallery");
  return { ok: true };
}

export async function deletePhoto(id: string, storagePath: string): Promise<ActionState> {
  const photoId = String(id ?? "").trim();
  const path = String(storagePath ?? "").trim();

  if (!photoId) {
    return { ok: false, error: "Couldn't find that photo." };
  }
  if (!hasSupabaseEnv()) {
    return { ok: false, error: "The gallery isn't connected to its database yet." };
  }

  try {
    const supabase = createClient();
    // Delete the metadata row first so it leaves the gallery immediately...
    const { error } = await supabase.from("photos").delete().eq("id", photoId);
    if (error) {
      return { ok: false, error: "Couldn't delete this photo. Please try again." };
    }
    // ...then best-effort remove the underlying file from Storage.
    if (path) {
      await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    }
  } catch {
    return { ok: false, error: "Couldn't delete this photo. Please try again." };
  }

  revalidatePath("/gallery");
  return { ok: true };
}
