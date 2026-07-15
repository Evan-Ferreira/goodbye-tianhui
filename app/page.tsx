import LeaveNote from "./components/LeaveNote";
import { createClient, hasSupabaseEnv } from "./lib/supabase";
import { NOTE_THEMES, isNoteColor, type Note } from "./lib/notes";

export const dynamic = "force-dynamic";

async function getNotes(): Promise<Note[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: String(row.id),
      message: String(row.message),
      author: String(row.author ?? "Anonymous"),
      color: isNoteColor(row.color) ? row.color : "yellow",
      created_at: String(row.created_at),
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const notes = await getNotes();

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-variant/30">
        <div className="h-20 w-full px-4 md:px-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px] -rotate-12">
              celebration
            </span>
            <span className="font-display-lg text-[20px] md:text-[24px] text-primary tracking-tight">
              Cheers, Tianhui!
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              aria-current="page"
              className="font-headline-md text-[18px] bg-secondary-container text-on-secondary-container -rotate-1 shadow-sm px-4 py-2 rounded-[0.5rem]"
              href="#"
            >
              Farewell Wall
            </a>
            <a
              className="font-headline-md text-[18px] text-on-surface-variant hover:text-primary transition-all px-2"
              href="#"
            >
              Memory Gallery
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-[0.75rem] bg-primary flex items-center justify-center shadow-sm rotate-3">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-28 bg-transparent min-h-screen relative">
        <div className="flex flex-col w-full min-h-screen">
          {/* Header Area */}
          <section className="relative px-4 md:px-16 mb-12">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-end justify-between gap-8 relative z-10">
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-primary uppercase tracking-[0.2em] mb-2 bg-primary-fixed px-3 py-1 self-start rounded-[0.75rem]">
                  Community Board
                </span>
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                  Goodbye &amp; Good Luck,{" "}
                  <span className="text-primary underline decoration-dashed decoration-outline-variant underline-offset-8">
                    Tianhui!
                  </span>{" "}
                  💌
                </h1>
                <p className="font-body-lg text-on-surface-variant max-w-xl">
                  The office won&apos;t be the same without your brilliant ideas and morning
                  coffee chats. Leave a little piece of your heart for Tianhui below.
                </p>
              </div>
              <LeaveNote />
            </div>
          </section>

          {/* The "Corkboard" Grid */}
          <section className="relative px-4 md:px-16 pb-24">
            {notes.length === 0 ? (
              <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center text-center py-24 gap-4">
                <span className="material-symbols-outlined text-primary/40 text-[96px]">
                  edit_note
                </span>
                <p className="font-handwritten-note text-handwritten-note text-on-surface-variant max-w-md">
                  The wall is empty for now — be the first to pin a note for Tianhui!
                </p>
              </div>
            ) : (
              <div className="max-w-[1200px] mx-auto columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {notes.map((note) => {
                  const theme = NOTE_THEMES[note.color];
                  return (
                    <div
                      key={note.id}
                      className={`break-inside-avoid group relative ${theme.card} p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:rotate-1 flex flex-col justify-between border-t-8 border-black/5`}
                    >
                      <span
                        className={`material-symbols-outlined absolute top-2 right-2 ${theme.pin}`}
                      >
                        push_pin
                      </span>
                      <div
                        className={`font-handwritten-note ${theme.text} text-handwritten-note mb-6 whitespace-pre-wrap break-words`}
                      >
                        {note.message}
                      </div>
                      <div
                        className={`flex items-center justify-between border-t ${theme.border} pt-4`}
                      >
                        <span className={`font-label-sm ${theme.author}`}>
                          — {note.author}
                        </span>
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          favorite
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest py-16 border-t border-dashed border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-secondary-fixed-dim">favorite</span>
            <span className="material-symbols-outlined text-primary-fixed-dim">auto_awesome</span>
            <span className="material-symbols-outlined text-tertiary-fixed-dim">potted_plant</span>
          </div>
          <p className="font-handwritten-note text-on-surface-variant">
            Wishing you the best on your next adventure.
          </p>
        </div>
      </footer>
    </>
  );
}
