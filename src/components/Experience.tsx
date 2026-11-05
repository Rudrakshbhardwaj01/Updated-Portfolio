import { experiences } from "@/data/experience";
import { SectionHeading } from "./SectionHeading";

/* Deterministic PRNG so each company gets its own stable barcode pattern. */
function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Barcode({ seed, label }: { seed: string; label: string }) {
  const rand = mulberry32(hashSeed(seed));
  const bars: { x: number; w: number }[] = [];
  const totalWidth = 220;
  let x = 4;
  while (x < totalWidth - 4) {
    const w = 1 + Math.floor(rand() * rand() * 5); // biased toward thin bars
    bars.push({ x, w });
    x += w + 1 + Math.floor(rand() * 3);
  }

  return (
    <svg
      className="ticket-barcode"
      viewBox={`0 0 ${totalWidth} 64`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`${label} barcode`}
    >
      {bars.map((bar, i) => (
        <rect key={i} x={bar.x} y={0} width={bar.w} height={64} fill="currentColor" />
      ))}
    </svg>
  );
}

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="section section-featured"
    >
      <br></br>
      <SectionHeading id="experience-heading" featured>
        Experience
      </SectionHeading>

      <ol className="space-y-10">
        {experiences.map((item) => (
          <li key={`${item.company}-${item.period}`} className="ticket">
            <div className="ticket-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.imageAlt} loading="lazy" />
            </div>

            <div className="ticket-body">
              <p className="brutal-label">{item.period}</p>

              <p className="ticket-title brutal-role-title mt-3">
                {item.role}
                <span className="font-mono text-[0.55em] font-normal tracking-widest text-secondary">
                  {" "}
                  @{" "}
                </span>
                {item.companyUrl ? (
                  <a
                    href={item.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-display-link"
                  >
                    {item.company}
                  </a>
                ) : (
                  item.company
                )}
              </p>

              <p className="brutal-body-lg mt-4 max-w-2xl">{item.description}</p>
            </div>

            <div className="ticket-stub">
              <p className="ticket-serial">{item.serial}</p>
              <Barcode seed={item.company} label={item.company} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
