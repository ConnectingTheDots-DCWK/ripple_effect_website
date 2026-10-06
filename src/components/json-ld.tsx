/**
 * One `application/ld+json` block.
 *
 * The `<` escape is the only thing here that is not obvious: a `</script>`
 * appearing inside a JSON string would end the element early, and while
 * nothing on this site takes structured data from a stranger, the escape
 * costs a character and removes the class of bug entirely.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
