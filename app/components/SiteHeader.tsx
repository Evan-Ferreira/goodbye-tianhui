import Link from 'next/link';

const ACTIVE_LINK =
    'font-headline-md text-[13px] md:text-[18px] bg-secondary-container text-on-secondary-container -rotate-1 shadow-sm px-3 py-1.5 md:px-4 md:py-2 rounded-[0.5rem]';
const INACTIVE_LINK =
    'font-headline-md text-[13px] md:text-[18px] text-on-surface-variant hover:text-primary transition-all px-1 md:px-2';

export default function SiteHeader({ active }: { active: 'wall' | 'gallery' }) {
    return (
        <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-variant/30">
            <div className="h-20 w-full px-4 md:px-16 flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span className="material-symbols-outlined text-primary text-[32px] -rotate-12">
                        celebration
                    </span>
                    <span className="hidden sm:inline font-display-lg text-[20px] md:text-[24px] text-primary tracking-tight">
                        Cheers, Tianhui!
                    </span>
                </Link>
                <nav className="flex items-center gap-2 md:gap-8">
                    <Link
                        href="/"
                        aria-current={active === 'wall' ? 'page' : undefined}
                        className={
                            active === 'wall' ? ACTIVE_LINK : INACTIVE_LINK
                        }
                    >
                        Farewell Wall
                    </Link>
                    <Link
                        href="/gallery"
                        aria-current={active === 'gallery' ? 'page' : undefined}
                        className={
                            active === 'gallery' ? ACTIVE_LINK : INACTIVE_LINK
                        }
                    >
                        Memory Gallery
                    </Link>
                </nav>
            </div>
        </header>
    );
}
