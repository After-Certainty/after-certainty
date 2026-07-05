import {
  SCHEMA_ORG_CONTEXT,
  type JsonLdDocument,
  type JsonLdNode,
  type JsonLdStandaloneDocument,
} from "@/lib/seo/json-ld";

export type JsonLdData =
  | JsonLdStandaloneDocument
  | JsonLdStandaloneDocument[]
  | JsonLdDocument
  | JsonLdNode
  | JsonLdNode[];

function serializeJsonLd(data: JsonLdStandaloneDocument): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function toStandaloneDocuments(data: JsonLdData): JsonLdStandaloneDocument[] {
  if (Array.isArray(data)) {
    return data.flatMap((item) => toStandaloneDocuments(item));
  }

  if ("@graph" in data && Array.isArray(data["@graph"])) {
    return data["@graph"].map((node) => ({
      "@context": SCHEMA_ORG_CONTEXT,
      ...node,
    }));
  }

  if ("@context" in data) {
    return [data as JsonLdStandaloneDocument];
  }

  return [
    {
      "@context": SCHEMA_ORG_CONTEXT,
      ...(data as JsonLdNode),
    },
  ];
}

export function JsonLd({ data }: { data: JsonLdData }) {
  const documents = toStandaloneDocuments(data);

  return (
    <>
      {documents.map((doc, index) => (
        <script
          key={String(doc["@id"] ?? doc["@type"] ?? index)}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(doc) }}
        />
      ))}
    </>
  );
}
