import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Halloween Game - Parole Maledette",
  description: "Un gioco da tavolo per la notte di Halloween",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased bg-[#050608] text-slate-100 selection:bg-orange-500/30">
        {children}
      </body>
    </html>
  );
}