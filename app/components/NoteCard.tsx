import { NOTE_THEMES, type Note } from "../lib/notes";

export default function NoteCard({ note }: { note: Note }) {
  const theme = NOTE_THEMES[note.color];

  return (
    <div
      className={`break-inside-avoid group relative ${theme.card} p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:rotate-1 flex flex-col justify-between border-t-8 border-black/5`}
    >
      <span
        className={`material-symbols-outlined absolute top-2 right-2 ${theme.pin}`}
      >
        push_pin
      </span>
      <div
        className={`font-handwritten-note ${theme.text} text-handwritten-note mb-6 mt-6 whitespace-pre-wrap break-words`}
      >
        {note.message}
      </div>
      <div className={`flex items-center justify-between border-t ${theme.border} pt-4`}>
        <span className={`font-label-sm ${theme.author}`}>— {note.author}</span>
        <span className="material-symbols-outlined text-primary text-[20px]">favorite</span>
      </div>
    </div>
  );
}
