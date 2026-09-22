import { ImageResponse } from "next/og";

// The icon iOS uses when someone adds Health Journal to their home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f766e",
        }}
      >
        {/* Same heartbeat line as app/icon.svg, scaled up from its 24px viewBox. */}
        <svg width="128" height="128" viewBox="0 0 24 24">
          <path
            d="M4.6 12.6h2.7l1.15-2.3 1.75 4.1 1.55-5.15 1.35 3.35h5.4"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
