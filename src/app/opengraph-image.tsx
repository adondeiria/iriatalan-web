import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Iria Talan / RIF — Planeación Patrimonial, Seguros y Retiro en México";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#14110F",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(158,27,30,0.35) 0%, rgba(158,27,30,0.08) 35%, transparent 65%), radial-gradient(circle at 15% 90%, rgba(184,149,106,0.18) 0%, transparent 60%)",
          padding: "80px 90px",
          color: "#F5EFE6",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#C8403F",
            fontWeight: 600,
          }}
        >
          Iria Talan · RIF
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 300,
              color: "#F5EFE6",
              maxWidth: 980,
            }}
          >
            Planeación patrimonial, seguros y retiro en México.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "rgba(245,239,230,0.75)",
              maxWidth: 900,
              fontFamily: "sans-serif",
              fontWeight: 400,
            }}
          >
            Asesora independiente · MDRT Top of the Table · Cédula CNSF V388618
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(245,239,230,0.6)",
            fontFamily: "sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          <span>iriatalan.com.mx</span>
          <span>Yale Wealth Management · LSE MBA Essentials</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
