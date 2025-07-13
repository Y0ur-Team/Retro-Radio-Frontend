import type { Metadata } from "next";
import { Figtree, Bricolage_Grotesque,Press_Start_2P } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const pressStart2P = Press_Start_2P({
  variable: "--font-Press-start2P",
  weight: "400",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Retro Radio",
  description: "Retro Radio - Radio streaming, real-time Radio Cara from GTA V.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} ${bricolage.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
