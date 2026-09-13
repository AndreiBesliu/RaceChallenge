import type { Metadata } from "next";
import "./globals.css";
import "./retro.css";

export const metadata: Metadata = {
  title: "Michelin Race Challenge | Paddock",
  description: "Curse slot-car, dueluri de 8 tururi și o comunitate de piloți.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="antialiased">{children}</body>
    </html>
  );
}
