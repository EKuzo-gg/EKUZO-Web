/**
 * Server component that renders a JSON-LD <script> tag in the HTML source.
 *
 * Why server-rendered: AI crawlers (and Google) may delay processing of
 * JS-injected structured data. Keep JSON-LD in the initial HTML response.
 *
 * Why the escape: JSON.stringify can emit the literal sequence `</script>`
 * (or `</`) inside string fields, which would close the script tag early
 * and break the page. Escaping `<` to `\u003c` is the standard fix — the
 * output is still valid JSON, just HTML-safe.
 */
export default function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
