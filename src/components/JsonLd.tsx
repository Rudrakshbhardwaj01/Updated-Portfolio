type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Server-rendered JSON-LD structured data.
 *
 * `JSON.stringify` output is additionally escaped (`<` → `\u003c`) so that a
 * value containing `</script>` can never terminate the script block early.
 * All data comes from trusted repository content — nothing here accepts
 * request input.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
