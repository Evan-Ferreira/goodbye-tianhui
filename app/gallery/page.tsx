import AddPhoto from '../components/AddPhoto';
import PhotoCard from '../components/PhotoCard';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { createClient, hasSupabaseEnv } from '../lib/supabase';
import { PHOTO_BUCKET, type Photo } from '../lib/photos';

export const dynamic = 'force-dynamic';

type GalleryPhoto = Photo & { url: string };

async function getPhotos(): Promise<GalleryPhoto[]> {
    if (!hasSupabaseEnv()) return [];
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });
        if (error || !data) return [];
        return data.map((row) => {
            const storage_path = String(row.storage_path);
            const { data: pub } = supabase.storage
                .from(PHOTO_BUCKET)
                .getPublicUrl(storage_path);
            return {
                id: String(row.id),
                author: String(row.author ?? 'Anonymous'),
                description: String(row.description ?? ''),
                storage_path,
                created_at: String(row.created_at),
                url: pub.publicUrl,
            };
        });
    } catch {
        return [];
    }
}

// Alternating tilt for the corkboard feel.
const ROTATIONS = ['-rotate-1', 'rotate-1', 'rotate-2', '-rotate-2'];

export default async function Gallery() {
    const photos = await getPhotos();

    return (
        <>
            <SiteHeader active="gallery" />

            <main className="w-full pt-28 bg-transparent min-h-screen relative">
                <div className="flex flex-col w-full min-h-screen">
                    {/* Header Area */}
                    <section className="relative px-4 md:px-16 mb-12">
                        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-end justify-between gap-8 relative">
                            <div className="flex flex-col gap-2">
                                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                                    Moments with{' '}
                                    <span className="text-primary underline decoration-dashed decoration-outline-variant underline-offset-8">
                                        Tianhui
                                    </span>{' '}
                                    📸
                                </h1>
                                <p className="font-body-lg text-on-surface-variant max-w-xl">
                                    Pin your favorite snapshots — offsites,
                                    lunches, whiteboard sessions. Add a photo
                                    and a few words to remember it by.
                                </p>
                            </div>
                            <AddPhoto />
                        </div>
                    </section>

                    {/* The polaroid grid */}
                    <section className="relative px-4 md:px-16 pb-24">
                        {photos.length === 0 ? (
                            <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center text-center py-24 gap-4">
                                <span className="material-symbols-outlined text-primary/40 text-[96px]">
                                    photo_camera
                                </span>
                                <p className="font-handwritten-note text-handwritten-note text-on-surface-variant max-w-md">
                                    No memories yet — share the first photo of
                                    Tianhui!
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-[1200px] mx-auto columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                                {photos.map((photo, i) => (
                                    <PhotoCard
                                        key={photo.id}
                                        photo={photo}
                                        rotation={
                                            ROTATIONS[i % ROTATIONS.length]
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <SiteFooter />
        </>
    );
}
