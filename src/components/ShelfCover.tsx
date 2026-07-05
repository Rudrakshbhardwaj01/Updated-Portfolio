import Image from "next/image";
import type { ShelfItem } from "@/data/shelf";

interface ShelfCoverProps {
  item: ShelfItem;
  onClick?: () => void;
}

/**
 * Cover artwork for a shelf item.
 *
 * Every cover sits inside an identical 4:5 container with equal padding.
 * Images use `object-fit: contain` so the full cover is visible without
 * cropping. Placeholders preserve the same aspect ratio and padding.
 */
export function ShelfCover({ item, onClick }: ShelfCoverProps) {
  const handleClick = onClick ? (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  } : undefined;

  return (
    <div
      className="brutal-card shelf-cover"
      aria-label={`Cover of ${item.title}`}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={`${item.title} cover`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain"
        />
      ) : (
        <div className="brutal-card-placeholder">
          <p className="brutal-card-placeholder-sub">Cover Coming Soon</p>
        </div>
      )}
    </div>
  );
}
