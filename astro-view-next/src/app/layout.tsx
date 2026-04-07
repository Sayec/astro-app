import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "AstroView 🔭",
  description: "AstroView – Twój osobisty dashboard astronomiczny. Prognoza astropogody, faza Księżyca, zdjęcie dnia NASA, widoczne satelity i galeria astrofotografii.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={spaceGrotesk.className}>
      <body>{children}</body>
    </html>
  );
}
