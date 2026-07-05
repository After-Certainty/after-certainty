import type { JsonLdDocument, JsonLdNode } from "@/lib/seo/json-ld";

type JsonLdData = JsonLdDocument | JsonLdNode | JsonLdNode[];

function serializeJsonLd(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
  );
}
