import type { ShelfItem } from "@/data/shelf";
import { ShelfCover } from "./ShelfCover";

/**
 * A single curated entry on the Shelf.
 *
 * Layout: cover on top, then title / author / description, and finally a
 * type pill (Book / Paper). The whole card lifts on hover using the
 * brutalist shadow vocabulary already in use across the site.
 */
interface ShelfCardProps {
  item: ShelfItem;
  onCoverClick?: (imageSrc: string, imageAlt: string) => void;
}

export function ShelfCard({ item, onCoverClick }: ShelfCardProps) {
  const titleContent = (
    <h3 className="brutal-project-title text-primary transition-colors duration-300 group-hover:text-accent">
      {item.title}
    </h3>
  );

  const handleCoverClick = () => {
    if (item.image && onCoverClick) {
      onCoverClick(item.image, `${item.title} cover`);
    }
  };

  return (
    <article className="group shelf-card">
      <ShelfCover item={item} onClick={handleCoverClick} />

      <div className="mt-4">
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2"
          >
            {titleContent}
          </a>
        ) : (
          titleContent
        )}

        <p className="brutal-label mt-1.5">{item.author}</p>

        <p className="brutal-body mt-2">{item.description}</p>

        <div className="mt-4">
          <span className="brutal-tech-pill">{item.type}</span>
        </div>
      </div>
    </article>
  );
}
