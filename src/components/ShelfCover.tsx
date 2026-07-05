import Image from "next/image";
import type { ShelfItem } from "@/data/shelf";

/**
 * Cover artwork for a shelf item.
 *
 * When `item.image` is set, the real cover is rendered with `object-cover`
 * so every card displays an identical 3:4 framed area — no stretching,
 * consistent cropping across books and papers. While covers are pending,
 * a consistent placeholder preserves the same aspect ratio and reads
 * "Cover Coming Soon". Swapping the data file's `image` field is the only
 * change needed to replace a placeholder.
 *
 * The cover uses `.brutal-card` (plain 2px border, neutral fill) without the
 * `brutal-card-stack` offset-shadow wrapper so it sits cleanly inside the
 * framed `ShelfCard` article without nested shadows.
 */
export function ShelfCover({ item }: { item: ShelfItem }) {
  return (
    <div
      className="brutal-card shelf-cover"
      aria-label={`Cover of ${item.title}`}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={`${item.title} cover`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div className="brutal-card-placeholder">
          <p className="brutal-card-placeholder-sub">Cover Coming Soon</p>
        </div>
      )}
    </div>
  );
}
