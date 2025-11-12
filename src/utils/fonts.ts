import localFont from "next/font/local";

// Gotham Narrow from local font files - matching pwa-arielbath (only 400, 600, 700)
// Paths are relative to the file location (src/utils/fonts.ts)
export const GothamNarrowFont = localFont({
  src: [
    {
      path: "../../public/fonts/GothamNarrow/GothamNarrow-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GothamNarrow/GothamNarrow-Medium.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/GothamNarrow/GothamNarrow-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gotham-narrow",
  display: "swap",
});
