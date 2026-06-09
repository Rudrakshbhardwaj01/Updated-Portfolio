import { siteConfig } from "@/data/site";

export function Ticker() {
  const items = siteConfig.ticker;
  const sequence = [...items, ...items];

  return (
    <div
      className="ticker-wrap border-b-2 border-foreground bg-background"
      aria-hidden="true"
    >
      <div className="ticker-track font-mono text-sm font-medium tracking-widest text-foreground uppercase">
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className="ticker-item">
            {item}
            <span className="ticker-dot">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
