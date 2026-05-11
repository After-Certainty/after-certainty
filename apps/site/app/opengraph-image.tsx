import { ImageResponse } from "next/og";

export const alt = "After Certainty";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(150deg, #050506 0%, #101018 50%, #050506 100%)",
          color: "#ece8e1",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 68,
            letterSpacing: "0.18em",
            fontWeight: 500,
            textTransform: "uppercase" as const,
          }}
        >
          After Certainty
        </div>
        <div
          style={{
            marginTop: 32,
            maxWidth: 720,
            fontSize: 28,
            lineHeight: 1.35,
            color: "#b8b2a6",
          }}
        >
          Meaning, trust, leadership, and human systems in a world beyond certainty.
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 16,
            letterSpacing: "0.35em",
            textTransform: "uppercase" as const,
            color: "#c9a962",
          }}
        >
          Publishing · podcast · patterns
        </div>
      </div>
    ),
    { ...size },
  );
}
