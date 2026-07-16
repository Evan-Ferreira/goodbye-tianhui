export default function SiteFooter() {
  return (
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
  );
}
